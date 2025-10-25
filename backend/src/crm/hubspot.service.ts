import { Injectable } from '@nestjs/common';

@Injectable()
export class HubspotService {
  getLeads() {
    return [
      { id: '201', firstname: 'Emma', lastname: 'Johnson', email: 'emma@hubspot.com' },
      { id: '202', firstname: 'Ryan', lastname: 'Lee', email: 'ryan@hubspot.com' },
    ];
  }

  getLeadById(id: string) {
    return { id, firstname: 'HubSpot', lastname: 'Lead', email: 'lead@hubspot.com' };
  }

  createLead(data: any) {
    return { id: '999', ...data };
  }

  updateLead(id: string, data: any) {
    return { id, ...data };
  }
}
