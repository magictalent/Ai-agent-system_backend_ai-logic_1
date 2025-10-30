import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SequencesService } from './sequences.service';

@Injectable()
export class SequencesWorker implements OnModuleInit, OnModuleDestroy {
  private interval?: NodeJS.Timeout;
  constructor(private readonly sequences: SequencesService) {}

  onModuleInit() {
    // Run every minute to process due queued steps
    this.interval = setInterval(async () => {
      try {
        await this.sequences.tick(50);
      } catch (e) {
        // non-fatal
      }
    }, 60 * 1000);
  }

  onModuleDestroy() {
    if (this.interval) clearInterval(this.interval);
  }
}
