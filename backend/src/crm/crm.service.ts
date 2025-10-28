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
    let leads: any[] = [];
    try {
      // Fetch all possible leads from provider (active + optionally archived)
      leads = await this.getLeads(provider, userId, { archived: includeArchived });
    } catch (err) {
      console.error('Error fetching leads from provider:', err);
      return { total: 0, inserted: 0, updated: 0, failed: 0, failures: [{ error: '' + err }] };
    }

    // Optional filtering after fetch
    let filteredLeads = leads || [];
    try {
      if (opts?.excludeSamples) {
        filteredLeads = filteredLeads.filter((lead: any) => !(lead.email && lead.email.match(/sample|test|fake/i)));
      }
      if (opts?.excludeEmail) {
        filteredLeads = filteredLeads.filter((lead: any) => !lead.email || lead.email.toLowerCase() !== opts.excludeEmail!.toLowerCase());
      }
    } catch (err) {
      console.error('Error filtering leads:', err);
      return { total: leads.length, inserted: 0, updated: 0, failed: leads.length, failures: [{ error: '' + err }] };
    }

    if (filteredLeads.length === 0) {
      console.warn('No leads to import after filtering.');
      return { total: 0, inserted: 0, updated: 0, failed: 0, failures: [] };
    }

    // Prepare rows for bulk upsert by id. Avoid setting status/created_at so defaults are preserved for existing rows.
    let rows: any[] = [];
    try {
      rows = filteredLeads.map((l: any) => ({
        id: l.id,
        first_name: l.firstname || '',
        last_name: l.lastname || '',
        email: l.email || '',
        phone: l.phone || '',
        updated_at: new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Error mapping leads to DB rows:', err);
      throw err;
    }

    // Compute existing ids to report inserted vs updated
    const ids = rows.map((r) => r.id);
    let existingIds: string[] = [];
    try {
      const { data, error } = await this.db.client.from('leads').select('id').in('id', ids);
      if (error) {
        console.error('Error selecting existing lead ids from DB:', error);
      }
      if (!error && Array.isArray(data)) existingIds = data.map((d: any) => d.id);
    } catch (err) {
      console.error('Exception while querying existing lead ids:', err);
    }
    const existingSet = new Set(existingIds);
    const wouldUpdate = rows.filter((r) => existingSet.has(r.id)).length;
    const wouldInsert = rows.length - wouldUpdate;

    let upsertError: any = null;
    try {
      const result = await this.db.client.from('leads').upsert(rows, { onConflict: 'id' });
      upsertError = result.error;
      if (upsertError) {
        console.error('Error during leads upsert:', upsertError);
        return {
          total: rows.length,
          inserted: 0,
          updated: 0,
          failed: rows.length,
          failures: [{ error: upsertError.message }]
        };
      }
    } catch (err) {
      console.error('Exception during leads upsert:', err);
      return {
        total: rows.length,
        inserted: 0,
        updated: 0,
        failed: rows.length,
        failures: [{ error: '' + err }]
      };
    }

    return { total: rows.length, inserted: wouldInsert, updated: wouldUpdate, failed: 0, failures: [] };
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
