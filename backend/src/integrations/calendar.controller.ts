import { Body, Controller, Post } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  @Post('book')
  async book(@Body() body: { clientId: string; leadEmail: string; startTime?: string; summary?: string; description?: string }) {
    const start = body.startTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const event = await this.calendar.createEventForClient(body.clientId, {
      summary: body.summary || 'Intro call',
      description: body.description || 'Booked via API',
      startTime: start,
      attendees: [{ email: body.leadEmail }],
    });
    return { ok: true, event };
  }
}

