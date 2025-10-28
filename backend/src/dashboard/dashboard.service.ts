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
        .select('id, first_name, last_name, email, status, created_at, last_contacted')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      return data || [];
    } catch (e: any) {
      this.logger.error('recent leads failed', e);
      return [];
    }
  }
}

