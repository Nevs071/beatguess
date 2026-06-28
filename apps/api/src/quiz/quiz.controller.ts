import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { QuizService } from './quiz.service';

type GenerateQuizBody = {
  artistIds: number[];
  amount?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
};

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('generate')
  generateQuiz(@Body() body: GenerateQuizBody) {
    if (!body.artistIds || !Array.isArray(body.artistIds)) {
      throw new BadRequestException('artistIds must be an array');
    }

    const artistIds = body.artistIds
      .map((artistId) => Number(artistId))
      .filter(Boolean);

    if (artistIds.length === 0) {
      throw new BadRequestException('At least one valid artistId is required');
    }

    return this.quizService.generateQuiz(
  artistIds,
  body.amount ?? 10,
  body.difficulty ?? 'easy',
);
  }
}