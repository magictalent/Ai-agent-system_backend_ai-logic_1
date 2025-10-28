import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get('summary')
  async summary() {
    return this.svc.getSummary();
  }

  @Get('recent-leads')
  async recent(@Query('limit') limit?: string) {
    const n = limit ? parseInt(limit, 10) : 6;
    return this.svc.getRecentLeads(n);
  }
}

