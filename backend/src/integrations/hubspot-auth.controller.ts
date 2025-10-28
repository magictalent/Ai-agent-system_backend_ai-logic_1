import { Controller, Get, Query, Res, Inject, UseGuards, Request, Headers } from '@nestjs/common';
import type { Response } from 'express';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { Public } from '../auth/public.decorator';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('hubspot/auth')
export class HubspotAuthController {
  constructor(
    private readonly config: ConfigService,
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  // Step 1: Begin OAuth (derive user from token passed via query or header)
  @Public()
  @Get('login')
  async hubspotLogin(
    @Query('token') token: string,
    @Query('returnUrl') returnUrl: string,
    @Headers('authorization') authHeader: string,
    @Res() res: Response,
  ) {
    try {
      const bearer = token || authHeader?.replace('Bearer ', '') || '';
      if (!bearer) return res.status(401).send('Missing auth token');
      const { data, error } = await this.supabase.auth.getUser(bearer);
      if (error || !data?.user?.id) return res.status(401).send('Invalid auth token');
      const userId = data.user.id;

      const clientId = this.config.get<string>('HUBSPOT_CLIENT_ID');
      const redirectUri = this.config.get<string>('HUBSPOT_REDIRECT_URI');
      const scopes = [
        // Contacts
        'crm.objects.contacts.read',
        'crm.objects.contacts.write',
        'crm.schemas.contacts.read',
        // Deals
        'crm.objects.deals.read',
        'crm.objects.deals.write',
        // Carts
        
        'crm.objects.owners.read',
      ];

    const state = encodeURIComponent(JSON.stringify({ userId, returnUrl }));
    const url = new URL('https://app.hubspot.com/oauth/authorize');
    url.searchParams.set('client_id', clientId || '');
    url.searchParams.set('redirect_uri', redirectUri || '');
    url.searchParams.set('scope', scopes.join(' '));
    url.searchParams.set('state', state);
    // Force consent screen to avoid silent auto-redirect with previous grant
    url.searchParams.set('prompt', 'consent');

      return res.redirect(url.toString());
    } catch (e) {
      return res.status(401).send('Auth failed');
    }
  }

  // Alternative: return the auth URL (no redirect) so frontend can navigate
  @Public()
  @Get('url')
  async hubspotAuthUrl(
    @Query('token') token: string,
    @Headers('authorization') authHeader: string,
  ) {
    const bearer = token || authHeader?.replace('Bearer ', '') || '';
    if (!bearer) return { ok: false, message: 'Missing auth token' };
    const { data, error } = await this.supabase.auth.getUser(bearer);
    if (error || !data?.user?.id) return { ok: false, message: 'Invalid auth token' };
    const userId = data.user.id;

    const clientId = this.config.get<string>('HUBSPOT_CLIENT_ID');
    const redirectUri = this.config.get<string>('HUBSPOT_REDIRECT_URI');
    const scopes = [
      'crm.objects.contacts.read',
      'crm.objects.contacts.write',
      'crm.schemas.contacts.read',
      'crm.objects.deals.read',
      'crm.objects.deals.write',
      'crm.objects.owners.read',
    ];

    const state = encodeURIComponent(JSON.stringify({ userId }));
    const url = new URL('https://app.hubspot.com/oauth/authorize');
    url.searchParams.set('client_id', clientId || '');
    url.searchParams.set('redirect_uri', redirectUri || '');
    url.searchParams.set('scope', scopes.join(' '));
    url.searchParams.set('state', state);
    return { ok: true, url: url.toString() };
  }

  // Introspect current user's HubSpot token (hub_id, scopes, expiry)
  @Public()
  @Get('whoami')
  async whoami(
    @Query('token') token: string,
    @Headers('authorization') authHeader: string,
  ) {
    const bearer = token || authHeader?.replace('Bearer ', '') || '';
    if (!bearer) return { ok: false, message: 'Missing auth token' };
    const { data: auth, error: authErr } = await this.supabase.auth.getUser(bearer);
    if (authErr || !auth?.user?.id) return { ok: false, message: 'Invalid token' };
    const userId = auth.user.id;

    const { data: row, error } = await this.supabase
      .from('hubspot_tokens')
      .select('access_token, expires_at, scope')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) return { ok: false, message: error.message };
    if (!row?.access_token) return { ok: false, message: 'No HubSpot token for user' };

    try {
      const info = await axios.get(`https://api.hubapi.com/oauth/v1/access-tokens/${row.access_token}`);
      const data = info.data || {};
      return {
        ok: true,
        hub_id: data.hub_id,
        user: data.user,
        token_scopes: data.scopes || row.scope,
        expires_at: row.expires_at,
      };
    } catch (e: any) {
      return { ok: false, message: e?.response?.data || e?.message || 'introspection_failed' };
    }
  }

  // Remove stored HubSpot token so user can reconnect a different portal
  @Public()
  @Get('disconnect')
  async disconnect(
    @Query('token') token: string,
    @Headers('authorization') authHeader: string,
  ) {
    const bearer = token || authHeader?.replace('Bearer ', '') || '';
    if (!bearer) return { ok: false, message: 'Missing auth token' };
    const { data: auth, error: authErr } = await this.supabase.auth.getUser(bearer);
    if (authErr || !auth?.user?.id) return { ok: false, message: 'Invalid token' };
    const userId = auth.user.id;
    // Try to revoke refresh token in HubSpot before deleting locally
    try {
      const { data: row } = await this.supabase
        .from('hubspot_tokens')
        .select('refresh_token')
        .eq('user_id', userId)
        .maybeSingle();
      const refresh = row?.refresh_token;
      if (refresh) {
        const clientId = this.config.get<string>('HUBSPOT_CLIENT_ID') || '';
        const clientSecret = this.config.get<string>('HUBSPOT_CLIENT_SECRET') || '';
        const form = new URLSearchParams();
        // HubSpot accepts either token or refresh_token depending on endpoint version
        form.set('token', refresh);
        form.set('refresh_token', refresh);
        form.set('client_id', clientId);
        form.set('client_secret', clientSecret);
        try {
          await axios.post('https://api.hubapi.com/oauth/v1/revoke', form.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          });
        } catch {
          // Ignore remote revoke errors; proceed with local delete
        }
      }
    } catch {}

    const { error } = await this.supabase.from('hubspot_tokens').delete().eq('user_id', userId);
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  }

  // Step 2: Callback stores tokens per user
  @Public()
  @Get('callback')
  async hubspotCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    if (!code) return res.status(400).send('Missing code');

    let parsed: any = {};
    try { parsed = JSON.parse(decodeURIComponent(state || '')); } catch {}
    const userId = parsed?.userId;
    const returnUrl = parsed?.returnUrl || '';
    if (!userId) return res.status(400).send('Missing userId in state');

    const tokenUrl = 'https://api.hubapi.com/oauth/v1/token';
    const clientId = this.config.get<string>('HUBSPOT_CLIENT_ID') || '';
    const clientSecret = this.config.get<string>('HUBSPOT_CLIENT_SECRET') || '';
    const redirectUri = this.config.get<string>('HUBSPOT_REDIRECT_URI') || '';

    const form = new URLSearchParams();
    form.set('grant_type', 'authorization_code');
    form.set('client_id', clientId);
    form.set('client_secret', clientSecret);
    form.set('redirect_uri', redirectUri);
    form.set('code', code);

    const resp = await axios.post(tokenUrl, form.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const tokens = resp.data || {};
    const expiresIn: number = tokens.expires_in || 0;
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

    const { error } = await this.supabase.from('hubspot_tokens').upsert(
      {
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        expires_at: expiresAt,
        scope: tokens.scope,
        token_type: tokens.token_type,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    if (error) {
      console.error('Supabase error storing hubspot tokens:', error);
      return res.status(500).send('Failed to store HubSpot tokens');
    }

    if (returnUrl) {
      try {
        const url = new URL(returnUrl);
        url.searchParams.set('hubspot', 'connected');
        return res.redirect(url.toString());
      } catch {}
    }
    return res.send(`HubSpot connected for user ${userId}`);
  }

  // Quick status for current user (Public: derive user from token)
  @Public()
  @Get('status')
  async status(
    @Query('token') token: string,
    @Headers('authorization') authHeader: string,
  ) {
    const bearer = token || authHeader?.replace('Bearer ', '') || '';
    if (!bearer) return { connected: false, error: 'Missing auth token' };
    const { data: auth, error: authErr } = await this.supabase.auth.getUser(bearer);
    if (authErr || !auth?.user?.id) return { connected: false, error: 'Invalid token' };
    const userId = auth.user.id;
    const { data, error } = await this.supabase
      .from('hubspot_tokens')
      .select('access_token, expires_at, scope')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) return { connected: false, error: error.message };
    const connected = !!data?.access_token;
    if (!connected) return { connected };

    // Try to introspect to include hub_id and scopes for clarity
    try {
      const resp = await axios.get(`https://api.hubapi.com/oauth/v1/access-tokens/${data!.access_token}`);
      const info = resp.data || {};
      return {
        connected: true,
        hub_id: info.hub_id,
        user: info.user,
        scopes: info.scopes || data?.scope,
        expires_at: data?.expires_at,
      };
    } catch {
      // Fallback without introspection
      return { connected: true, expires_at: data?.expires_at, scopes: data?.scope };
    }
  }
}
