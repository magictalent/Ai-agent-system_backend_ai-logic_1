import { Inject, Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class CalendarService {
  private oauth2Client;
  private readonly SHARED_CLIENT_ID = '00000000-0000-0000-0000-000000000001';

  constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // You’ll use this after OAuth
  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  async createEvent(event: {
    summary: string;
    description: string;
    startTime: string;
    attendees: { email: string }[];
  }) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const newEvent = {
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.startTime },
      end: {
        dateTime: new Date(new Date(event.startTime).getTime() + 30 * 60000).toISOString(),
      },
      attendees: event.attendees,
    };

    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: newEvent,
    });

    return res.data;
  }

  // Convenience: load tokens from Supabase by clientId and create event
  async createEventForClient(clientId: string, event: {
    summary: string;
    description: string;
    startTime: string;
    attendees: { email: string }[];
  }) {
    // Try per-client first
    let tokenData: any = null;
    try {
      const res = await this.supabase
        .from('google_tokens')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();
      if (!res.error && res.data) tokenData = res.data;
    } catch {}
    // Fallback to shared
    if (!tokenData) {
      const { data: shared } = await this.supabase
        .from('google_tokens')
        .select('*')
        .eq('client_id', this.SHARED_CLIENT_ID)
        .maybeSingle();
      if (!shared) {
        throw new Error('No Google tokens found. Connect Google in Integrations.');
      }
      tokenData = shared;
    }
    this.setCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry_date: tokenData.expiry_date,
    });
    return this.createEvent(event);
  }
}
