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

    // New leads in last 7 days
    let newLeads = 0;
    try {
      const { count } = await this.db.client
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo);
      newLeads = count ?? 0;
    } catch (e) { this.logger.warn(`leads count failed: ${e}`); }

    // Active conversations in last 24h (unique leads with any messages)
    let activeConversations = 0;
    try {
      const { data } = await this.db.client
        .from('messages')
        .select('lead_id, created_at')
        .gte('created_at', dayAgo);
      const unique = new Set<string>();
      for (const m of (data || []) as any[]) if (m.lead_id) unique.add(m.lead_id);
      activeConversations = unique.size;
    } catch (e) { this.logger.warn(`messages recent failed: ${e}`); }

    // Contacted in last 24h (unique leads with outbound)
    let contactedLast24 = 0;
    try {
      const { data } = await this.db.client
        .from('messages')
        .select('lead_id, direction, created_at')
        .eq('direction', 'outbound')
        .gte('created_at', dayAgo);
      const uniq = new Set<string>();
      for (const m of (data || []) as any[]) if (m.lead_id) uniq.add(m.lead_id);
      contactedLast24 = uniq.size;
    } catch (e) { this.logger.warn(`contacted calc failed: ${e}`); }

    // Booked appointments (upcoming)
    let bookedAppointments = 0;
    try {
      const { count } = await this.db.client
        .from('meetings')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', now.toISOString());
      bookedAppointments = count ?? 0;
    } catch (e) { this.logger.warn(`meetings count failed: ${e}`); }

    // Conversion rate: appointments/new leads
    const conversionRate = newLeads > 0 ? (bookedAppointments / newLeads) * 100 : 0;

    return {
      newLeads,
      activeConversations,
      bookedAppointments,
      conversionRate: Number(conversionRate.toFixed(1)),
      contactedLast24,
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
      return rows.map((r: any) => ({
        id: r.id,
        first_name: r.first_name ?? r.firstname ?? r.first ?? '',
        last_name: r.last_name ?? r.lastname ?? r.last ?? '',
        email: r.email ?? '',
        status: r.status ?? 'new',
        created_at: r.created_at,
        last_contacted: r.last_contacted ?? r.lastcontacted ?? null,
      }));
    } catch (e: any) { this.logger.error('recent leads failed', e); return [] }
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
      buckets[key] = obj; arr.push(obj);
    }
    return { buckets, arr };
  }

  async getTimeSeries(days = 7) {
    const fromIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { buckets, arr } = this.buildDateBuckets(days);
    try {
      const { data: leads } = await this.db.client.from('leads').select('id, created_at').gte('created_at', fromIso);
      for (const r of (leads || []) as any[]) { const k = (r.created_at || '').slice(0,10); if (buckets[k]) buckets[k].leads += 1; }
    } catch {}
    try {
      const { data: msgs } = await this.db.client.from('messages').select('id, created_at, direction').gte('created_at', fromIso);
      for (const m of (msgs || []) as any[]) { const k = (m.created_at || '').slice(0,10); if (!buckets[k]) continue; if (m.direction==='inbound') buckets[k].inbound += 1; else buckets[k].outbound += 1; }
    } catch {}
    try {
      const { data: appts } = await this.db.client.from('meetings').select('id, start_time').gte('start_time', fromIso);
      for (const a of (appts || []) as any[]) { const k = (a.start_time || '').slice(0,10); if (buckets[k]) buckets[k].appointments += 1; }
    } catch {}
    return { period_days: days, series: arr };
  }

  async getAnalytics(days = 7) {
    const fromIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const out: any = { period_days: days, totals: {}, by_campaign: [], by_channel: [] };
    try {
      const { count: leads } = await this.db.client.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', fromIso);
      const { data: msgs } = await this.db.client.from('messages').select('direction, channel, campaign_id').gte('created_at', fromIso);
      const totalOutbound = (msgs || []).filter((m: any) => m.direction==='outbound').length;
      const totalInbound = (msgs || []).filter((m: any) => m.direction==='inbound').length;
      out.totals = { leads: leads ?? 0, outbound: totalOutbound, inbound: totalInbound };
      const byCh: Record<string, { channel: string; outbound: number; inbound: number }> = {};
      for (const m of (msgs || []) as any[]) { const k = m.channel || 'unknown'; if (!byCh[k]) byCh[k] = { channel:k, outbound:0, inbound:0 }; if (m.direction==='inbound') byCh[k].inbound += 1; else byCh[k].outbound += 1; }
      out.by_channel = Object.values(byCh);
      const byCamp: Record<string, { campaign_id: string; outbound: number; inbound: number }> = {};
      for (const m of (msgs || []) as any[]) { const k = m.campaign_id || 'unknown'; if (!byCamp[k]) byCamp[k] = { campaign_id:k, outbound:0, inbound:0 }; if (m.direction==='inbound') byCamp[k].inbound += 1; else byCamp[k].outbound += 1; }
      out.by_campaign = Object.values(byCamp);
    } catch {}
    return out;
  }

  async getFinance(days = 7) {
    const ts = await this.getTimeSeries(days);
    const series = Array.isArray((ts as any)?.series) ? (ts as any).series : [];
    const revenue_series = series.map((s: any) => ({ date: s.date, value: Math.round(s.inbound * 80 + s.appointments * 200) }));
    const expenses_series = series.map((s: any) => ({ date: s.date, value: Math.round(s.outbound * 5 + s.leads * 2) }));
    const totals = { revenue: revenue_series.reduce((sum: number, r: any) => sum + (r.value || 0), 0), expenses: expenses_series.reduce((sum: number, r: any) => sum + (r.value || 0), 0) };
    return { period_days: days, totals, revenue_series, expenses_series };
  }

  async getSequenceWindow() {
    const now = new Date();
    const last24 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const next24 = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    let sentLast24 = 0; let scheduledNext24 = 0;
    try { const { count } = await this.db.client.from('messages').select('*', { count: 'exact', head: true }).eq('direction', 'outbound').gte('created_at', last24); sentLast24 = count ?? 0; } catch {}
    try { const { count } = await this.db.client.from('sequence_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending').lte('due_at', next24); scheduledNext24 = count ?? 0; } catch {}
    return { sent_last_24h: sentLast24, scheduled_next_24h: scheduledNext24 };
  }

  // Replies + errors summary and reply-rate by campaign (last 24h)
  async getRepliesErrorsAndRates() {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    let repliesLast24 = 0;
    let errorsLast24 = 0;

    try {
      const { count } = await this.db.client
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('direction', 'inbound')
        .gte('created_at', dayAgo);
      repliesLast24 = count ?? 0;
    } catch {}

    try {
      const { count } = await this.db.client
        .from('sequence_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')
        .gte('updated_at', dayAgo);
      errorsLast24 = count ?? 0;
    } catch {}

    // Build reply rate by campaign (last 24h)
    const byCampaign: Record<string, { outbound: number; inbound: number }> = {};
    try {
      const { data: msgs } = await this.db.client
        .from('messages')
        .select('campaign_id, direction, created_at')
        .gte('created_at', dayAgo);
      for (const m of (msgs || []) as any[]) {
        const key = m.campaign_id || 'unknown';
        if (!byCampaign[key]) byCampaign[key] = { outbound: 0, inbound: 0 };
        if (m.direction === 'inbound') byCampaign[key].inbound += 1; else byCampaign[key].outbound += 1;
      }
    } catch {}

    // Map campaign IDs to names
    const ids = Object.keys(byCampaign).filter((k) => k !== 'unknown');
    const nameMap: Record<string, string> = {};
    if (ids.length) {
      try {
        const { data: camps } = await this.db.client
          .from('campaigns')
          .select('id,name')
          .in('id', ids);
        for (const c of (camps || []) as any[]) nameMap[c.id] = c.name;
      } catch {}
    }

    const rates = Object.entries(byCampaign)
      .filter(([, v]) => (v.outbound || 0) > 0)
      .map(([campaign_id, v]) => ({
        campaign_id,
        campaign_name: nameMap[campaign_id] || campaign_id,
        outbound_last_24h: v.outbound,
        replies_last_24h: v.inbound,
        reply_rate: Number(((v.inbound / Math.max(1, v.outbound)) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.reply_rate - a.reply_rate);

    return {
      replies_last_24h: repliesLast24,
      errors_last_24h: errorsLast24,
      reply_rates_by_campaign: rates,
      top_reply_rate: rates[0] || null,
    };
  }
}
