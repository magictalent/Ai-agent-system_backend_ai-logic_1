import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module';
import { CrmModule } from './crm/crm.module';
import { ClientsModule } from './clients/clients.module';
import { GmailService } from './integrations/gmail.service';
import { CalendarService } from './integrations/calendar.service';
import { IntegrationsModule } from './integrations/integrations.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'], // ✅ this line makes it look in /backend
    }), SupabaseModule, AiModule, CrmModule, ClientsModule, IntegrationsModule,],
  providers: [GmailService, CalendarService],
})
export class AppModule { }
