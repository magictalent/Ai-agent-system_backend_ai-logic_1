import { Injectable, Inject } from '@nestjs/common';
import { google } from 'googleapis';
import { SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class GmailService {
  constructor(
    private readonly config: ConfigService,
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  // Build a transporter if SMTP is configured
  private buildSmtpTransport() {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') || 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (!host || !user || !pass) return null;

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Quick health check for SMTP credentials
  async verifySmtp() {
    const transport = this.buildSmtpTransport();
    if (!transport) {
      return { configured: false, ok: false, message: 'SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.' };
    }
    try {
      await transport.verify();
      return { configured: true, ok: true };
    } catch (e: any) {
      return { configured: true, ok: false, message: e?.message || 'SMTP verify failed' };
    }
  }

  // Generate Google OAuth2 client dynamically
  private createOAuthClient() {
    return new google.auth.OAuth2(
      this.config.get<string>('GOOGLE_CLIENT_ID'),
      this.config.get<string>('GOOGLE_CLIENT_SECRET'),
      this.config.get<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  // Step 1: Generate authorization URL
  generateAuthUrl() {
    const oauth2Client = this.createOAuthClient();
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });
  }

  // Step 2: Exchange code for tokens and store them in Supabase
  async getToken(code: string, clientId: string) {
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

    if (error) throw new Error(`Failed to store Google tokens: ${error.message}`);
    return tokens;
  }

  // Step 3: Send email using stored credentials
  async sendEmail({
    to,
    subject,
    text,
  }: {
    to: string;
    subject: string;
    text: string;
  }) {
    // Prefer SMTP shared sender if configured
    const transport = this.buildSmtpTransport();
    const user = this.config.get<string>('SMTP_USER');
    const fromEmail = this.config.get<string>('FROM_EMAIL') || user;
    const fromName = this.config.get<string>('FROM_NAME') || 'AI Sales Assistant';

    if (transport && fromEmail) {
      await transport.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to,
        subject,
        text,
      });
      return { success: true, to, subject, provider: 'smtp' };
    }

    // Fallback to per-client Gmail tokens if SMTP not configured
    // For your new shared-sender setup, prefer configuring SMTP_* env vars.
    throw new Error('SMTP not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL');
  }
}
