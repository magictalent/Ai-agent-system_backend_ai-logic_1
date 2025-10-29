import { Injectable, Inject } from '@nestjs/common';
import { google } from 'googleapis';
import { SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class GmailService {
  // Use a fixed UUID as the "shared" client_id so it fits UUID columns
  private readonly SHARED_CLIENT_ID = '00000000-0000-0000-0000-000000000001';
  constructor(
    private readonly config: ConfigService,
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) { }

  // Build a transporter if SMTP is configured
  private buildSmtpTransport() {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') || 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (!host || !user || !pass) {
      console.error('[GmailService] SMTP not fully configured:', { host, port, user });
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: true,
      auth: { user, pass },
    });
  }

  // Quick health check for SMTP credentials
  async verifySmtp() {
    const transport = this.buildSmtpTransport();
    if (!transport) {
      console.error('[GmailService] SMTP transport not created (missing config)');
      return { configured: false, ok: false, message: 'SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.' };
    }
    try {
      await transport.verify();
      return { configured: true, ok: true };
    } catch (e: any) {
      console.error('[GmailService] SMTP verify failed:', e);
      return { configured: true, ok: false, message: e?.message || 'SMTP verify failed' };
    }
  }

  // Generate Google OAuth2 client dynamically
  private createOAuthClient() {
    try {
      return new google.auth.OAuth2(
        this.config.get<string>('GOOGLE_CLIENT_ID'),
        this.config.get<string>('GOOGLE_CLIENT_SECRET'),
        this.config.get<string>('GOOGLE_REDIRECT_URI'),
      );
    } catch (e) {
      console.error('[GmailService] Failed to create OAuth2 client:', e);
      throw e;
    }
  }

  private async getStoredTokens(clientId?: string) {
    const cid = (clientId && clientId.trim()) ? clientId.trim() : this.SHARED_CLIENT_ID;
    try {
      const { data, error } = await this.supabase
        .from('google_tokens')
        .select('*')
        .eq('client_id', cid)
        .maybeSingle();
      if (error || !data) {
        console.error(`[GmailService] No Google token found for client_id=${cid}:`, error);
        throw new Error(`No Google token found for client_id=${cid}`);
      }
      return data as any;
    } catch (err) {
      console.error('[GmailService] Error retrieving stored tokens:', err);
      throw err;
    }
  }

  private async ensureFreshAccessToken(tokens: any, clientId?: string) {
    const oauth2Client = this.createOAuthClient();
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    });

    const needsRefresh = !tokens.access_token || !tokens.expiry_date || Number(tokens.expiry_date) < Date.now() - 60_000;
    if (!needsRefresh) return { oauth2Client, access_token: tokens.access_token };

    try {
      const anyClient = oauth2Client as any;
      if (typeof anyClient.refreshAccessToken === 'function') {
        const { credentials } = await anyClient.refreshAccessToken();
        const newAccess = credentials.access_token;
        const expiry = credentials.expiry_date || (Date.now() + 55 * 60 * 1000);
        if (newAccess) {
          await this.supabase
            .from('google_tokens')
            .update({ access_token: newAccess, expiry_date: expiry })
            .eq('client_id', (clientId && clientId.trim()) ? clientId.trim() : this.SHARED_CLIENT_ID);
          oauth2Client.setCredentials({ access_token: newAccess, refresh_token: tokens.refresh_token, expiry_date: expiry });
          return { oauth2Client, access_token: newAccess };
        }
      }
      const res = await oauth2Client.getAccessToken();
      const newAccess = (typeof res === 'string') ? res : (res && (res as any).token);
      const expiry = Date.now() + 55 * 60 * 1000;
      if (newAccess) {
        await this.supabase
          .from('google_tokens')
          .update({ access_token: newAccess, expiry_date: expiry })
          .eq('client_id', (clientId && clientId.trim()) ? clientId.trim() : this.SHARED_CLIENT_ID);
        oauth2Client.setCredentials({ access_token: newAccess, refresh_token: tokens.refresh_token, expiry_date: expiry });
        return { oauth2Client, access_token: newAccess };
      }
    } catch (e) {
      console.error('[GmailService] Failed to refresh Google access token:', e);
      throw new Error('Failed to refresh Google access token');
    }

    console.error('[GmailService] Unable to acquire Google access token');
    throw new Error('Unable to acquire Google access token');
  }

  // Step 1: Generate authorization URL
  generateAuthUrl() {
    try {
      const oauth2Client = this.createOAuthClient();
      return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/userinfo.email',
        ],
      });
    } catch (e) {
      console.error('[GmailService] Failed to generate auth URL:', e);
      throw e;
    }
  }

  // Step 2: Exchange code for tokens and store them in Supabase
  async getToken(code: string, clientId: string) {
    try {
      const oauth2Client = this.createOAuthClient();
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Store tokens in Supabase
      const { error } = await this.supabase.from('google_tokens').upsert(
        {
          client_id: clientId,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          scope: tokens.scope,
          token_type: tokens.token_type,
          expiry_date: tokens.expiry_date,
        },
        { onConflict: 'client_id' }
      );

      if (error) {
        console.error('[GmailService] Failed to store Google tokens:', error);
        throw new Error(`Failed to store Google tokens: ${error.message}`);
      }
      return tokens;
    } catch (err) {
      console.error('[GmailService] getToken error:', err);
      throw err;
    }
  }

  // Step 3: Send email using stored credentials
  async sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
    try {
      // Use shared tokens by default
      const tokens = await this.getStoredTokens(this.SHARED_CLIENT_ID);
      const { oauth2Client } = await this.ensureFreshAccessToken(tokens, this.SHARED_CLIENT_ID);
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      const message = [
        `To: ${to}`,
        `Subject: ${subject || 'Test Email'}`,
        'Content-Type: text/plain; charset=utf-8',
        '',
        text || 'This is a test message from AI Sales Agent.',
      ].join('\n');

      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage },
      });

      console.log('✅ Gmail sent successfully to', to);
      return { success: true, to };
    } catch (err: any) {
      // Fallback to SMTP if configured
      try {
        const transport = this.buildSmtpTransport();
        if (transport) {
          await transport.sendMail({ from: this.config.get<string>('FROM_EMAIL') || 'no-reply@example.com', to, subject: subject || 'Message', text: text || '' });
          console.warn('[GmailService] OAuth send failed; fell back to SMTP for', to);
          return { success: true, to, via: 'smtp' } as any;
        }
      } catch (smtpErr) {
        console.error('[GmailService] SMTP fallback failed:', (smtpErr as any)?.message || smtpErr);
      }
      console.error('❌ Gmail send error:', err?.response?.data || err.message || err);
      throw err;
    }
  }

  // New: Send email with client scoping and token refresh
  async sendEmailForClient({ to, subject, text, clientId }: { to: string; subject: string; text: string; clientId?: string }) {
    try {
      let tokens: any;
      try {
        tokens = await this.getStoredTokens(clientId);
      } catch (e) {
        console.warn('[GmailService] No tokens for client', clientId, '— falling back to shared');
        tokens = await this.getStoredTokens(this.SHARED_CLIENT_ID);
      }
      const { oauth2Client } = await this.ensureFreshAccessToken(tokens, clientId || this.SHARED_CLIENT_ID);
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      const message = [
        `To: ${to}`,
        `Subject: ${subject || 'Test Email'}`,
        'Content-Type: text/plain; charset=utf-8',
        '',
        text || 'This is a test message from AI Sales Agent.',
      ].join('\n');

      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage },
      });

      return { success: true, to };
    } catch (err: any) {
      // Fallback to SMTP if configured
      try {
        const transport = this.buildSmtpTransport();
        if (transport) {
          await transport.sendMail({ from: this.config.get<string>('FROM_EMAIL') || 'no-reply@example.com', to, subject: subject || 'Message', text: text || '' });
          console.warn('[GmailService] sendEmailForClient OAuth failed; fell back to SMTP for', to);
          return { success: true, to, via: 'smtp' } as any;
        }
      } catch (smtpErr) {
        console.error('[GmailService] SMTP fallback failed:', (smtpErr as any)?.message || smtpErr);
      }
      console.error('[GmailService] sendEmailForClient error:', err?.response?.data || err.message || err);
      throw err;
    }
  }

  // New: Connection status helper
  async connectionStatus(clientId?: string) {
    try {
      const t = await this.getStoredTokens(clientId);
      const exp = Number(t.expiry_date || 0);
      const expiresInMs = exp ? (exp - Date.now()) : 0;
      const connected = Boolean(t.access_token || t.refresh_token);
      return { connected, client_id: (clientId && clientId.trim()) ? clientId.trim() : this.SHARED_CLIENT_ID, expires_in_ms: expiresInMs };
    } catch (e: any) {
      console.error('[GmailService] connectionStatus error:', e);
      return { connected: false, message: e?.message || 'Not connected' };
    }
  }
}
