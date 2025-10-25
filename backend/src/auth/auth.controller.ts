import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  @Public()
  async register(@Body() body: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    password: string; 
    companyName: string; 
  }) {
    return this.authService.register(body);
  }

  @Get('profile')
  @UseGuards(SupabaseAuthGuard)
  async getProfile(@Request() req) {
    return {
      user: req.user,
      message: 'Profile retrieved successfully',
    };
  }

  @Get('verify')
  @UseGuards(SupabaseAuthGuard)
  async verifyToken(@Request() req) {
    return {
      valid: true,
      user: req.user,
      message: 'Token is valid',
    };
  }
}
