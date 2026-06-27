'use client';

import { useEffect, useState } from 'react';

type HealthResponse = {
  status: string;
  app: string;
  version: string;
};

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<string>('checking...');

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch('http://localhost:4000/health');
        const data: HealthResponse = await response.json();
        setBackendStatus(`${data.status} - ${data.app} v${data.version}`);
      } catch {
        setBackendStatus('offline');
      }
    }

    checkBackend();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full border border-lime-400/40 px-4 py-2 text-sm text-lime-300">
          Full-stack music quiz platform
        </div>

        <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
          BeatGuess
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-zinc-300">
          Test your music knowledge with audio previews, artist challenges,
          genre quizzes, and custom artist mixes.
        </p>

        <div className="mt-10 grid w-full max-w-3xl gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-xl font-semibold">Genre Mode</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Play quizzes based on rap, pop, afrobeat, R&B and more.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-xl font-semibold">Artist Mode</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Choose one artist and guess their songs from previews.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-xl font-semibold">Custom Mix</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Pick multiple artists from different genres and create your quiz.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm">
          Backend status:{' '}
          <span className="font-semibold text-lime-300">{backendStatus}</span>
        </div>

        <button className="mt-8 rounded-full bg-lime-400 px-8 py-3 font-semibold text-black transition hover:bg-lime-300">
          Start Quiz
        </button>
      </section>
    </main>
  );
}