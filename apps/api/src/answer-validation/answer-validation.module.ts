import { Module } from '@nestjs/common';
import { AnswerValidationController } from './answer-validation.controller';
import { AnswerValidationService } from './answer-validation.service';

@Module({
  controllers: [AnswerValidationController],
  providers: [AnswerValidationService],
})
export class AnswerValidationModule {}