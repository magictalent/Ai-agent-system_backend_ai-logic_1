export interface Client {
    id: string;
    name: string;
    email: string;
    crm: 'mock' | 'hubspot' | 'salesforce';
    crm_provider: 'mock' | 'hubspot' | 'salesforce';
    token?: string;
  }
  