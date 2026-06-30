import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChallengesService } from './challenges.service';

@Controller('challenges')
export class ChallengesController {
  constructor(
    private readonly challengesService: ChallengesService,
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
  async createChallenge(
    @Headers('x-internal-api-secret') secretHeader: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.checkInternalSecret(secretHeader);

    if (!body.auth0Sub || typeof body.auth0Sub !== 'string') {
      throw new BadRequestException('auth0Sub is required');
    }

    if (!Array.isArray(body.artistIds)) {
      throw new BadRequestException('artistIds is required');
    }

    if (!body.difficulty || typeof body.difficulty !== 'string') {
      throw new BadRequestException('difficulty is required');
    }

    if (typeof body.questionAmount !== 'number') {
      throw new BadRequestException('questionAmount is required');
    }

    if (!body.answerMode || typeof body.answerMode !== 'string') {
      throw new BadRequestException('answerMode is required');
    }
    if (body.quizPayload == null) {
  throw new BadRequestException('quizPayload is required');
}

    const challenge = await this.challengesService.createChallenge({
      auth0Sub: body.auth0Sub,
      playerName:
        typeof body.playerName === 'string' ? body.playerName : undefined,
      playerEmail:
        typeof body.playerEmail === 'string' ? body.playerEmail : undefined,
      artistIds: body.artistIds.filter(
        (artistId): artistId is string => typeof artistId === 'string',
      ),
      difficulty: body.difficulty,
      questionAmount: body.questionAmount,
      answerMode: body.answerMode,
      typedAnswerKind:
        typeof body.typedAnswerKind === 'string'
          ? body.typedAnswerKind
          : undefined,
          quizPayload: body.quizPayload,
    });

    return { challenge };
  }

  @Get(':roomCode')
  async getChallenge(
    @Headers('x-internal-api-secret') secretHeader: string | undefined,
    @Param('roomCode') roomCode: string,
  ) {
    this.checkInternalSecret(secretHeader);

    const challenge = await this.challengesService.getChallenge(roomCode);

    if (!challenge) {
      throw new BadRequestException('Challenge room not found');
    }

    return challenge;
  }

  @Post(':roomCode/scores')
  async createChallengeScore(
    @Headers('x-internal-api-secret') secretHeader: string | undefined,
    @Param('roomCode') roomCode: string,
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

    const score = await this.challengesService.createChallengeScore({
      roomCode,
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
    });

    return { score };
  }
}