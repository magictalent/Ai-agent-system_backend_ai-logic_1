import { Injectable } from '@nestjs/common';

@Injectable()
export class MockService {
    private leads = [
        { id: '101', firstname: 'John', lastname: 'Doe', email: 'john@example.com', phone: '+1-555-0101' },
        { id: '102', firstname: 'Lisa', lastname: 'Park', email: 'lisa@example.com', phone: '+1-555-0102' },
        { id: '103', firstname: 'David', lastname: 'Kim', email: 'david@example.com', phone: '+1-555-0103' },
        { id: '104', firstname: 'Sarah', lastname: 'Johnson', email: 'sarah@example.com', phone: '+1-555-0104' },
        { id: '105', firstname: 'Mike', lastname: 'Davis', email: 'mike@example.com', phone: '+1-555-0105' },
        { id: '106', firstname: 'Emma', lastname: 'Wilson', email: 'emma@example.com', phone: '+1-555-0106' },
        { id: '107', firstname: 'Alex', lastname: 'Brown', email: 'alex@example.com', phone: '+1-555-0107' },
        { id: '108', firstname: 'Maria', lastname: 'Garcia', email: 'maria@example.com', phone: '+1-555-0108' },
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
    const lead = { id, firstname: data.firstname, lastname: data.lastname, email: data.email, phone: data.phone || '+1-555-0000' };
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
