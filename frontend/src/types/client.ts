export interface Client {
  id: string
  user_id: string
  name: string
  email: string
  phone?: string
  industry?: string
  crm_provider: 'hubspot' | 'salesforce' | 'pipedrive' | 'mock'
  created_at: string
  updated_at: string
  crm_connected: boolean;
  ai_status: 'idle' | 'active' | 'paused';
}

export interface CreateClientData {
  name: string
  email: string
  phone?: string
  industry?: string
  crm_provider: 'hubspot' | 'salesforce' | 'pipedrive' | 'mock'
  openai_personality: 'friendly' | 'professional' | 'casual'
}

export interface CRMProvider {
  id: 'hubspot' | 'salesforce' | 'pipedrive' | 'mock'
  name: string
  description: string
  icon: string
  connected: boolean
}
