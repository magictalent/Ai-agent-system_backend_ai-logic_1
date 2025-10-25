import { Controller, Get } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Controller('supabase')
export class SupabaseController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get('ping')
  async ping() {
    const { data, error } = await this.supabase.client.from('clients').select('id, name').limit(1);
    if (error) throw new Error(error.message);
    return {
      message: '✅ Supabase connected successfully',
      sampleClient: data[0] || null,
    };
  }
}
