import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { AiCampaignService } from './ai-campaign.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import type { CreateCampaignData } from './campaign.interface';

@Controller('campaigns')
@UseGuards(SupabaseAuthGuard)
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly aiCampaignService: AiCampaignService
  ) {}

  @Get()
  async getAllCampaigns(@Request() req) {
    const userId = req.user.id;
    return await this.campaignsService.getAllCampaigns(userId);
  }

  @Get('ai-dashboard')
  async getAiDashboard(@Request() req) {
    console.log('🔍 AI Dashboard: Getting dashboard for user:', req.user.id);
    
    try {
      const userId = req.user.id;
      
      // Simple response for now
      console.log('📊 AI Dashboard: Returning simple response');
      return {
        total_active_campaigns: 0,
        campaigns: []
      };
    } catch (error) {
      console.error('❌ AI Dashboard error:', error);
      throw error;
    }
  }

  @Post('add')
  async addCampaign(@Body() campaignData: CreateCampaignData, @Request() req) {
    const userId = req.user.id;
    return await this.campaignsService.addCampaign({ ...campaignData, user_id: userId });
  }

  @Get(':id')
  async getCampaignById(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return await this.campaignsService.getCampaignById(id, userId);
  }

  @Get(':id/ai-status')
  async getAiStatus(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return await this.aiCampaignService.getAiCampaignStatus(id, userId);
  }

  @Put(':id')
  async updateCampaign(@Param('id') id: string, @Body() updateData: any, @Request() req) {
    const userId = req.user.id;
    return await this.campaignsService.updateCampaign(id, updateData, userId);
  }

  @Post(':id/start')
  async startCampaign(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    console.log('🚀 Starting campaign with AI automation:', id);
    
    try {
      // Start the campaign in database
      const campaign = await this.campaignsService.startCampaign(id, userId);
      
      // Start AI automation
      const aiResult = await this.aiCampaignService.startAiCampaign(id, userId);
      
      return {
        ...campaign,
        ai_automation: aiResult
      };
    } catch (error) {
      console.error('❌ Error starting AI campaign:', error);
      throw error;
    }
  }

  @Post(':id/pause')
  async pauseCampaign(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    console.log('⏸️ Pausing AI campaign:', id);
    
    try {
      // Pause AI automation
      await this.aiCampaignService.stopAiCampaign(id, userId);
      
      // Pause campaign in database
      return await this.campaignsService.pauseCampaign(id, userId);
    } catch (error) {
      console.error('❌ Error pausing AI campaign:', error);
      throw error;
    }
  }

  @Post(':id/stop')
  async stopCampaign(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return await this.campaignsService.stopCampaign(id, userId);
  }

  @Delete(':id')
  async deleteCampaign(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return await this.campaignsService.deleteCampaign(id, userId);
  }
}
