import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MockService } from './mock.service';
import { HubspotService } from './hubspot.service';
import { SupabaseService } from '../supabase/supabase.service';
import axios from 'axios';

@Injectable()
export class CrmService {
  constructor(
    private readonly mock: MockService,
    private readonly hubspot: HubspotService,
    private readonly db: SupabaseService,
  ) {}

  getProviderStatus() {
    return {
      mock: { id: 'mock', connected: true },
      hubspot: { id: 'hubspot', connected: !!process.env.HUBSPOT_API_KEY },
    };
  }

  // Fetch per-user HubSpot access token; refresh if expired
  private async getUserHubspotAccessToken(userId?: string): Promise<string> {
    if (!userId) throw new UnauthorizedException('Missing user');
    const { data, error } = await this.db.client
      .from('hubspot_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) throw new UnauthorizedException('HubSpot not connected');

    const expiresAt = data.expires_at ? new Date(data.expires_at).getTime() : 0;
    const now = Date.now();
    // Refresh 60s before expiry
    if (expiresAt && now < expiresAt - 60_000) {
      console.log(`[CRM Service] Using existing HubSpot token for user ${userId}. Expires in ${(expiresAt - now) / 1000}s`);
      return data.access_token as string;
    }

    console.log(`[CRM Service] HubSpot token for user ${userId} expired or expiring soon. Attempting refresh...`);
    // Refresh token (wrap in try/catch to surface clearer errors to client)
    const tokenUrl = 'https://api.hubapi.com/oauth/v1/token';
    const clientId = process.env.HUBSPOT_CLIENT_ID || '';
    const clientSecret = process.env.HUBSPOT_CLIENT_SECRET || '';
    const form = new URLSearchParams();
    form.set('grant_type', 'refresh_token');
    form.set('client_id', clientId);
    form.set('client_secret', clientSecret);
    form.set('refresh_token', data.refresh_token as string);

    let tokens: any = {};
    try {
      const resp = await axios.post(tokenUrl, form.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      tokens = resp.data || {};
    } catch (e: any) {
      const details = e?.response?.data || e?.message || 'refresh_failed';
      throw new UnauthorizedException(`HubSpot token refresh failed: ${typeof details === 'string' ? details : JSON.stringify(details)}`);
    }

    if (!tokens.access_token) {
      throw new UnauthorizedException('HubSpot token refresh returned no access_token');
    }
    const expiresIn: number = tokens.expires_in || 0;
    const newExpiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

    await this.db.client
      .from('hubspot_tokens')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || data.refresh_token,
        expires_in: tokens.expires_in,
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    console.log(`[CRM Service] HubSpot token refreshed for user ${userId}. New expiry: ${newExpiresAt}`);
    return tokens.access_token as string;
  }

  async testProvider(provider: string, userId?: string) {
    switch (provider) {
      case 'hubspot':
        {
          const token = await this.getUserHubspotAccessToken(userId);
          return this.hubspot.testConnection(token);
        }
      case 'mock':
      default:
        return { ok: true };
    }
  }

  // Load *all possible* leads from HubSpot, using paginated fetching
  async getLeads(
    provider: string,
    userId?: string,
    opts?: { archived?: boolean },
  ) {
    switch (provider) {
      case 'hubspot':
        {
          const token = await this.getUserHubspotAccessToken(userId);
          // Default to include archived unless explicitly set false
          const includeArchived = opts?.archived === undefined ? true : !!opts.archived;

          // Use paginated fetch to retrieve *all* contacts from HubSpot
          const allLeads = await this.hubspot.getAllLeads(token, includeArchived);

          console.log(`[CRM Service] Retrieved ${allLeads.length} contacts from HubSpot (no filtering applied).`);

          return allLeads; // directly return all contacts
        }
      default:
        return this.mock.getLeads();
    }
  }

  async getLeadById(provider: string, id: string, userId?: string) {
    switch (provider) {
      case 'hubspot':
        {
          const token = await this.getUserHubspotAccessToken(userId);
          return this.hubspot.getLeadById(id, token);
        }
      default:
        return this.mock.getLeadById(id);
    }
  }

  async createLead(provider: string, data: any, userId?: string) {
    switch (provider) {
      case 'hubspot':
        {
          const token = await this.getUserHubspotAccessToken(userId);
          return this.hubspot.createLead(data, token);
        }
      default:
        return this.mock.createLead(data);
    }
  }

  async updateLead(provider: string, id: string, data: any, userId?: string) {
    switch (provider) {
      case 'hubspot':
        {
          const token = await this.getUserHubspotAccessToken(userId);
          return this.hubspot.updateLead(id, data, token);
        }
      default:
        return this.mock.updateLead(id, data);
    }
  }

  async importLeads(
    provider: string,
    userId?: string,
    opts?: { archived?: boolean; excludeSamples?: boolean; excludeEmail?: string },
  ) {
    const includeArchived = opts?.archived === undefined ? true : !!opts?.archived;
    // Use paginated fetch to retrieve all possible leads
    // Fix: Omit excludeSamples and excludeEmail when calling getLeads (they are not valid props for getLeads)
    const leads = await this.getLeads(provider, userId, {
      archived: includeArchived,
    });
    let inserted = 0;
    let updated = 0;
    const failures: any[] = [];

    // Filtering logic after fetching if needed
    let filteredLeads = leads;
    if (opts?.excludeSamples) {
      filteredLeads = filteredLeads.filter(
        (lead: any) =>
          // crude filter: sample emails
          !(lead.email && lead.email.match(/sample|test|fake/i))
      );
    }
    if (opts?.excludeEmail) {
      filteredLeads = filteredLeads.filter(
        (lead: any) =>
          !lead.email || lead.email.toLowerCase() !== opts.excludeEmail?.toLowerCase()
      );
    }

    for (const lead of filteredLeads) {
      // Simple upsert by email if present, else by id
      const key = lead.email ? { email: lead.email } : { id: lead.id };
      try {
        // Try find existing
        let existing: any | null = null;
        try {
          existing = await this.db.findOne('leads', key as any);
        } catch (e) {
          existing = null;
        }

        const payload = {
          id: lead.id,
          first_name: lead.firstname || '',
          last_name: lead.lastname || '',
          email: lead.email || '',
          phone: lead.phone || '',
          status: existing?.status || 'new',
          updated_at: new Date().toISOString(),
          created_at: existing?.created_at || new Date().toISOString(),
        };

        if (existing) {
          await this.db.update('leads', key as any, payload);
          updated++;
        } else {
          await this.db.insert('leads', payload);
          inserted++;
        }
      } catch (e: any) {
        failures.push({ id: lead.id, email: lead.email, error: e?.message || 'unknown' });
      }
    }

    return { total: filteredLeads.length, inserted, updated, failed: failures.length, failures };
  }

  // DEV utility: remove all leads to re-test imports
  async clearLeads() {
    const { error, count } = await this.db.client
      .from('leads')
      .delete({ count: 'exact' })
      .neq('id', '');
    if (error) throw new Error(error.message);
    return { cleared: count ?? 0 };
  }

  // Fetch leads stored in our DB (imported from CRM)
  async getDbLeads(limit?: number) {
    const query = this.db.client
      .from('leads')
      .select('*')
      .order('updated_at', { ascending: false });
    if (limit && Number.isFinite(limit)) query.limit(limit as number);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }
}
