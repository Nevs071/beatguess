import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MusicModule } from './music/music.module';
import { QuizModule } from './quiz/quiz.module';

@Module({
  imports: [MusicModule, QuizModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}