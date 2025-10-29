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

  // Time-series metrics for charts (daily buckets)
  @Get('timeseries')
  async timeseries(@Query('period') period?: string) {
    // Accept values like '7d' or '30d'; default 7d
    const days = period && period.endsWith('d') ? parseInt(period, 10) : (period ? parseInt(period, 10) : 7);
    return this.svc.getTimeSeries(isNaN(days) ? 7 : days);
  }

  // Aggregated analytics for details page
  @Get('analytics')
  async analytics(@Query('period') period?: string) {
    const days = period && period.endsWith('d') ? parseInt(period, 10) : (period ? parseInt(period, 10) : 7);
    return this.svc.getAnalytics(isNaN(days) ? 7 : days);
  }

  // Finance metrics (dummy computation based on activity)
  @Get('finance')
  async finance(@Query('period') period?: string) {
    const days = period && period.endsWith('d') ? parseInt(period, 10) : (period ? parseInt(period, 10) : 7);
    return this.svc.getFinance(isNaN(days) ? 7 : days);
  }
}
