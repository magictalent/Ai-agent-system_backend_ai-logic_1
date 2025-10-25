import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Conversation, Message } from './message.interface';

@Injectable()
export class MessagesService {
  constructor(@Inject('SUPABASE_CLIENT') private supabase: SupabaseClient) {}

  async getConversations(userId: string): Promise<Conversation[]> {
    console.log('🔍 MessagesService: Getting conversations for user:', userId);
    
    try {
      // Get all messages for user's campaigns
      const { data: messages, error } = await this.supabase
        .from('messages')
        .select(`
          *,
          campaigns!inner(
            id,
            name,
            status,
            user_id
          )
        `)
        .eq('campaigns.user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ MessagesService: Database error:', error);
        throw new Error(error.message);
      }

      console.log('📊 MessagesService: Found messages:', messages?.length || 0);

      // Group messages by lead
      const conversationsMap = new Map<string, Conversation>();

      messages?.forEach((message: any) => {
        const leadId = message.lead_id;
        
        if (!conversationsMap.has(leadId)) {
          conversationsMap.set(leadId, {
            lead_id: leadId,
            lead_name: message.lead_name || 'Unknown Lead',
            lead_email: message.lead_email || '',
            lead_phone: message.lead_phone,
            campaign_id: message.campaign_id,
            campaign_name: message.campaigns?.name || 'Unknown Campaign',
            channel: message.channel,
            status: message.campaigns?.status || 'active',
            last_message_at: message.created_at,
            message_count: 0,
            messages: []
          });
        }

        const conversation = conversationsMap.get(leadId)!;
        conversation.messages.push({
          id: message.id,
          campaign_id: message.campaign_id,
          lead_id: message.lead_id,
          lead_name: message.lead_name,
          lead_email: message.lead_email,
          channel: message.channel,
          content: message.content,
          status: message.status,
          direction: message.direction,
          created_at: message.created_at,
          updated_at: message.updated_at,
          campaign_name: message.campaigns?.name,
          lead_phone: message.lead_phone
        });

        conversation.message_count++;
        
        // Update last message time
        if (new Date(message.created_at) > new Date(conversation.last_message_at)) {
          conversation.last_message_at = message.created_at;
        }
      });

      const conversations = Array.from(conversationsMap.values());
      
      // Sort by last message time
      conversations.sort((a, b) => 
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );

      console.log('✅ MessagesService: Returning conversations:', conversations.length);
      return conversations;
    } catch (error) {
      console.error('❌ MessagesService: Error getting conversations:', error);
      throw error;
    }
  }

  async getMessagesByCampaign(campaignId: string, userId: string): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select(`
        *,
        campaigns!inner(
          id,
          name,
          user_id
        )
      `)
      .eq('campaign_id', campaignId)
      .eq('campaigns.user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getMessagesByLead(leadId: string, userId: string): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select(`
        *,
        campaigns!inner(
          id,
          name,
          user_id
        )
      `)
      .eq('lead_id', leadId)
      .eq('campaigns.user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }
}
