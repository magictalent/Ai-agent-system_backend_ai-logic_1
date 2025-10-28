import { Module } from '@nestjs/common';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import { ClientsModule } from '../clients/clients.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { CrmModule } from '../crm/crm.module';
import { SequencesModule } from '../sequences/sequences.module';

@Module({
  imports: [ClientsModule, CampaignsModule, CrmModule, SequencesModule],
  controllers: [AutomationController],
  providers: [AutomationService],
  exports: [AutomationService],
})
export class AutomationModule {}

