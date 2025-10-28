import { Module } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { CalendarService } from './calendar.service';
import { GoogleAuthController } from './google-auth.controller';
import { CalendarController } from './calendar.controller';
import { EmailController } from './email.controller';
import { SmsService } from './sms.service';
import { WhatsappService } from './whatsapp.service';

@Module({
  controllers: [GoogleAuthController, CalendarController, EmailController],
  providers: [GmailService, CalendarService, SmsService, WhatsappService],
  exports: [GmailService, CalendarService, SmsService, WhatsappService],
})
export class IntegrationsModule {}
