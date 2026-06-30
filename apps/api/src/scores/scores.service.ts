import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export type CreateScoreInput = {
  auth0Sub: string;
  playerName?: string;
  playerEmail?: string;
  playerPicture?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  difficulty: string;
  answerMode: string;
  typedAnswerKind?: string;
  artists?: string[];
};

@Injectable()
export class ScoresService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createScore(input: CreateScoreInput) {
    const result = await this.databaseService.query(
      `
        insert into scores (
          auth0_sub,
          player_name,
          player_email,
          player_picture,
          score,
          total_questions,
          correct_answers,
          accuracy,
          difficulty,
          answer_mode,
          typed_answer_kind,
          artists
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        returning *
      `,
      [
        input.auth0Sub,
        input.playerName ?? null,
        input.playerEmail ?? null,
        input.playerPicture ?? null,
        input.score,
        input.totalQuestions,
        input.correctAnswers,
        input.accuracy,
        input.difficulty,
        input.answerMode,
        input.typedAnswerKind ?? null,
        input.artists ?? [],
      ],
    );

    return result.rows[0];
  }

  async getScoresForUser(auth0Sub: string) {
    const result = await this.databaseService.query(
      `
        select *
        from scores
        where auth0_sub = $1
        order by created_at desc
        limit 50
      `,
      [auth0Sub],
    );

    return result.rows;
  }

  async getLeaderboard(limit = 50) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    const result = await this.databaseService.query(
      `
        select *
        from scores
        order by accuracy desc, score desc, correct_answers desc, created_at desc
        limit $1
      `,
      [safeLimit],
    );

    return result.rows;
  }
}