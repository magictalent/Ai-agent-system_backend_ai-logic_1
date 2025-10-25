import { Injectable } from '@nestjs/common';
import { MockService } from './mock.service';
import { HubspotService } from './hubspot.service';

@Injectable()
export class CrmService {
  constructor(
    private readonly mock: MockService,
    private readonly hubspot: HubspotService,
  ) {}

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
}
