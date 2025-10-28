import { Module } from '@nestjs/common';
import { SequencesService } from './sequences.service';
import { SequencesController } from './sequences.controller';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [IntegrationsModule],
  controllers: [SequencesController],
  providers: [SequencesService],
  exports: [SequencesService],
})
export class SequencesModule {}
