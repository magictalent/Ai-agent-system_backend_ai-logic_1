import { Body, Controller, Post, Query, Request } from '@nestjs/common';
import { SequencesService } from './sequences.service';

@Controller('sequences')
export class SequencesController {
  constructor(private readonly sequences: SequencesService) {}

  @Post('start')
  async start(
    @Body() body: { clientId: string; leadId: string; campaignId: string; channel?: 'email' },
  ) {
    return this.sequences.startSequence(body);
  }

  @Post('tick')
  async tick(@Query('limit') limit?: string, @Request() _req: any) {
    const n = limit ? parseInt(limit, 10) : 10;
    return this.sequences.tick(n);
  }
}

