import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export type CreateChallengeInput = {
  auth0Sub: string;
  playerName?: string;
  playerEmail?: string;
  artistIds: string[];
  difficulty: string;
  questionAmount: number;
  answerMode: string;
  typedAnswerKind?: string;
  quizPayload: unknown;
};

export type CreateChallengeScoreInput = {
  roomCode: string;
  auth0Sub: string;
  playerName?: string;
  playerEmail?: string;
  playerPicture?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
};

@Injectable()
export class ChallengesService {
  constructor(private readonly databaseService: DatabaseService) {}

  private generateRoomCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';

    for (let index = 0; index < 6; index += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    return code;
  }

  async createChallenge(input: CreateChallengeInput) {
  await this.databaseService.query(`
    alter table challenge_rooms
    add column if not exists quiz_payload jsonb
  `);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const roomCode = this.generateRoomCode();

    try {
      const result = await this.databaseService.query(
        `
          insert into challenge_rooms (
            room_code,
            created_by_auth0_sub,
            created_by_name,
            created_by_email,
            artist_ids,
            difficulty,
            question_amount,
            answer_mode,
            typed_answer_kind,
            quiz_payload
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
          returning *
        `,
        [
          roomCode,
          input.auth0Sub,
          input.playerName ?? null,
          input.playerEmail ?? null,
          input.artistIds,
          input.difficulty,
          input.questionAmount,
          input.answerMode,
          input.typedAnswerKind ?? null,
          JSON.stringify(input.quizPayload),
        ],
      );

      return result.rows[0];
    } catch (error) {
      console.error('Create challenge database error:', error);

      if (attempt === 4) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unknown challenge database error';

        throw new InternalServerErrorException(message);
      }
    }
  }

  throw new InternalServerErrorException('Could not create challenge room.');
}
  async getChallenge(roomCode: string) {
    const roomResult = await this.databaseService.query(
      `
        select *
        from challenge_rooms
        where room_code = $1
        limit 1
      `,
      [roomCode.toUpperCase()],
    );

    if (roomResult.rows.length === 0) {
      return null;
    }

    const scoresResult = await this.databaseService.query(
      `
        select *
        from challenge_scores
        where room_code = $1
        order by accuracy desc, score desc, correct_answers desc, created_at asc
      `,
      [roomCode.toUpperCase()],
    );

    return {
      room: roomResult.rows[0],
      scores: scoresResult.rows,
    };
  }

  async createChallengeScore(input: CreateChallengeScoreInput) {
    const result = await this.databaseService.query(
      `
        insert into challenge_scores (
          room_code,
          auth0_sub,
          player_name,
          player_email,
          player_picture,
          score,
          total_questions,
          correct_answers,
          accuracy
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        returning *
      `,
      [
        input.roomCode.toUpperCase(),
        input.auth0Sub,
        input.playerName ?? null,
        input.playerEmail ?? null,
        input.playerPicture ?? null,
        input.score,
        input.totalQuestions,
        input.correctAnswers,
        input.accuracy,
      ],
    );

    return result.rows[0];
  }
}