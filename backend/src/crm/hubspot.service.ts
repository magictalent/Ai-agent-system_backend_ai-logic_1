import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class HubspotService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.hubapi.com';

  constructor() {
    const apiKey = process.env.HUBSPOT_API_KEY;
    // Do not throw on startup if missing; fail lazily when used
    this.apiKey = apiKey || '';
  }

  private getHeaders(accessTokenOverride?: string) {
    const token = accessTokenOverride || this.apiKey;
    if (!token) {
      throw new HttpException('HubSpot token is not configured', HttpStatus.BAD_REQUEST);
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async testConnection(accessTokenOverride?: string) {
    try {
      // Perform a minimal request using the PAT; if unauthorized, this will fail
      const contacts = await axios.get(
        `${this.baseUrl}/crm/v3/objects/contacts`,
        { headers: this.getHeaders(accessTokenOverride), params: { limit: 1, properties: 'email' } }
      );
      return { ok: true, sample: contacts.data?.results?.length ?? 0 };
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.response?.data || error?.message;
      return { ok: false, status, message };
    }
  }

  // Paginated fetch of all contacts (active + optionally archived)
  async getAllLeads(accessTokenOverride?: string, includeArchived = true) {
    try {
      const headers = this.getHeaders(accessTokenOverride);

      const fetchAll = async (archivedOnly: boolean) => {
        const out: any[] = [];
        let after: string | undefined = undefined;
        while (true) {
          const params: any = {
            limit: 100,
            properties: 'firstname,lastname,email,phone',
            archived: archivedOnly, // true => only archived; false => only active
          };
          if (after) params.after = after;
          const resp = await axios.get(`${this.baseUrl}/crm/v3/objects/contacts`, { headers, params });
          const results = Array.isArray(resp.data?.results) ? resp.data.results : [];
          for (const contact of results) {
            out.push({
              id: contact.id,
              firstname: contact.properties?.firstname || '',
              lastname: contact.properties?.lastname || '',
              email: contact.properties?.email || '',
              phone: contact.properties?.phone || '',
            });
          }
          const nextAfter = resp.data?.paging?.next?.after;
          if (!nextAfter) break;
          after = nextAfter;
        }
        return out;
      };

      // HubSpot's 'archived' param returns only archived items when true.
      // To INCLUDE archived with active, fetch twice and merge.
      const active = await fetchAll(false);
      if (!includeArchived) return active;
      const archived = await fetchAll(true);
      return [...active, ...archived];
    } catch (error: any) {
      console.error('❌ HubSpot API Error (getAllLeads):', error.response?.data || error.message);
      throw new HttpException('Failed to fetch all leads from HubSpot', HttpStatus.BAD_GATEWAY);
    }
  }

  // First page of contacts (active + optionally archived)
  async getLeads(accessTokenOverride?: string, includeArchived = true) {
    try {
      const headers = this.getHeaders(accessTokenOverride);

      const fetchFirst = async (archivedOnly: boolean) => {
        const resp = await axios.get(`${this.baseUrl}/crm/v3/objects/contacts`, {
          headers,
          params: {
            limit: 100,
            properties: 'firstname,lastname,email,phone',
            archived: archivedOnly,
          },
        });
        const results = Array.isArray(resp.data?.results) ? resp.data.results : [];
        return results.map((contact: any) => ({
          id: contact.id,
          firstname: contact.properties?.firstname || '',
          lastname: contact.properties?.lastname || '',
          email: contact.properties?.email || '',
          phone: contact.properties?.phone || '',
        }));
      };

      const active = await fetchFirst(false);
      if (!includeArchived) return active;
      const archived = await fetchFirst(true);
      return [...active, ...archived];
    } catch (error: any) {
      console.error('❌ HubSpot API Error (getLeads):', error.response?.data || error.message);
      throw new HttpException('Failed to fetch leads from HubSpot', HttpStatus.BAD_GATEWAY);
    }
  }

  async getLeadById(id: string, accessTokenOverride?: string) {
    try {
      console.log(`🔍 HubSpot: Fetching contact ${id}...`);
      const response = await axios.get(
        `${this.baseUrl}/crm/v3/objects/contacts/${id}`,
        {
          headers: this.getHeaders(accessTokenOverride),
          params: {
            properties: 'firstname,lastname,email,phone'
          }
        }
      );
      const contact = response.data;
      return {
        id: contact.id,
        firstname: contact.properties.firstname || '',
        lastname: contact.properties.lastname || '',
        email: contact.properties.email || '',
        phone: contact.properties.phone || ''
      };
    } catch (error: any) {
      console.error('❌ HubSpot API Error (getLeadById):', error?.response?.data || error?.message);
      throw new HttpException('Failed to fetch lead from HubSpot', HttpStatus.BAD_GATEWAY);
    }
  }

  async createLead(data: any, accessTokenOverride?: string) {
    try {
      console.log('🔍 HubSpot: Creating contact...', data);

      const response = await axios.post(
        `${this.baseUrl}/crm/v3/objects/contacts`,
        {
          properties: {
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            phone: data.phone
          }
        },
        { headers: this.getHeaders(accessTokenOverride) }
      );

      console.log('✅ HubSpot: Contact created:', response.data.id);

      return {
        id: response.data.id,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone
      };
    } catch (error: any) {
      console.error('❌ HubSpot API Error (createLead):', error?.response?.data || error?.message);
      throw new HttpException('Failed to create lead in HubSpot', HttpStatus.BAD_GATEWAY);
    }
  }

  async updateLead(id: string, data: any, accessTokenOverride?: string) {
    try {
      console.log(`🔍 HubSpot: Updating contact ${id}...`, data);

      const response = await axios.patch(
        `${this.baseUrl}/crm/v3/objects/contacts/${id}`,
        {
          properties: {
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            phone: data.phone
          }
        },
        { headers: this.getHeaders(accessTokenOverride) }
      );

      console.log('✅ HubSpot: Contact updated');

      return {
        id: response.data.id,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone
      };
    } catch (error: any) {
      console.error('❌ HubSpot API Error (updateLead):', error?.response?.data || error?.message);
      throw new HttpException('Failed to update lead in HubSpot', HttpStatus.BAD_GATEWAY);
    }
  }
}
