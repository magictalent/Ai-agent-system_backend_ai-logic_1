export interface Campaign {
  id: string
  user_id: string
  client_id: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  channel: 'whatsapp' | 'email' | 'sms' | 'multi'
  client_name: string
  leads_count: number
  appointments_count: number
  response_rate: number
  created_at: string
  updated_at: string
  started_at?: string
  paused_at?: string
  completed_at?: string
}

export interface CreateCampaignData {
  client_id: string
  name: string
  description?: string
  channel: 'whatsapp' | 'email' | 'sms' | 'multi'
}
