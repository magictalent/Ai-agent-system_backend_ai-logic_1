import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { AiService } from '../ai/ai.service';
import { ClientsService } from '../clients/clients.service';
import { Campaign } from './campaign.interface';

@Injectable()
export class AiCampaignService {
  constructor(
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient,
    private readonly aiService: AiService,
    private readonly clientsService: ClientsService
  ) {}

  async startAiCampaign(campaignId: string, userId: string) {
    console.log('🤖 Starting AI campaign:', campaignId);
    
    try {
      // Get campaign details
      const campaign = await this.getCampaignById(campaignId, userId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Get client details
      const client = await this.clientsService.getClientById(campaign.client_id, userId);
      if (!client) {
        throw new Error('Client not found');
      }

      // Update campaign status to active
      await this.updateCampaignStatus(campaignId, 'active', userId);

      // Start AI automation based on campaign channel
      switch (campaign.channel) {
        case 'whatsapp':
          await this.startWhatsAppAutomation(campaign, client, userId);
          break;
        case 'email':
          await this.startEmailAutomation(campaign, client, userId);
          break;
        case 'sms':
          await this.startSmsAutomation(campaign, client, userId);
          break;
        case 'multi':
          await this.startMultiChannelAutomation(campaign, client, userId);
          break;
        default:
          throw new Error('Unsupported channel');
      }

      console.log('✅ AI campaign started successfully');
      return { success: true, message: 'AI automation started' };
    } catch (error) {
      console.error('❌ Error starting AI campaign:', error);
      throw error;
    }
  }

  async stopAiCampaign(campaignId: string, userId: string) {
    console.log('🛑 Stopping AI campaign:', campaignId);
    
    try {
      // Update campaign status to paused
      await this.updateCampaignStatus(campaignId, 'paused', userId);
      
      // Log AI activity
      await this.logAiActivity(campaignId, 'campaign_paused', 'AI automation paused by user');
      
      console.log('✅ AI campaign stopped successfully');
      return { success: true, message: 'AI automation stopped' };
    } catch (error) {
      console.error('❌ Error stopping AI campaign:', error);
      throw error;
    }
  }

  async getAiCampaignStatus(campaignId: string, userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('ai_campaign_activities')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw new Error(error.message);
      
      return {
        campaignId,
        activities: data || [],
        lastActivity: data?.[0] || null
      };
    } catch (error) {
      console.error('❌ Error getting AI status:', error);
      throw error;
    }
  }

  private async startWhatsAppAutomation(campaign: Campaign, client: any, userId: string) {
    console.log('📱 Starting WhatsApp automation for campaign:', campaign.name);
    
    // Get leads from client's CRM
    const leads = await this.aiService.getClientLeads(client.id, userId);
    console.log(`📊 Found ${leads.leads.length} leads for WhatsApp automation`);

    // Start AI lead processing
    for (const lead of leads.leads.slice(0, 10)) { // Process first 10 leads
      try {
        // Generate personalized WhatsApp message
        const message = await this.aiService.generateLeadMessage(lead, campaign.name);
        
        // Log AI activity
        await this.logAiActivity(campaign.id, 'message_generated', `Generated WhatsApp message for ${lead.firstname} ${lead.lastname}`);
        
        // Update campaign metrics
        await this.updateCampaignMetrics(campaign.id, 'leads_processed', 1);
        
        // Simulate message sending (replace with actual WhatsApp API)
        console.log(`📱 WhatsApp message for ${lead.firstname}: ${message}`);
        
      } catch (error) {
        console.error(`❌ Error processing lead ${lead.id}:`, error);
      }
    }
  }

  private async startEmailAutomation(campaign: Campaign, client: any, userId: string) {
    console.log('📧 Starting Email automation for campaign:', campaign.name);
    
    // Get leads from client's CRM
    const leads = await this.aiService.getClientLeads(client.id, userId);
    console.log(`📊 Found ${leads.leads.length} leads for Email automation`);

    // Start AI email processing
    for (const lead of leads.leads.slice(0, 20)) { // Process first 20 leads
      try {
        // Generate personalized email
        const message = await this.aiService.generateLeadMessage(lead, campaign.name);
        
        // Send email using existing AI service
        await this.aiService.sendMessageToLead(client.id, lead.id, campaign.name, userId);
        
        // Log AI activity
        await this.logAiActivity(campaign.id, 'email_sent', `Email sent to ${lead.firstname} ${lead.lastname}`);
        
        // Update campaign metrics
        await this.updateCampaignMetrics(campaign.id, 'leads_processed', 1);
        
      } catch (error) {
        console.error(`❌ Error processing lead ${lead.id}:`, error);
      }
    }
  }

  private async startSmsAutomation(campaign: Campaign, client: any, userId: string) {
    console.log('📱 Starting SMS automation for campaign:', campaign.name);
    
    // Similar to WhatsApp but for SMS
    const leads = await this.aiService.getClientLeads(client.id, userId);
    console.log(`📊 Found ${leads.leads.length} leads for SMS automation`);

    for (const lead of leads.leads.slice(0, 15)) {
      try {
        const message = await this.aiService.generateLeadMessage(lead, campaign.name);
        console.log(`📱 SMS for ${lead.firstname}: ${message}`);
        
        await this.logAiActivity(campaign.id, 'sms_generated', `SMS generated for ${lead.firstname} ${lead.lastname}`);
        await this.updateCampaignMetrics(campaign.id, 'leads_processed', 1);
        
      } catch (error) {
        console.error(`❌ Error processing lead ${lead.id}:`, error);
      }
    }
  }

  private async startMultiChannelAutomation(campaign: Campaign, client: any, userId: string) {
    console.log('🔄 Starting Multi-channel automation for campaign:', campaign.name);
    
    // Combine all channels
    await this.startEmailAutomation(campaign, client, userId);
    await this.startWhatsAppAutomation(campaign, client, userId);
    await this.startSmsAutomation(campaign, client, userId);
  }

  private async getCampaignById(campaignId: string, userId: string): Promise<Campaign | null> {
    const { data, error } = await this.supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  private async updateCampaignStatus(campaignId: string, status: string, userId: string) {
    const { error } = await this.supabase
      .from('campaigns')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'active' && { started_at: new Date().toISOString() }),
        ...(status === 'paused' && { paused_at: new Date().toISOString() })
      })
      .eq('id', campaignId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }

  private async logAiActivity(campaignId: string, activityType: string, description: string) {
    const { error } = await this.supabase
      .from('ai_campaign_activities')
      .insert([{
        campaign_id: campaignId,
        activity_type: activityType,
        description,
        created_at: new Date().toISOString()
      }]);

    if (error) console.error('Error logging AI activity:', error);
  }

  private async updateCampaignMetrics(campaignId: string, metricType: string, increment: number) {
    // First get current count
    const { data: campaign, error: fetchError } = await this.supabase
      .from('campaigns')
      .select('leads_count')
      .eq('id', campaignId)
      .single();

    if (fetchError) {
      console.error('Error fetching campaign:', fetchError);
      return;
    }

    // Update with new count
    const { error } = await this.supabase
      .from('campaigns')
      .update({
        leads_count: (campaign.leads_count || 0) + increment,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId);

    if (error) console.error('Error updating metrics:', error);
  }
}
