import { Body, Controller, Get, Post } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { Public } from '../auth/public.decorator';

@Controller('email')
export class EmailController {
  constructor(private readonly gmail: GmailService) {}

  @Public()
  @Get('verify')
  async verify() {
    return this.gmail.verifySmtp();
  }

  @Post('send-test')
  async sendTest(
    @Body() body: { to: string; subject?: string; text?: string }
  ) {
    const to = body.to;
    const subject = body.subject || 'SMTP test from AI Sales Agents';
    const text = body.text || 'This is a test message.';
    const result = await this.gmail.sendEmail({ to, subject, text });
    return { ok: true, result };
  }
}
