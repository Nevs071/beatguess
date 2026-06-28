import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { MusicModule } from '../music/music.module';

@Module({
  imports: [MusicModule],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}