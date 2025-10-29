import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SequencesService } from './sequences.service';

@Injectable()
export class SequencesWorker {
  constructor(private readonly sequences: SequencesService) {}

  // Run every minute to process due queued steps
  @Cron(CronExpression.EVERY_MINUTE)
  async handleTick() {
    try {
      await this.sequences.tick(50);
    } catch (e) {
      // non-fatal
      // console.warn('[SequencesWorker] tick failed:', (e as any)?.message || e)
    }
  }
}

