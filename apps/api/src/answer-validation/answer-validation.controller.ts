import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AnswerKind,
  AnswerValidationService,
} from './answer-validation.service';

@Controller('answer-validation')
export class AnswerValidationController {
  constructor(
    private readonly answerValidationService: AnswerValidationService,
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

  @Post('typed')
  async validateTypedAnswer(
    @Headers('x-internal-api-secret') secretHeader: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.checkInternalSecret(secretHeader);

    const validAnswerKinds: AnswerKind[] = ['song', 'artist', 'album'];

    if (
      !body.answerKind ||
      typeof body.answerKind !== 'string' ||
      !validAnswerKinds.includes(body.answerKind as AnswerKind)
    ) {
      throw new BadRequestException('answerKind is required');
    }

    if (!body.correctAnswer || typeof body.correctAnswer !== 'string') {
      throw new BadRequestException('correctAnswer is required');
    }

    if (!body.userAnswer || typeof body.userAnswer !== 'string') {
      throw new BadRequestException('userAnswer is required');
    }

    return this.answerValidationService.validateTypedAnswer({
      answerKind: body.answerKind as AnswerKind,
      correctAnswer: body.correctAnswer,
      userAnswer: body.userAnswer,
    });
  }
}