'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type ChallengeRoom = {
  room_code: string;
  created_by_name?: string;
  artist_ids: string[];
  difficulty: string;
  question_amount: number;
  answer_mode: string;
  typed_answer_kind?: string;
  created_at: string;
};

type ChallengeScore = {
  id: string;
  player_name?: string;
  player_email?: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
  created_at: string;
};

type ChallengeData = {
  room: ChallengeRoom;
  scores: ChallengeScore[];
};

export default function ChallengeRoomPage() {
  const params = useParams<{ roomCode: string }>();
  const roomCode = params.roomCode?.toUpperCase() ?? '';

  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const startChallengeUrl = roomCode
    ? `/quiz/play?challengeRoom=${encodeURIComponent(roomCode)}`
    : '#';

  useEffect(() => {
    async function loadChallenge() {
      if (!roomCode) {
        setError('Room code is missing.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const response = await fetch(`/api/challenges/${roomCode}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Challenge room could not be loaded.');
        }

        const data = await response.json();
        setChallenge(data);
      } catch (caughtError) {
        console.error('Load challenge failed:', caughtError);

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Challenge room could not be loaded.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadChallenge();
  }, [roomCode]);


    async function copyRoomLink() {
    await navigator.clipboard.writeText(window.location.href);
  }

  async function copyRoomCode() {
    if (!roomCode) return;
    await navigator.clipboard.writeText(roomCode);
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#020617] px-4 py-20 text-white">
        <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-black/40 p-8 text-center">
          <p className="text-xl font-black text-lime-300">Loading room...</p>
        </section>
      </main>
    );
  }

  if (error || !challenge) {
    return (
      <main className="min-h-screen bg-[#020617] px-4 py-20 text-white">
        <section className="mx-auto max-w-5xl rounded-[2rem] border border-red-400/30 bg-red-500/10 p-8 text-center">
          <h1 className="text-3xl font-black">Room could not load</h1>

          <p className="mt-4 text-zinc-300">{error}</p>

          <Link
            href="/challenge"
            className="mt-6 inline-flex rounded-full bg-lime-400 px-6 py-3 font-black text-black"
          >
            Back to challenges
          </Link>
        </section>
      </main>
    );
  }

  const room = challenge.room;
  const scores = challenge.scores ?? [];

  return (
    <main className="min-h-screen bg-[#020617] px-4 pb-32 pt-24 text-white md:px-6 md:py-10">
      <section className="mx-auto max-w-6xl">
        <Link
          href="/challenge"
          className="text-sm font-black text-lime-300 hover:text-lime-200"
        >
          ← Back to challenge setup
        </Link>

        <div className="mt-8 rounded-[2.5rem] border border-lime-400/25 bg-black/50 p-6 shadow-[0_0_80px_rgba(163,230,53,0.12)] md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-lime-300">
            BeatGuess room
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-[0.2em] md:text-7xl">
            {roomCode}
          </h1>

          <p className="mt-4 text-zinc-400">
            Everyone in this room plays the same quiz and competes on this room leaderboard.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                Questions
              </p>

              <p className="mt-2 text-2xl font-black">
                {room.question_amount}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                Difficulty
              </p>

              <p className="mt-2 text-2xl font-black capitalize">
                {room.difficulty}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                Mode
              </p>

              <p className="mt-2 text-2xl font-black">
                {room.answer_mode === 'typed' ? 'Typing' : 'MCQ'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                Players
              </p>

              <p className="mt-2 text-2xl font-black">
                {scores.length}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
  <button
    type="button"
    onClick={() => {
      const code = room.room_code || roomCode;

      sessionStorage.setItem('beatguess-challenge-room-code', code);

      window.location.href = `/quiz/play?challengeRoom=${encodeURIComponent(code)}`;
    }}
    className="rounded-full bg-lime-400 px-7 py-4 text-center font-black text-black transition hover:bg-lime-300"
  >
    Start challenge
  </button>

  <button
    type="button"
    onClick={() => void copyRoomLink()}
    className="rounded-full border border-cyan-400/50 bg-cyan-400/10 px-7 py-4 text-center font-black text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-400/20"
  >
    Copy invite link
  </button>

  <button
    type="button"
    onClick={() => void copyRoomCode()}
    className="rounded-full border border-white/10 bg-white/5 px-7 py-4 text-center font-black text-white transition hover:border-lime-400 hover:text-lime-300"
  >
    Copy code
  </button>
</div>

          <p className="mt-4 text-sm text-zinc-500">
            Debug start URL: {startChallengeUrl}
          </p>
        </div>

                <div className="mt-8 rounded-[2.5rem] border border-white/10 bg-black/45 p-6 md:p-8">
          <h2 className="text-3xl font-black">Room leaderboard</h2>

          {scores.length === 0 ? (
            <p className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5 text-zinc-400">
              No players yet. Start the challenge and your score will appear here.
            </p>
          ) : (
            <div className="mt-6 grid gap-3">
              {scores.map((score, index) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div>
                    <p className="font-black">
                      #{index + 1}{' '}
                      {score.player_name ?? score.player_email ?? 'Player'}
                    </p>

                    <p className="text-sm text-zinc-500">
                      {score.correct_answers}/{score.total_questions} correct ·{' '}
                      {score.accuracy}%
                    </p>
                  </div>

                  <p className="text-2xl font-black text-lime-300">
                    {score.score}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
