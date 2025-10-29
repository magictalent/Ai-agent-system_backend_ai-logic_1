import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('messages')
@UseGuards(SupabaseAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  async getConversations(@Request() req) {
    const userId = req.user.id;
    console.log('🔍 MessagesController: Getting conversations for user:', userId);
    
    try {
      const conversations = await this.messagesService.getConversations(userId);
      console.log('✅ MessagesController: Returning conversations:', conversations.length);
      return conversations;
    } catch (error) {
      console.error('❌ MessagesController: Error getting conversations:', error);
      throw error;
    }
  }

  @Get('campaign/:campaignId')
  async getMessagesByCampaign(@Param('campaignId') campaignId: string, @Request() req) {
    const userId = req.user.id;
    return await this.messagesService.getMessagesByCampaign(campaignId, userId);
  }

  @Get('lead/:leadId')
  async getMessagesByLead(@Param('leadId') leadId: string, @Request() req) {
    const userId = req.user.id;
    return await this.messagesService.getMessagesByLead(leadId, userId);
  }

  // DEV/testing helper: simulate an inbound reply from a lead
  @Post('simulate')
  async simulate(
    @Body() body: { leadId: string; content: string; campaignId?: string },
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.messagesService.simulateInboundMessage({
      userId,
      leadId: body.leadId,
      content: body.content,
      campaignId: body.campaignId,
    });
  }

  // Manually trigger an AI auto-reply for the latest inbound from a lead
  @Post('auto-reply')
  async autoReply(
    @Body() body: { leadId: string; campaignId?: string; tone?: 'friendly' | 'professional' | 'casual' },
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.messagesService.autoReplyToInbound({
      userId,
      leadId: body.leadId,
      campaignId: body.campaignId,
      tone: body.tone,
    });
  }
}
