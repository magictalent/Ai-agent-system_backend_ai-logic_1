import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { HubspotService } from './hubspot.service';
import { MockService } from './mock.service';

@Module({
  providers: [CrmService, MockService, HubspotService],
  exports: [CrmService], // ✅ make CrmService available to other modules (like AiModule)
})
export class CrmModule {}
