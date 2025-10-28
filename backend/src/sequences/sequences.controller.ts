import { Body, Controller, Post, Query, Request } from '@nestjs/common';
import { SequencesService } from './sequences.service';

@Controller('sequences')
export class SequencesController {
  constructor(private readonly sequences: SequencesService) {}

  @Post('start')
  async start(
    @Body() body: { clientId: string; campaignId: string; leadId?: string; leadEmail?: string; channel?: 'email' | 'sms' | 'whatsapp' },
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
}
