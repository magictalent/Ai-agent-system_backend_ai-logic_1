import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { AiCampaignService } from './ai-campaign.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AiModule } from '../ai/ai.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [SupabaseModule, AiModule, ClientsModule],
  controllers: [CampaignsController],
  providers: [CampaignsService, AiCampaignService],
  exports: [CampaignsService, AiCampaignService],
})
export class CampaignsModule {}
