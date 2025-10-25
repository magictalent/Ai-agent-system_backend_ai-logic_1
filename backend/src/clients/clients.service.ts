import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Client } from './client.interface';

@Injectable()
export class ClientsService {
  constructor(@Inject('SUPABASE_CLIENT') private supabase: SupabaseClient) {}

  async getAllClients() {
    const { data, error } = await this.supabase.from('clients').select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  async getClientById(id: string): Promise<Client | undefined> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async addClient(clientData: Partial<Client>) {
    const { data, error } = await this.supabase.from('clients').insert([clientData]).select();
    if (error) throw new Error(error.message);
    return data?.[0];
  }

  async updateClient(id: string, updateData: any) {
    const { data, error } = await this.supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw new Error(error.message);
    return data?.[0];
  }
}
