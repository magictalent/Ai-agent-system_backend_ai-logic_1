import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('get-leads')
  async getLeads(@Body() body: { clientId: string }) {
    return this.aiService.getClientLeads(body.clientId);
  }

  @Post('send-message')
  async sendMessage(@Body() body: { clientId: string; leadId: string; offer: string }) {
    return this.aiService.sendMessageToLead(body.clientId, body.leadId, body.offer);
  }

  @Post('book-meeting')
  async bookMeeting(@Body() body: { clientId: string; leadId: string; time: string }) {
    return this.aiService.bookMeeting(body.clientId, body.leadId, body.time);
  }
}
