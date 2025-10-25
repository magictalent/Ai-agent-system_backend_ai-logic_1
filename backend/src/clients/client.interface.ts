export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  industry?: string;
  crm_provider: 'hubspot' | 'salesforce' | 'pipedrive' | 'mock';
  created_at: string;
  updated_at: string;
}
  