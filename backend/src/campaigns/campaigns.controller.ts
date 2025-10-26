import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { AiCampaignService } from './ai-campaign.service';
import { ClientsService } from '../clients/clients.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import type { CreateCampaignData } from './campaign.interface';

@Controller('campaigns')
@UseGuards(SupabaseAuthGuard)
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly aiCampaignService: AiCampaignService,
    private readonly clientsService: ClientsService
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
      
      // Get active campaigns
      const campaigns = await this.campaignsService.getAllCampaigns(userId);
      const activeCampaigns = campaigns.filter(c => c.status === 'active');
      
      console.log('📊 AI Dashboard: Found campaigns:', campaigns.length, 'Active:', activeCampaigns.length);
      
      // Get AI status for each campaign
      const campaignsWithAiStatus = await Promise.all(
        activeCampaigns.map(async (campaign) => {
          try {
            const aiStatus = await this.aiCampaignService.getAiCampaignStatus(campaign.id, userId);
            return {
              ...campaign,
              ai_status: aiStatus
            };
          } catch (error) {
            console.error(`❌ Error getting AI status for campaign ${campaign.id}:`, error);
            return {
              ...campaign,
              ai_status: {
                campaignId: campaign.id,
                activities: [],
                lastActivity: null
              }
            };
          }
        })
      );
      
      return {
        total_active_campaigns: activeCampaigns.length,
        campaigns: campaignsWithAiStatus
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

  @Get(':id/test-leads')
  async testLeads(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    console.log('🧪 Testing leads for campaign:', id);
    
    try {
      // Get campaign details
      const campaign = await this.campaignsService.getCampaignById(id, userId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Get client details
      const client = await this.clientsService.getClientById(campaign.client_id, userId);
      if (!client) {
        throw new Error('Client not found');
      }

      console.log('📊 Campaign details:', {
        id: campaign.id,
        name: campaign.name,
        client_id: campaign.client_id,
        client_name: client.name,
        crm_provider: client.crm_provider
      });

      // Test lead fetching
      const leads = await this.aiCampaignService.testLeadFetching(client.id, userId);
      
      return {
        campaign: {
          id: campaign.id,
          name: campaign.name,
          client_id: campaign.client_id
        },
        client: {
          id: client.id,
          name: client.name,
          crm_provider: client.crm_provider
        },
        leads: leads
      };
    } catch (error) {
      console.error('❌ Error testing leads:', error);
      throw error;
    }
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
