import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { HubspotService } from './hubspot.service';
import { MockService } from './mock.service';
import { CrmController } from './crm.controller';

@Module({
  controllers: [CrmController],
  providers: [CrmService, MockService, HubspotService],
  exports: [CrmService],
})
export class CrmModule {}

