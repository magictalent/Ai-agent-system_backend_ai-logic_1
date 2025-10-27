import { Module } from '@nestjs/common';
import { SequencesService } from './sequences.service';
import { SequencesController } from './sequences.controller';
import { GmailService } from '../integrations/gmail.service';

@Module({
  controllers: [SequencesController],
  providers: [SequencesService, GmailService],
  exports: [SequencesService],
})
export class SequencesModule {}

