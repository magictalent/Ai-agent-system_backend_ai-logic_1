import { Controller, Get, Query, Res, Inject } from '@nestjs/common';
import type { Response } from 'express';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';

@Controller('google/auth')
export class GoogleAuthController {
  constructor(
    private readonly config: ConfigService,
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  // 🔹 Step 1: Generate Google OAuth URL
  @Get('login')
  async googleLogin(@Query('clientId') clientId: string, @Res() res: Response) {
    if (!clientId) {
      return res.status(400).send('Missing clientId in query.');
    }

    const oauth2Client = new google.auth.OAuth2(
      this.config.get('GOOGLE_CLIENT_ID'),
      this.config.get('GOOGLE_CLIENT_SECRET'),
      this.config.get('GOOGLE_REDIRECT_URI'),
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      // ✅ Pass clientId forward to callback
      state: clientId,
    });

    return res.redirect(authUrl);
  }

  // 🔹 Step 2: Google redirects here after successful login
  @Get('callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') clientId: string,
    @Res() res: Response,
  ) {
    if (!code) return res.status(400).send('Missing code.');

    const oauth2Client = new google.auth.OAuth2(
      this.config.get('GOOGLE_CLIENT_ID'),
      this.config.get('GOOGLE_CLIENT_SECRET'),
      this.config.get('GOOGLE_REDIRECT_URI'),
    );

    const { tokens } = await oauth2Client.getToken(code);

    // ✅ Store tokens in Supabase
    const { error } = await this.supabase.from('google_tokens').upsert(
      {
        client_id: clientId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
        expiry_date: tokens.expiry_date,
      },
      { onConflict: 'client_id' },
    );

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).send('❌ Failed to store tokens.');
    }

    return res.send(`✅ Google tokens stored successfully for client ${clientId}`);
  }
}
