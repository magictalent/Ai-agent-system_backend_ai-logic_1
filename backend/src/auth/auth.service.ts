import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async login(email: string, password: string) {
    try {
      const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          throw new UnauthorizedException('Invalid email or password');
        } else if (error.message.includes('Email not confirmed')) {
          throw new UnauthorizedException('Please verify your email address before logging in');
        } else {
          throw new UnauthorizedException(error.message);
        }
      }

      if (!data.session) {
        throw new UnauthorizedException('No session created');
      }

      return {
        access_token: data.session.access_token,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          firstName: data.user?.user_metadata?.first_name || '',
          lastName: data.user?.user_metadata?.last_name || '',
          role: data.user?.role || 'user',
          organization: {
            id: data.user?.user_metadata?.organization_id || '',
            name: data.user?.user_metadata?.company_name || '',
          }
        }
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyName: string;
  }) {
    try {
      const { data, error } = await this.supabaseService.client.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            company_name: userData.companyName,
          }
        }
      });

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
        }
      };
    } catch (error) {
      throw new BadRequestException('Registration failed');
    }
  }

  async validateUser(token: string): Promise<any> {
    try {
      // Verify the JWT token with Supabase
      const { data: { user }, error } = await this.supabaseService.client.auth.getUser(token);
      
      if (error || !user) {
        throw new UnauthorizedException('Invalid token');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Token validation failed');
    }
  }

  async getUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabaseService.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw new UnauthorizedException('User profile not found');
      }

      return data;
    } catch (error) {
      throw new UnauthorizedException('Failed to fetch user profile');
    }
  }
}
