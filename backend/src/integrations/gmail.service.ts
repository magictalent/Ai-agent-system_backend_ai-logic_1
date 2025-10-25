import { Injectable, Inject } from '@nestjs/common';
import { google } from 'googleapis';
import { SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GmailService {
  constructor(
    private readonly config: ConfigService,
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

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
    clientId,
    to,
    subject,
    text,
  }: {
    clientId: string;
    to: string;
    subject: string;
    text: string;
  }) {
    // Fetch stored tokens
    const { data: tokenData, error } = await this.supabase
      .from('google_tokens')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (error || !tokenData) {
      throw new Error('No Google tokens found for this client. Please connect your Google account.');
    }

    // Create client and set credentials
    const oauth2Client = this.createOAuthClient();
    oauth2Client.setCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry_date: tokenData.expiry_date,
    });

    // Refresh token if needed
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token || tokens.access_token) {
        await this.supabase.from('google_tokens').upsert({
          client_id: clientId,
          access_token: tokens.access_token ?? tokenData.access_token,
          refresh_token: tokens.refresh_token ?? tokenData.refresh_token,
          expiry_date: tokens.expiry_date ?? tokenData.expiry_date,
        });
      }
    });

    // Send Gmail message
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      text,
    ];
    const message = messageParts.join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return { success: true, to, subject };
  }
}
