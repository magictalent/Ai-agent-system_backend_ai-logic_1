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

export interface CampaignMetrics {
  leads: number
  appointments: number
  response_rate: number
  messages_sent: number
  replies_received: number
}

export interface ChannelConfig {
  id: 'whatsapp' | 'email' | 'sms' | 'multi'
  name: string
  icon: string
  color: string
  description: string
}

export const CHANNEL_CONFIGS: ChannelConfig[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    color: 'bg-green-100 text-green-800',
    description: 'Direct messaging via WhatsApp'
  },
  {
    id: 'email',
    name: 'Email',
    icon: '📧',
    color: 'bg-blue-100 text-blue-800',
    description: 'Email marketing campaigns'
  },
  {
    id: 'sms',
    name: 'SMS',
    icon: '📱',
    color: 'bg-purple-100 text-purple-800',
    description: 'SMS text messaging'
  },
  {
    id: 'multi',
    name: 'Multi-Channel',
    icon: '🔄',
    color: 'bg-orange-100 text-orange-800',
    description: 'Multiple communication channels'
  }
]

export const STATUS_CONFIGS = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800' }
}
