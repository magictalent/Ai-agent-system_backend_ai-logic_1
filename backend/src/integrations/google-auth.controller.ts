import { Controller, Get, Query, Res, Inject } from '@nestjs/common';
import type { Response } from 'express';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { Public } from '../auth/public.decorator';

@Controller('google/auth')
export class GoogleAuthController {
  constructor(
    private readonly config: ConfigService,
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  // Step 1: Generate Google OAuth URL
  @Public()
  @Get('login')
  async googleLogin(
    @Query('clientId') clientId: string,
    @Query('returnUrl') returnUrl: string,
    @Res() res: Response,
  ) {
    // Allow a shared/default connection when no clientId provided
    if (!clientId || clientId.trim() === '') {
      clientId = 'shared';
    }

    const oauth2Client = new google.auth.OAuth2(
      this.config.get<string>('GOOGLE_CLIENT_ID'),
      this.config.get<string>('GOOGLE_CLIENT_SECRET'),
      this.config.get<string>('GOOGLE_REDIRECT_URI'),
    );

    // encode state with clientId and optional returnUrl
    const state = encodeURIComponent(JSON.stringify({ clientId, returnUrl }));

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      state,
    });

    return res.redirect(authUrl);
  }

  // Step 2: Google redirects here after successful login
  @Public()
  @Get('callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    if (!code) return res.status(400).send('Missing code.');

    const oauth2Client = new google.auth.OAuth2(
      this.config.get<string>('GOOGLE_CLIENT_ID'),
      this.config.get<string>('GOOGLE_CLIENT_SECRET'),
      this.config.get<string>('GOOGLE_REDIRECT_URI'),
    );

    const { tokens } = await oauth2Client.getToken(code);

    // Parse state
    let clientId = '';
    let returnUrl = '';
    try {
      const parsed = JSON.parse(decodeURIComponent(state || ''));
      clientId = parsed?.clientId || '';
      returnUrl = parsed?.returnUrl || '';
    } catch {
      // backward-compat: state might be raw clientId
      clientId = state;
    }
    if (!clientId || clientId.trim() === '') clientId = 'shared';

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
      { onConflict: 'client_id' },
    );

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).send('❌ Failed to store tokens.');
    }

    // Redirect back to frontend if provided
    if (returnUrl) {
      try {
        const url = new URL(returnUrl);
        url.searchParams.set('gmail', 'connected');
        return res.redirect(url.toString());
      } catch {
        // ignore and fall through
      }
    }
    return res.send(`✅ Google tokens stored successfully for client ${clientId}`);
  }
}
