import { Module } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { CalendarService } from './calendar.service';
import { GoogleAuthController } from './google-auth.controller';

@Module({
  controllers: [GoogleAuthController],
  providers: [GmailService, CalendarService],
  exports: [GmailService, CalendarService],
})
export class IntegrationsModule {}
