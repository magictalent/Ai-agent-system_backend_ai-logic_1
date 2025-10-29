import { Body, Controller, Post, Query, Request } from '@nestjs/common';
import { SequencesService } from './sequences.service';

@Controller('sequences')
export class SequencesController {
  constructor(private readonly sequences: SequencesService) {}

  @Post('start')
  async start(
    @Body() body: { clientId: string; campaignId: string; leadId?: string; leadEmail?: string; channel?: 'email' | 'sms' | 'whatsapp'; tone?: 'friendly' | 'professional' | 'casual' },
  ) {
    return this.sequences.startSequence(body);
  }

  @Post('tick')
  async tick(@Query('limit') limit?: string) {
    const n = limit ? parseInt(limit, 10) : 10;
    return this.sequences.tick(n);
  }

  @Post('queue')
  async queue(@Body() body: { campaignId: string; limit?: number }) {
    return this.sequences.listQueueByCampaign(body.campaignId, body.limit || 5);
  }

  // Enqueue sequences for all eligible leads for a campaign
  @Post('start-all')
  async startAll(@Body() body: { clientId: string; campaignId: string; channel?: 'email' | 'sms' | 'whatsapp'; tone?: 'friendly' | 'professional' | 'casual'; limit?: number }) {
    return this.sequences.startSequenceForAllLeads({
      clientId: body.clientId,
      campaignId: body.campaignId,
      channel: body.channel || 'email',
      tone: body.tone,
      limit: body.limit || 1000,
    });
  }
}
