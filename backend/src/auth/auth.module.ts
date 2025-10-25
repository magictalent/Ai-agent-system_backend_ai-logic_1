import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseStrategy } from './supabase.strategy';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    PassportModule,
    SupabaseModule,
  ],
  providers: [AuthService, SupabaseStrategy, SupabaseAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, SupabaseAuthGuard],
})
export class AuthModule {}
