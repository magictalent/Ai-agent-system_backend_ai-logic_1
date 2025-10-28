import { Module } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { CalendarService } from './calendar.service';
import { GoogleAuthController } from './google-auth.controller';
import { CalendarController } from './calendar.controller';
import { EmailController } from './email.controller';
import { HubspotAuthController } from './hubspot-auth.controller';
import { SmsService } from './sms.service';
import { WhatsappService } from './whatsapp.service';

@Module({
  controllers: [GoogleAuthController, CalendarController, EmailController, HubspotAuthController],
  providers: [GmailService, CalendarService, SmsService, WhatsappService],
  exports: [GmailService, CalendarService, SmsService, WhatsappService],
})
export class IntegrationsModule {}
