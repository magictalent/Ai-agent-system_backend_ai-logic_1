import { Injectable } from '@nestjs/common';

@Injectable()
export class MockService {
    private leads = [
        { id: '101', firstname: 'John', lastname: 'Doe', email: 'john@example.com' },
        { id: '102', firstname: 'Lisa', lastname: 'Park', email: 'lisa@example.com' },
        { id: '103', firstname: 'David', lastname: 'Kim', email: 'david@example.com' },
      ];
      

  getLeads() {
    return this.leads;
  }

  getLeadById(id: string) {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) throw new Error('Lead not found');
    return lead;
  }

  createLead(data: any) {
    const id = (Math.random() * 1000).toFixed(0);
    const lead = { id, firstname: data.firstname, lastname: data.lastname, email: data.email };
    this.leads.push(lead);
    return lead;
  }

  updateLead(id: string, data: Partial<any>) {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) throw new Error('Lead not found');
    Object.assign(lead, data);
    return lead;
  }
}
