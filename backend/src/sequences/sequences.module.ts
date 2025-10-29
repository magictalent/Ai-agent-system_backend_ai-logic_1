import { Module } from '@nestjs/common';
import { SequencesService } from './sequences.service';
import { SequencesController } from './sequences.controller';
import { IntegrationsModule } from '../integrations/integrations.module';
import { AiModule } from '../ai/ai.module';
import { SequencesWorker } from './sequences.worker';

@Module({
  imports: [IntegrationsModule, AiModule],
  controllers: [SequencesController],
  providers: [SequencesService, SequencesWorker],
  exports: [SequencesService],
})
export class SequencesModule {}
