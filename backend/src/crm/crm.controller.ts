import { Controller, Get, Post, Body, Query, Request, Delete } from '@nestjs/common';
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

  @Get('test')
  async test(@Query('provider') provider: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.crmService.testProvider(provider, userId);
  }

  @Get('leads')
  async getLeads(
    @Query('provider') provider: string,
    @Query('archived') archived: string,
    @Query('includeSamples') includeSamples: string,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    const includeArchived = archived === '1' || archived === 'true' || archived === undefined;
    // Default: include samples unless explicitly disabled
    const excludeSamples = includeSamples === '0' || includeSamples === 'false' ? true : false;
    // crmService.getLeads expects only { archived?: boolean }
    return this.crmService.getLeads(provider, userId, {
      archived: includeArchived,
    });
  }

  @Post('update')
  async updateLead(@Body() body: { provider: string; leadId: string; data: any }, @Request() req: any) {
    const userId = req.user?.id;
    return this.crmService.updateLead(body.provider, body.leadId, body.data, userId);
  }

  @Post('create')
  async createLead(
    @Body() body: { provider: string; data: { firstname: string; lastname: string; email: string } },
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.crmService.createLead(body.provider, body.data, userId);
  }

  @Post('import')
  async importLeads(
    @Query('provider') provider: string,
    @Query('archived') archived: string,
    @Query('includeSamples') includeSamples: string,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    const includeArchived = archived === '1' || archived === 'true' || archived === undefined;
    const excludeSamples = includeSamples === '0' || includeSamples === 'false' ? true : false;
    return this.crmService.importLeads(provider, userId, {
      archived: includeArchived,
      excludeSamples,
      excludeEmail: undefined,
    });
  }

  // DEV utility to clear all leads (useful to re-test import from scratch)
  @Delete('leads')
  async clearLeads() {
    return this.crmService.clearLeads();
  }

  // Return leads stored in our DB (requires auth)
  @Get('leads-db')
  async getDbLeads(@Query('limit') limit: string) {
    const n = limit ? parseInt(limit, 10) : undefined;
    return this.crmService.getDbLeads(n);
  }
}
