import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { GmailService } from './gmail.service';
import { CalendarService } from './calendar.service';

@Controller('google/auth')
export class GoogleAuthController {
  constructor(
    private readonly gmailService: GmailService,
    private readonly calendarService: CalendarService
  ) {}

  @Get('login')
  login(@Res() res: Response) {
    const url = this.gmailService.generateAuthUrl();
    res.redirect(url);
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Res() res: Response) {
    const tokens = await this.gmailService.getToken(code);
    this.calendarService.setCredentials(tokens);
    res.send('✅ Google account connected successfully!');
  }
}