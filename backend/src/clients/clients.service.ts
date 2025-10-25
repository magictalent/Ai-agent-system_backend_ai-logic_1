import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Client } from './client.interface';

@Injectable()
export class ClientsService {
  constructor(@Inject('SUPABASE_CLIENT') private supabase: SupabaseClient) {}

  async testConnection() {
    console.log('🧪 Testing Supabase connection...');
    const { data, error } = await this.supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    console.log('📊 Test connection result:', { data, error });
    return { data, error };
  }

  async getAllClients(userId: string) {
    console.log('🔍 ClientsService: Getting clients for user:', userId);
    
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    console.log('📊 ClientsService: Query result:', { data, error });
    
    if (error) {
      console.error('❌ ClientsService: Database error:', error);
      throw new Error(error.message);
    }
    
    console.log('✅ ClientsService: Found clients:', data?.length || 0);
    return data;
  }

  async getClientById(id: string, userId: string): Promise<Client | undefined> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async addClient(clientData: any) {
    console.log('🔍 ClientsService: Adding client with data:', clientData);
    
    try {
      // Validate required fields
      if (!clientData.name || !clientData.email || !clientData.user_id) {
        throw new Error('Missing required fields: name, email, or user_id');
      }
      
      // Only use basic fields that definitely exist
      const insertData = {
        name: clientData.name.trim(),
        email: clientData.email.trim().toLowerCase(),
        phone: clientData.phone?.trim() || null,
        industry: clientData.industry?.trim() || null,
        crm_provider: clientData.crm_provider || 'mock',
        user_id: clientData.user_id
      };

      console.log('📝 ClientsService: Inserting client data:', insertData);

      const { data, error } = await this.supabase
        .from('clients')
        .insert([insertData])
        .select();
    
      console.log('📊 ClientsService: Insert result:', { data, error });
    
      if (error) {
        console.error('❌ ClientsService: Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        console.error('❌ ClientsService: No data returned from insert');
        throw new Error('No data returned from insert operation');
      }
      
      console.log('✅ ClientsService: Client added successfully:', data[0]);
      return data[0];
    } catch (error) {
      console.error('❌ ClientsService: Error in addClient:', error);
      throw error;
    }
  }
  
  async updateClient(id: string, updateData: any, userId: string) {
    const { data, error } = await this.supabase
      .from('clients')
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

  async deleteClient(id: string, userId: string) {
    const { error } = await this.supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return { success: true };
  }
}
