import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  constructor(private readonly db: SupabaseService) {}

  async getSummary() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // New leads in the last 7 days
    let newLeads = 0;
    try {
      const { count } = await this.db.client
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo);
      newLeads = count ?? 0;
    } catch (e) {
      this.logger.warn(`leads count failed: ${e}`);
    }

    // Active conversations in last 24h (unique leads with messages)
    let activeConversations = 0;
    try {
      const { data, error } = await this.db.client
        .from('messages')
        .select('lead_id, created_at')
        .gte('created_at', dayAgo);
      if (!error && data) {
        const unique = new Set<string>();
        for (const m of data as any[]) if (m.lead_id) unique.add(m.lead_id);
        activeConversations = unique.size;
      }
    } catch (e) {
      this.logger.warn(`messages recent failed: ${e}`);
    }

    // Booked appointments (upcoming)
    let bookedAppointments = 0;
    try {
      const { count } = await this.db.client
        .from('meetings')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', now.toISOString());
      bookedAppointments = count ?? 0;
    } catch (e) {
      // table may not exist yet
      this.logger.warn(`meetings count failed: ${e}`);
    }

    // Conversion rate: appointments / leads (avoid div by zero)
    const conversionRate = newLeads > 0 ? (bookedAppointments / newLeads) * 100 : 0;

    return {
      newLeads,
      activeConversations,
      bookedAppointments,
      conversionRate: Number(conversionRate.toFixed(1)),
    };
  }

  async getRecentLeads(limit = 6) {
    try {
      const { data, error } = await this.db.client
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      const rows = Array.isArray(data) ? data : [];
      // Normalize possible column names (first_name vs firstname, etc.)
      const normalized = rows.map((r: any) => ({
        id: r.id,
        first_name: r.first_name ?? r.firstname ?? r.first ?? '',
        last_name: r.last_name ?? r.lastname ?? r.last ?? '',
        email: r.email ?? '',
        status: r.status ?? 'new',
        created_at: r.created_at,
        last_contacted: r.last_contacted ?? r.lastcontacted ?? null,
      }));
      return normalized;
    } catch (e: any) {
      this.logger.error('recent leads failed', e);
      return [];
    }
  }

  private buildDateBuckets(days: number) {
    const buckets: Record<string, { date: string; leads: number; outbound: number; inbound: number; appointments: number }> = {};
    const arr: any[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const obj = { date: key, leads: 0, outbound: 0, inbound: 0, appointments: 0 };
      buckets[key] = obj;
      arr.push(obj);
    }
    return { buckets, arr };
  }

  async getTimeSeries(days = 7) {
    const fromIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { buckets, arr } = this.buildDateBuckets(days);

    // Leads per day
    try {
      const { data: leads } = await this.db.client
        .from('leads')
        .select('id, created_at')
        .gte('created_at', fromIso);
      for (const r of (leads || []) as any[]) {
        const key = (r.created_at || '').slice(0, 10);
        if (buckets[key]) buckets[key].leads += 1;
      }
    } catch {}

    // Messages per day split by direction
    try {
      const { data: msgs } = await this.db.client
        .from('messages')
        .select('id, created_at, direction')
        .gte('created_at', fromIso);
      for (const m of (msgs || []) as any[]) {
        const key = (m.created_at || '').slice(0, 10);
        if (!buckets[key]) continue;
        if (m.direction === 'inbound') buckets[key].inbound += 1;
        else buckets[key].outbound += 1;
      }
    } catch {}

    // Appointments per day (optional, skip if table missing)
    try {
      const { data: appts } = await this.db.client
        .from('meetings')
        .select('id, start_time')
        .gte('start_time', fromIso);
      for (const a of (appts || []) as any[]) {
        const key = (a.start_time || '').slice(0, 10);
        if (buckets[key]) buckets[key].appointments += 1;
      }
    } catch {}

    return { period_days: days, series: arr };
  }

  async getAnalytics(days = 7) {
    const fromIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const out: any = { period_days: days, totals: {}, by_campaign: [], by_channel: [] };

    // Totals + breakdowns
    try {
      const { count: leads } = await this.db.client
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fromIso);
      const { data: msgs } = await this.db.client
        .from('messages')
        .select('direction, channel, campaign_id')
        .gte('created_at', fromIso);
      const totalOutbound = (msgs || []).filter((m: any) => m.direction === 'outbound').length;
      const totalInbound = (msgs || []).filter((m: any) => m.direction === 'inbound').length;
      out.totals = { leads: leads ?? 0, outbound: totalOutbound, inbound: totalInbound };

      const byCh: Record<string, { channel: string; outbound: number; inbound: number }> = {};
      for (const m of (msgs || []) as any[]) {
        const key = m.channel || 'unknown';
        if (!byCh[key]) byCh[key] = { channel: key, outbound: 0, inbound: 0 };
        if (m.direction === 'inbound') byCh[key].inbound += 1; else byCh[key].outbound += 1;
      }
      out.by_channel = Object.values(byCh);

      const byCamp: Record<string, { campaign_id: string; outbound: number; inbound: number }> = {};
      for (const m of (msgs || []) as any[]) {
        const key = m.campaign_id || 'unknown';
        if (!byCamp[key]) byCamp[key] = { campaign_id: key, outbound: 0, inbound: 0 };
        if (m.direction === 'inbound') byCamp[key].inbound += 1; else byCamp[key].outbound += 1;
      }
      out.by_campaign = Object.values(byCamp);
    } catch {}

    return out;
  }

  async getFinance(days = 7) {
    // Reuse the time series to derive simple finance metrics
    const ts = await this.getTimeSeries(days);
    const series = Array.isArray((ts as any)?.series) ? (ts as any).series : [];

    // Dummy computation:
    // - revenue correlates with inbound replies and appointments
    // - expenses correlate with outbound volume and lead acquisition
    const revenue_series = series.map((s: any) => ({
      date: s.date,
      value: Math.round(s.inbound * 80 + s.appointments * 200),
    }));
    const expenses_series = series.map((s: any) => ({
      date: s.date,
      value: Math.round(s.outbound * 5 + s.leads * 2),
    }));

    const totals = {
      revenue: revenue_series.reduce((sum: number, r: any) => sum + (r.value || 0), 0),
      expenses: expenses_series.reduce((sum: number, r: any) => sum + (r.value || 0), 0),
    };

    return {
      period_days: days,
      totals,
      revenue_series,
      expenses_series,
    };
  }
}
