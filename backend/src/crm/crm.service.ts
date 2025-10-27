import { Injectable } from '@nestjs/common';
import { MockService } from './mock.service';
import { HubspotService } from './hubspot.service';
import { SupabaseService } from '../supabase/supabase.service';

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

  async testProvider(provider: string) {
    switch (provider) {
      case 'hubspot':
        return this.hubspot.testConnection();
      case 'mock':
      default:
        return { ok: true };
    }
  }

  async getLeads(provider: string, token?: string) {
    switch (provider) {
      case 'hubspot':
        return this.hubspot.getLeads(); // no token yet
      default:
        return this.mock.getLeads();
    }
  }

  async getLeadById(provider: string, id: string, token?: string) {
    switch (provider) {
      case 'hubspot':
        return this.hubspot.getLeadById(id); // add this stub next
      default:
        return this.mock.getLeadById(id);
    }
  }

  async createLead(provider: string, data: any, token?: string) {
    switch (provider) {
      case 'hubspot':
        return this.hubspot.createLead(data);
      default:
        return this.mock.createLead(data);
    }
  }

  async updateLead(provider: string, id: string, data: any, token?: string) {
    switch (provider) {
      case 'hubspot':
        return this.hubspot.updateLead(id, data);
      default:
        return this.mock.updateLead(id, data);
    }
  }

  async importLeads(provider: string) {
    const leads = await this.getLeads(provider);
    let inserted = 0;
    let updated = 0;

    for (const lead of leads) {
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
      } catch (e) {
        // continue on single-record errors
        // Optionally collect failures
      }
    }

    return { total: leads.length, inserted, updated };
  }
}
