import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
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
}
