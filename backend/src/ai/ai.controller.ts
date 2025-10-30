import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('get-leads')
  async getLeads(@Body() body: { clientId: string }, @CurrentUser() user: any) {
    return this.aiService.getClientLeads(body.clientId, user.id);
  }

  @Post('send-message')
  async sendMessage(@Body() body: { clientId: string; leadId: string; offer: string; tone?: 'friendly' | 'professional' | 'casual' }, @CurrentUser() user: any) {
    return this.aiService.sendMessageToLead(body.clientId, body.leadId, body.offer, user.id, { tone: body.tone });
  }

  @Post('book-meeting')
  async bookMeeting(@Body() body: { clientId: string; leadId: string; time: string }, @CurrentUser() user: any) {
    return this.aiService.bookMeeting(body.clientId, body.leadId, body.time, user.id);
  }

  // Generic assistant chat endpoint used by the UI slide-over panel
  @Post('assistant')
  async assistant(@Body() body: { prompt: string; context?: any }, @CurrentUser() user: any) {
    const text = await this.aiService.simpleAssistantChat(body.prompt, body.context, user?.id);
    return { text };
  }
}
