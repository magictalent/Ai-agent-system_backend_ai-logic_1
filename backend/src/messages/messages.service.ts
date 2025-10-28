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

  /** Insert a simulated inbound reply for a lead to help test UI and flows */
  async simulateInboundMessage(opts: { userId: string; leadId: string; content: string; campaignId?: string }) {
    const { userId, leadId, content } = opts;
    if (!leadId || !content) throw new Error('leadId and content are required');

    // Determine campaign to associate the message with
    let campaignId = opts.campaignId || '';
    let channel: 'email' | 'sms' | 'whatsapp' = 'email';
    let leadName = 'Unknown Lead';
    let leadEmail = '';
    let leadPhone: string | null = null;

    // Try to reuse the latest message's campaign/channel and lead details
    try {
      const { data: lastMsgs } = await this.supabase
        .from('messages')
        .select(`*, campaigns!inner(id,name,user_id)`) // ensure same user
        .eq('lead_id', leadId)
        .eq('campaigns.user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      const last = Array.isArray(lastMsgs) && lastMsgs[0];
      if (last) {
        campaignId = campaignId || last.campaign_id;
        channel = (last.channel as any) || channel;
        leadName = last.lead_name || leadName;
        leadEmail = last.lead_email || leadEmail;
        leadPhone = last.lead_phone || leadPhone;
      }
    } catch {}

    // If still no campaign, pick any campaign for this user (prefer active)
    if (!campaignId) {
      const { data: camp } = await this.supabase
        .from('campaigns')
        .select('id')
        .eq('user_id', userId)
        .order('status', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (camp?.id) campaignId = camp.id;
    }

    // Pull missing lead details from leads table
    if (!leadEmail || !leadName || !leadPhone) {
      try {
        const { data: leadRow } = await this.supabase
          .from('leads')
          .select('first_name,last_name,email,phone')
          .eq('id', leadId)
          .maybeSingle();
        if (leadRow) {
          const name = `${leadRow.first_name || ''} ${leadRow.last_name || ''}`.trim();
          leadName = leadName === 'Unknown Lead' && name ? name : leadName;
          leadEmail = leadEmail || leadRow.email || '';
          leadPhone = leadPhone || leadRow.phone || null;
        }
      } catch {}
    }

    // Insert inbound message
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        campaign_id: campaignId || null,
        lead_id: leadId,
        lead_name: leadName,
        lead_email: leadEmail,
        lead_phone: leadPhone,
        channel,
        content,
        status: 'replied',
        direction: 'inbound',
      })
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);

    // Optionally mark lead state
    try {
      await this.supabase
        .from('leads')
        .update({ status: 'replied', updated_at: new Date().toISOString() })
        .eq('id', leadId);
    } catch {}

    return { ok: true, message: data };
  }
}
