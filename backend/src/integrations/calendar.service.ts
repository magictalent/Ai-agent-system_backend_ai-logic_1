import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class CalendarService {
  private oauth2Client;

  constructor() {
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
}
