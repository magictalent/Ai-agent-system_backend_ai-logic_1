import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor(private readonly supabaseService: SupabaseService) {
    super();
  }

  async validate(req: any) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Use Supabase service role to verify the token
      const { data: { user }, error } = await this.supabaseService.client.auth.getUser(token);
      
      if (error || !user) {
        throw new UnauthorizedException('Invalid token');
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        aud: user.aud,
      };
    } catch (error) {
      throw new UnauthorizedException('Token validation failed');
    }
  }
}