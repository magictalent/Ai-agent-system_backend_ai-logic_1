import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CrmService } from './crm.service';
import { Public } from '../auth/public.decorator';

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Public()
  @Get('status')
  async getStatus() {
    return this.crmService.getProviderStatus();
  }

  @Public()
  @Get('test')
  async test(@Query('provider') provider: string) {
    return this.crmService.testProvider(provider);
  }

  @Get('leads')
  async getLeads(@Query('provider') provider: string) {
    return this.crmService.getLeads(provider);
  }

  @Post('update')
  async updateLead(@Body() body: { provider: string; leadId: string; data: any }) {
    return this.crmService.updateLead(body.provider, body.leadId, body.data);
  }

  @Post('create')
  async createLead(
    @Body() body: { provider: string; data: { firstname: string; lastname: string; email: string } },
  ) {
    return this.crmService.createLead(body.provider, body.data);
  }

  @Post('import')
  async importLeads(@Query('provider') provider: string) {
    return this.crmService.importLeads(provider);
  }
}
