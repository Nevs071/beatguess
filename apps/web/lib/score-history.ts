export type ScoreHistoryItem = {
  id: string;
  playerName: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  difficulty: string;
  rankTitle: string;
  createdAt: string;
};

const SCORE_HISTORY_STORAGE_KEY = 'beatguess-score-history';

export function readScoreHistory(): ScoreHistoryItem[] {
  try {
    const rawValue = localStorage.getItem(SCORE_HISTORY_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue as ScoreHistoryItem[];
  } catch {
    return [];
  }
}

export function saveScoreHistoryItem(item: ScoreHistoryItem) {
  const currentHistory = readScoreHistory();

  const nextHistory = [item, ...currentHistory].slice(0, 30);

  localStorage.setItem(SCORE_HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
}

export function clearScoreHistory() {
  localStorage.removeItem(SCORE_HISTORY_STORAGE_KEY);
}
