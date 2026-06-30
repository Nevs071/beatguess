'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

type ChallengeRoom = {
  room_code: string;
  created_by_name: string | null;
  artist_ids: string[];
  difficulty: string;
  question_amount: number;
  answer_mode: string;
  typed_answer_kind: string | null;
};

type ChallengeScore = {
  id: string;
  player_name: string | null;
  player_email: string | null;
  score: number;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
};

type ChallengeResponse = {
  room: ChallengeRoom;
  scores: ChallengeScore[];
};

export default function ChallengeRoomPage() {
  const params = useParams<{ roomCode: string }>();
  const roomCode = String(params.roomCode ?? '').toUpperCase();

  const [challenge, setChallenge] = useState<ChallengeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadChallenge() {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/challenges/${roomCode}`, {
          cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? 'Challenge room not found.');
        }

        setChallenge(data);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not load challenge room.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (roomCode) void loadChallenge();
  }, [roomCode]);

  const playUrl = useMemo(() => {
    if (!challenge?.room) return '/challenge';

    const room = challenge.room;
    const params = new URLSearchParams({
      artists: room.artist_ids.join(','),
      difficulty: room.difficulty,
      amount: String(room.question_amount),
      answerMode: room.answer_mode,
      typedAnswerKind: room.typed_answer_kind ?? 'song',
      challengeRoom: room.room_code,
    });

    return `/quiz/play?${params.toString()}`;
  }, [challenge]);

  async function copyRoomLink() {
    await navigator.clipboard.writeText(window.location.href);
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 text-white">
        <p className="text-xl font-black text-lime-300">Loading challenge...</p>
      </main>
    );
  }

  if (error || !challenge) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 text-white">
        <div className="max-w-xl rounded-[2rem] border border-red-400/30 bg-red-500/10 p-8 text-center">
          <h1 className="text-3xl font-black">Challenge not found</h1>
          <p className="mt-3 text-zinc-300">{error}</p>
          <a href="/challenge" className="mt-6 inline-flex rounded-full bg-lime-400 px-6 py-3 font-black text-black">
            Create a challenge
          </a>
        </div>
      </main>
    );
  }

  const { room, scores } = challenge;

  return (
    <main className="min-h-screen bg-[#020617] px-4 pb-28 pt-24 text-white md:px-6 md:py-10">
      <section className="mx-auto max-w-6xl">
        <a href="/challenge" className="text-sm font-bold text-lime-300 hover:text-lime-200">
          ← Back to challenges
        </a>

        <div className="mt-10 rounded-[2.5rem] border border-white/10 bg-black/45 p-6 shadow-[0_0_100px_rgba(34,211,238,0.10)] backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-lime-300">
                Room {room.room_code}
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
                BeatGuess challenge
              </h1>

              <p className="mt-4 max-w-2xl text-zinc-400">
                Created by {room.created_by_name ?? 'a BeatGuess player'}. Play the same
                settings and compare your result on this room leaderboard.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={playUrl} className="rounded-full bg-lime-400 px-6 py-3 text-center font-black text-black transition hover:bg-lime-300">
                Start challenge
              </a>

              <button type="button" onClick={() => void copyRoomLink()} className="rounded-full border border-white/15 px-6 py-3 font-black text-white transition hover:border-lime-400">
                Copy link
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
              <p className="text-sm text-zinc-500">Questions</p>
              <p className="mt-1 text-2xl font-black text-white">{room.question_amount}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
              <p className="text-sm text-zinc-500">Difficulty</p>
              <p className="mt-1 text-2xl font-black text-white">{room.difficulty}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
              <p className="text-sm text-zinc-500">Mode</p>
              <p className="mt-1 text-2xl font-black text-white">{room.answer_mode}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
              <p className="text-sm text-zinc-500">Players</p>
              <p className="mt-1 text-2xl font-black text-white">{scores.length}</p>
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border border-white/10 bg-black/35 p-5">
            <h2 className="text-2xl font-black">Room leaderboard</h2>

            {scores.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-dashed border-white/15 bg-black/30 p-10 text-center">
                <p className="text-5xl">🏆</p>
                <p className="mt-4 text-xl font-black">No scores yet</p>
                <p className="mt-2 text-zinc-500">Be the first player to finish this challenge.</p>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10">
                {scores.map((score, index) => (
                  <div key={score.id} className="grid gap-4 bg-black/35 px-5 py-5 transition hover:bg-white/5 md:grid-cols-[0.4fr_1.3fr_0.8fr_0.8fr_0.8fr]">
                    <p className="text-2xl font-black text-lime-300">#{index + 1}</p>

                    <div>
                      <p className="text-sm text-zinc-500">Player</p>
                      <p className="font-black">{score.player_name ?? score.player_email ?? 'Player'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-500">Score</p>
                      <p className="font-black text-lime-300">{score.score}</p>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-500">Correct</p>
                      <p className="font-bold">{score.correct_answers} / {score.total_questions}</p>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-500">Accuracy</p>
                      <p className="font-bold">{score.accuracy}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
