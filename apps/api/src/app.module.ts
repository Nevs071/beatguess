import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MusicModule } from './music/music.module';
import { QuizModule } from './quiz/quiz.module';
import { DatabaseModule } from './database/database.module';
import { ScoresModule } from './scores/scores.module';
import { ChallengesModule } from './challenges/challenges.module';
import { AnswerValidationModule } from './answer-validation/answer-validation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    MusicModule,
    QuizModule,
    ScoresModule,
    ChallengesModule,
    AnswerValidationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}