import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { Public } from '../auth/public.decorator';

@Controller('email')
export class EmailController {
  constructor(private readonly gmail: GmailService) { }

  @Public()
  @Get('verify')
  async verify() {
    return this.gmail.verifySmtp();
  }
  @Get('gmail/auth')
  getAuthUrl() {
    return this.gmail.generateAuthUrl();
  }

  @Public()
  @Post('send-test')
  async sendTest(
    @Body() body: { to: string; subject?: string; text?: string; clientId?: string }
  ) {
    const to = body.to;
    const subject = body.subject || 'SMTP test from AI Sales Agents';
    const text = body.text || 'This is a test message.';
    const result = await this.gmail.sendEmailForClient({ to, subject, text, clientId: body.clientId });
    return { ok: true, result };
  }

  @Public()
  @Get('gmail/status')
  async gmailStatus(@Query('clientId') clientId?: string) {
    return this.gmail.connectionStatus(clientId);
  }
}
