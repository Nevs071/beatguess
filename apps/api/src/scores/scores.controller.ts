import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScoresService } from './scores.service';

@Controller('scores')
export class ScoresController {
  constructor(
    private readonly scoresService: ScoresService,
    private readonly configService: ConfigService,
  ) {}

  private checkInternalSecret(secretHeader?: string) {
    const expectedSecret = this.configService.get<string>('INTERNAL_API_SECRET');

    if (!expectedSecret) {
      throw new Error('INTERNAL_API_SECRET is missing');
    }

    if (!secretHeader || secretHeader !== expectedSecret) {
      throw new UnauthorizedException('Invalid internal API secret');
    }
  }

  @Post()
  async createScore(
    @Headers('x-internal-api-secret') secretHeader: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.checkInternalSecret(secretHeader);

    if (!body.auth0Sub || typeof body.auth0Sub !== 'string') {
      throw new BadRequestException('auth0Sub is required');
    }

    if (typeof body.score !== 'number') {
      throw new BadRequestException('score is required');
    }

    if (typeof body.totalQuestions !== 'number') {
      throw new BadRequestException('totalQuestions is required');
    }

    if (typeof body.correctAnswers !== 'number') {
      throw new BadRequestException('correctAnswers is required');
    }

    if (typeof body.accuracy !== 'number') {
      throw new BadRequestException('accuracy is required');
    }

    if (!body.difficulty || typeof body.difficulty !== 'string') {
      throw new BadRequestException('difficulty is required');
    }

    if (!body.answerMode || typeof body.answerMode !== 'string') {
      throw new BadRequestException('answerMode is required');
    }

    const score = await this.scoresService.createScore({
      auth0Sub: body.auth0Sub,
      playerName:
        typeof body.playerName === 'string' ? body.playerName : undefined,
      playerEmail:
        typeof body.playerEmail === 'string' ? body.playerEmail : undefined,
      playerPicture:
        typeof body.playerPicture === 'string' ? body.playerPicture : undefined,
      score: body.score,
      totalQuestions: body.totalQuestions,
      correctAnswers: body.correctAnswers,
      accuracy: body.accuracy,
      difficulty: body.difficulty,
      answerMode: body.answerMode,
      typedAnswerKind:
        typeof body.typedAnswerKind === 'string'
          ? body.typedAnswerKind
          : undefined,
      artists: Array.isArray(body.artists)
        ? body.artists.filter((artist): artist is string => typeof artist === 'string')
        : [],
    });

    return { score };
  }

  @Get('me')
  async getMyScores(
    @Headers('x-internal-api-secret') secretHeader: string | undefined,
    @Query('auth0Sub') auth0Sub?: string,
  ) {
    this.checkInternalSecret(secretHeader);

    if (!auth0Sub) {
      throw new BadRequestException('auth0Sub is required');
    }

    const scores = await this.scoresService.getScoresForUser(auth0Sub);

    return { scores };
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Headers('x-internal-api-secret') secretHeader: string | undefined,
    @Query('limit') limit?: string,
  ) {
    this.checkInternalSecret(secretHeader);

    const parsedLimit = limit ? Number(limit) : 50;
    const scores = await this.scoresService.getLeaderboard(parsedLimit);

    return { scores };
  }
}