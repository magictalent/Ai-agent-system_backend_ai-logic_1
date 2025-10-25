export interface Message {
  id: string;
  campaign_id: string;
  lead_id: string;
  lead_name: string;
  lead_email: string;
  lead_phone?: string;
  channel: 'whatsapp' | 'email' | 'sms';
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'replied' | 'failed';
  direction: 'outbound' | 'inbound';
  created_at: string;
  updated_at: string;
  campaign_name?: string;
}

export interface Conversation {
  lead_id: string;
  lead_name: string;
  lead_email: string;
  lead_phone?: string;
  campaign_id: string;
  campaign_name: string;
  channel: 'whatsapp' | 'email' | 'sms';
  status: 'active' | 'paused' | 'completed';
  last_message_at: string;
  message_count: number;
  messages: Message[];
}

export interface MessageFilters {
  campaign_id?: string;
  channel?: 'whatsapp' | 'email' | 'sms';
  status?: 'sent' | 'delivered' | 'read' | 'replied' | 'failed';
  date_from?: string;
  date_to?: string;
}
