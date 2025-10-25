import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('Loaded SUPABASE_URL:', process.env.SUPABASE_URL);
        console.log('Loaded SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY?.slice(0, 10) + '...');

        const url = config.get<string>('SUPABASE_URL');
        const key =
          config.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
          config.get<string>('SUPABASE_ANON_KEY');

        const missing: string[] = [];
        if (!url) missing.push('SUPABASE_URL');
        if (!key) missing.push('SUPABASE_SERVICE_ROLE_KEY | SUPABASE_ANON_KEY');

        if (missing.length) {
          throw new Error(`Missing Supabase env vars: ${missing.join(', ')}`);
        }

        return createClient(url as string, key as string);
      },
    },
    SupabaseService,
  ],
  exports: ['SUPABASE_CLIENT', SupabaseService],
})
export class SupabaseModule {}