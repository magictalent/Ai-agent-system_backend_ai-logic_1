import { Injectable } from '@nestjs/common';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  private client: twilio.Twilio | null = null;
  private from: string | undefined;

  constructor() {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    this.from = process.env.TWILIO_SMS_FROM;
    if (sid && token) this.client = twilio(sid, token);
  }

  async send(to: string, body: string) {
    if (!this.client || !this.from) throw new Error('Twilio SMS not configured');
    await this.client.messages.create({ from: this.from, to, body });
    return { success: true };
  }
}

