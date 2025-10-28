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
    // Determine client name: if client_id not provided, use a default label
    let clientName = 'My Business';
    if (campaignData.client_id) {
      const { data: clientData, error: clientError } = await this.supabase
        .from('clients')
        .select('name')
        .eq('id', campaignData.client_id)
        .eq('user_id', campaignData.user_id)
        .single();
      if (clientError) throw new Error('Client not found');
      clientName = clientData.name;
    }

    const { data, error } = await this.supabase
      .from('campaigns')
      .insert([{
        ...campaignData,
        client_id: campaignData.client_id || campaignData.user_id,
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
