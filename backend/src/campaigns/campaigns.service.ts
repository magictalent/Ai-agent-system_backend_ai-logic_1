import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Campaign, CreateCampaignData } from './campaign.interface';

@Injectable()
export class CampaignsService {
  constructor(@Inject('SUPABASE_CLIENT') private supabase: SupabaseClient) {}

  async getAllCampaigns(userId: string) {
    console.log('🔍 CampaignsService: Getting campaigns for user:', userId);
    
    try {
      // First, let's try a simple query without joins
      const { data, error } = await this.supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      console.log('📊 CampaignsService: Query result:', { data, error });
      
      if (error) {
        console.error('❌ CampaignsService: Database error:', error);
        throw new Error(error.message);
      }
      
      console.log('✅ CampaignsService: Found campaigns:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ CampaignsService: Error getting campaigns:', error);
      throw error;
    }
  }

  async getCampaignById(id: string, userId: string): Promise<Campaign | undefined> {
    const { data, error } = await this.supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async addCampaign(campaignData: CreateCampaignData & { user_id: string }) {
    // Resolve a valid client_id and client_name
    let resolvedClientId = campaignData.client_id?.trim();
    let clientName = 'My Business';

    if (resolvedClientId) {
      const { data: clientData, error: clientError } = await this.supabase
        .from('clients')
        .select('id,name')
        .eq('id', resolvedClientId)
        .eq('user_id', campaignData.user_id)
        .maybeSingle();
      if (clientError || !clientData) {
        throw new Error('Client not found for this user');
      }
      clientName = clientData.name;
    } else {
      // No client provided — pick the first client for user, or create a default one
      const { data: firstClient } = await this.supabase
        .from('clients')
        .select('id,name')
        .eq('user_id', campaignData.user_id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (firstClient?.id) {
        resolvedClientId = firstClient.id;
        clientName = firstClient.name;
      } else {
        // Create a default client for this user
        const defaultEmail = `${campaignData.user_id}@local`; // unique per user
        const { data: created, error: createErr } = await this.supabase
          .from('clients')
          .insert([{ name: 'My Business', email: defaultEmail, crm_provider: 'mock', user_id: campaignData.user_id }])
          .select('id,name')
          .maybeSingle();
        if (createErr || !created?.id) {
          throw new Error(createErr?.message || 'Failed to create default client');
        }
        resolvedClientId = created.id;
        clientName = created.name;
      }
    }

    // Ensure channel default
    const channel = (campaignData.channel || 'email') as Campaign['channel'];

    const { data, error } = await this.supabase
      .from('campaigns')
      .insert([{
        user_id: campaignData.user_id,
        client_id: resolvedClientId,
        name: campaignData.name,
        description: campaignData.description || null,
        channel,
        tone: (campaignData.tone as any) || 'friendly',
        client_name: clientName,
        leads_count: 0,
        appointments_count: 0,
        response_rate: 0,
        status: 'draft'
      }])
      .select();
  
    if (error) throw new Error(error.message);
    return data?.[0];
  }
  
  async updateCampaign(id: string, updateData: any, userId: string) {
    const { data, error } = await this.supabase
      .from('campaigns')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) throw new Error(error.message);
    return data?.[0];
  }

  async startCampaign(id: string, userId: string) {
    const { data, error } = await this.supabase
      .from('campaigns')
      .update({
        status: 'active',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) throw new Error(error.message);
    return data?.[0];
  }

  async pauseCampaign(id: string, userId: string) {
    const { data, error } = await this.supabase
      .from('campaigns')
      .update({
        status: 'paused',
        paused_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) throw new Error(error.message);
    return data?.[0];
  }

  async stopCampaign(id: string, userId: string) {
    const { data, error } = await this.supabase
      .from('campaigns')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) throw new Error(error.message);
    return data?.[0];
  }

  async deleteCampaign(id: string, userId: string) {
    const { error } = await this.supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return { success: true };
  }
}
