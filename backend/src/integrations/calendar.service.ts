import { Inject, Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class CalendarService {
  private oauth2Client;

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
    const { data: tokenData, error } = await this.supabase
      .from('google_tokens')
      .select('*')
      .eq('client_id', clientId)
      .single();
    if (error || !tokenData) {
      throw new Error('No Google tokens found for this client. Please connect Google in Integrations.');
    }
    this.setCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry_date: tokenData.expiry_date,
    });
    return this.createEvent(event);
  }
}
