import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type AnswerKind = 'song' | 'artist' | 'album';

export type AnswerValidationInput = {
  answerKind: AnswerKind;
  correctAnswer: string;
  userAnswer: string;
};

export type AnswerValidationResult = {
  isCorrect: boolean;
  confidence: number;
  method: 'rules' | 'ai' | 'ai-disabled';
  reason: string;
  normalizedUserAnswer: string;
  normalizedCorrectAnswer: string;
};

type RuleDecision = AnswerValidationResult & {
  shouldAskAi: boolean;
};

@Injectable()
export class AnswerValidationService {
  constructor(private readonly configService: ConfigService) {}

  async validateTypedAnswer(
    input: AnswerValidationInput,
  ): Promise<AnswerValidationResult> {
    const ruleDecision = this.validateWithRules(input);

    if (!ruleDecision.shouldAskAi) {
      return {
        isCorrect: ruleDecision.isCorrect,
        confidence: ruleDecision.confidence,
        method: ruleDecision.method,
        reason: ruleDecision.reason,
        normalizedUserAnswer: ruleDecision.normalizedUserAnswer,
        normalizedCorrectAnswer: ruleDecision.normalizedCorrectAnswer,
      };
    }

    const aiEnabled =
      this.configService.get<string>('AI_VALIDATION_ENABLED') === 'true';

    const openAiApiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!aiEnabled || !openAiApiKey) {
      return {
        isCorrect: false,
        confidence: ruleDecision.confidence,
        method: 'ai-disabled',
        reason:
          'The answer was ambiguous. AI fallback is disabled, so it was not accepted.',
        normalizedUserAnswer: ruleDecision.normalizedUserAnswer,
        normalizedCorrectAnswer: ruleDecision.normalizedCorrectAnswer,
      };
    }

    try {
      return await this.validateWithAi(input, ruleDecision, openAiApiKey);
    } catch (error) {
      console.error('AI answer validation failed:', error);

      return {
        isCorrect: false,
        confidence: ruleDecision.confidence,
        method: 'ai-disabled',
        reason:
          'The answer was ambiguous, but AI validation failed. It was not accepted.',
        normalizedUserAnswer: ruleDecision.normalizedUserAnswer,
        normalizedCorrectAnswer: ruleDecision.normalizedCorrectAnswer,
      };
    }
  }

  private validateWithRules(input: AnswerValidationInput): RuleDecision {
    const normalizedUserAnswer = this.normalizeAnswer(
      input.userAnswer,
      input.answerKind,
    );

    const normalizedCorrectAnswer = this.normalizeAnswer(
      input.correctAnswer,
      input.answerKind,
    );

    if (!normalizedUserAnswer || !normalizedCorrectAnswer) {
      return {
        isCorrect: false,
        confidence: 0,
        method: 'rules',
        reason: 'The answer is empty.',
        normalizedUserAnswer,
        normalizedCorrectAnswer,
        shouldAskAi: false,
      };
    }

    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      return {
        isCorrect: true,
        confidence: 1,
        method: 'rules',
        reason: 'Exact normalized match.',
        normalizedUserAnswer,
        normalizedCorrectAnswer,
        shouldAskAi: false,
      };
    }

    const distance = this.levenshteinDistance(
      normalizedUserAnswer,
      normalizedCorrectAnswer,
    );

    const longestLength = Math.max(
      normalizedUserAnswer.length,
      normalizedCorrectAnswer.length,
    );

    const similarity = 1 - distance / longestLength;

    const shorterLength = Math.min(
      normalizedUserAnswer.length,
      normalizedCorrectAnswer.length,
    );

    const shorterRatio = shorterLength / longestLength;

    const containsMainPart =
      shorterLength >= 5 &&
      shorterRatio >= 0.72 &&
      (normalizedCorrectAnswer.includes(normalizedUserAnswer) ||
        normalizedUserAnswer.includes(normalizedCorrectAnswer));

    if (containsMainPart) {
      return {
        isCorrect: true,
        confidence: 0.92,
        method: 'rules',
        reason: 'The main answer is contained in the official answer.',
        normalizedUserAnswer,
        normalizedCorrectAnswer,
        shouldAskAi: false,
      };
    }

    const isArtist = input.answerKind === 'artist';

    const acceptedByDistance = isArtist
      ? this.isArtistDistanceAcceptable(distance, longestLength, similarity)
      : this.isTitleDistanceAcceptable(distance, longestLength, similarity);

    if (acceptedByDistance) {
      return {
        isCorrect: true,
        confidence: Math.max(0.78, similarity),
        method: 'rules',
        reason: 'Accepted as a close typo.',
        normalizedUserAnswer,
        normalizedCorrectAnswer,
        shouldAskAi: false,
      };
    }

    if (similarity < 0.5) {
      return {
        isCorrect: false,
        confidence: 1 - similarity,
        method: 'rules',
        reason: 'The answer is too different from the official answer.',
        normalizedUserAnswer,
        normalizedCorrectAnswer,
        shouldAskAi: false,
      };
    }

    return {
      isCorrect: false,
      confidence: similarity,
      method: 'rules',
      reason: 'The answer is ambiguous and should be checked by AI.',
      normalizedUserAnswer,
      normalizedCorrectAnswer,
      shouldAskAi: true,
    };
  }

  private async validateWithAi(
    input: AnswerValidationInput,
    ruleDecision: RuleDecision,
    openAiApiKey: string,
  ): Promise<AnswerValidationResult> {
    const model =
      this.configService.get<string>('AI_VALIDATION_MODEL') ?? 'gpt-5.4-nano';

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${openAiApiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text:
                  'You are a strict but fair music quiz judge. Decide whether the user answer should be accepted. Do not require featured artists for song titles. Ignore accents, punctuation, casing, extra spaces, remaster/live/radio edit/version text, and small spelling mistakes. Be stricter for artist names than song titles. Return only valid JSON.',
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: JSON.stringify({
                  answerKind: input.answerKind,
                  officialAnswer: input.correctAnswer,
                  userAnswer: input.userAnswer,
                  normalizedOfficialAnswer: ruleDecision.normalizedCorrectAnswer,
                  normalizedUserAnswer: ruleDecision.normalizedUserAnswer,
                }),
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'answer_validation_result',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                isCorrect: {
                  type: 'boolean',
                },
                confidence: {
                  type: 'number',
                  minimum: 0,
                  maximum: 1,
                },
                reason: {
                  type: 'string',
                },
              },
              required: ['isCorrect', 'confidence', 'reason'],
            },
          },
        },
        max_output_tokens: 180,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    const outputText = this.extractFirstText(data);

    if (!outputText) {
      throw new Error('No AI output text returned.');
    }

    const parsed = JSON.parse(outputText) as {
      isCorrect: boolean;
      confidence: number;
      reason: string;
    };

    return {
      isCorrect: parsed.isCorrect,
      confidence: parsed.confidence,
      method: 'ai',
      reason: parsed.reason,
      normalizedUserAnswer: ruleDecision.normalizedUserAnswer,
      normalizedCorrectAnswer: ruleDecision.normalizedCorrectAnswer,
    };
  }

  private normalizeAnswer(value: string, answerKind: AnswerKind) {
    let normalizedValue = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (answerKind !== 'artist') {
      normalizedValue = normalizedValue
        .replace(/\s*\(.*?(feat\.?|ft\.?|featuring|avec|with).*?\)/gi, '')
        .replace(/\s*\[.*?(feat\.?|ft\.?|featuring|avec|with).*?\]/gi, '')
        .replace(/\s*[-–—]\s*(feat\.?|ft\.?|featuring|avec|with).*$/gi, '')
        .replace(/\s+(feat\.?|ft\.?|featuring|avec|with)\s+.*$/gi, '')
        .replace(
          /\s*\(.*?(remaster|remastered|radio edit|live|version|explicit).*?\)/gi,
          '',
        )
        .replace(
          /\s*\[.*?(remaster|remastered|radio edit|live|version|explicit).*?\]/gi,
          '',
        )
        .replace(/\s*[-–—]\s*(remaster|remastered|radio edit|live|version).*$/gi, '');
    }

    return normalizedValue.replace(/[^a-z0-9]/g, '').trim();
  }

  private isTitleDistanceAcceptable(
    distance: number,
    longestLength: number,
    similarity: number,
  ) {
    if (longestLength <= 4) {
      return distance === 0;
    }

    if (longestLength <= 7) {
      return distance <= 1 && similarity >= 0.78;
    }

    if (longestLength <= 12) {
      return distance <= 2 && similarity >= 0.76;
    }

    return distance <= 3 && similarity >= 0.82;
  }

  private isArtistDistanceAcceptable(
    distance: number,
    longestLength: number,
    similarity: number,
  ) {
    if (longestLength <= 4) {
      return distance === 0;
    }

    if (longestLength <= 7) {
      return distance <= 1 && similarity >= 0.86;
    }

    if (longestLength <= 12) {
      return distance <= 2 && similarity >= 0.88;
    }

    return distance <= 2 && similarity >= 0.9;
  }

  private levenshteinDistance(a: string, b: string) {
    const matrix = Array.from({ length: a.length + 1 }, (_, row) =>
      Array.from({ length: b.length + 1 }, (_, column) =>
        row === 0 ? column : column === 0 ? row : 0,
      ),
    );

    for (let row = 1; row <= a.length; row += 1) {
      for (let column = 1; column <= b.length; column += 1) {
        const cost = a[row - 1] === b[column - 1] ? 0 : 1;

        matrix[row][column] = Math.min(
          matrix[row - 1][column] + 1,
          matrix[row][column - 1] + 1,
          matrix[row - 1][column - 1] + cost,
        );
      }
    }

    return matrix[a.length][b.length];
  }

  private extractFirstText(value: unknown): string | null {
    if (typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const text = this.extractFirstText(item);

        if (text) {
          return text;
        }
      }

      return null;
    }

    if (typeof value === 'object' && value !== null) {
      const recordValue = value as Record<string, unknown>;

      if (typeof recordValue.output_text === 'string') {
        return recordValue.output_text;
      }

      if (typeof recordValue.text === 'string') {
        return recordValue.text;
      }

      for (const item of Object.values(recordValue)) {
        const text = this.extractFirstText(item);

        if (text) {
          return text;
        }
      }
    }

    return null;
  }
}