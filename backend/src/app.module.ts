import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { CrmModule } from './crm/crm.module';
import { ClientsModule } from './clients/clients.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { GmailService } from './integrations/gmail.service';
import { CalendarService } from './integrations/calendar.service';
import { IntegrationsModule } from './integrations/integrations.module';
import { SupabaseModule } from './supabase/supabase.module';
import { SupabaseAuthGuard } from './auth/supabase-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'], // ✅ this line makes it look in /backend
    }), 
    SupabaseModule, 
    AuthModule,
    AiModule, 
    CrmModule, 
    ClientsModule, 
    CampaignsModule,
    IntegrationsModule,
  ],
  providers: [
    GmailService, 
    CalendarService,
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
  ],
})
export class AppModule { }
