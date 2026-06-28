'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { translations } from '@/lib/i18n';
import { useLanguage } from '@/lib/use-language';

type HealthStatus = {
  status: string;
  app: string;
  version: string;
};

export default function HomePage() {
  const { language } = useLanguage();
  const t = translations[language].home;

  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isCheckingBackend, setIsCheckingBackend] = useState(true);

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);

        if (!response.ok) {
          throw new Error('Backend health check failed');
        }

        const data: HealthStatus = await response.json();
        setHealthStatus(data);
      } catch {
        setHealthStatus(null);
      } finally {
        setIsCheckingBackend(false);
      }
    }

    checkBackend();
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col items-center justify-center text-center">
        <div className="rounded-full border border-lime-400/40 bg-lime-400/10 px-6 py-2 text-sm font-semibold text-lime-300">
          {t.badge}
        </div>

        <h1 className="mt-8 text-6xl font-black tracking-tight md:text-8xl">
          {t.title}
        </h1>

        <p className="mt-8 max-w-3xl text-xl leading-9 text-zinc-300">
          {t.subtitle}
        </p>

        <div className="mt-14 grid w-full max-w-4xl gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <h2 className="text-2xl font-bold">{t.artistSearchTitle}</h2>
            <p className="mt-4 text-zinc-400">{t.artistSearchDescription}</p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <h2 className="text-2xl font-bold">{t.customMixTitle}</h2>
            <p className="mt-4 text-zinc-400">{t.customMixDescription}</p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <h2 className="text-2xl font-bold">{t.audioQuizTitle}</h2>
            <p className="mt-4 text-zinc-400">{t.audioQuizDescription}</p>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-950 px-8 py-5">
          {isCheckingBackend ? (
            <p className="text-zinc-400">{t.backendChecking}</p>
          ) : healthStatus ? (
            <p>
              {t.backendStatus}:{' '}
              <span className="font-bold text-lime-300">
                {healthStatus.status} - {healthStatus.app} v
                {healthStatus.version}
              </span>
            </p>
          ) : (
            <p className="text-red-300">{t.backendOffline}</p>
          )}
        </div>

        <Link
          href="/quiz/custom-mix"
          className="mt-12 rounded-full bg-lime-400 px-10 py-4 text-lg font-black text-black transition hover:bg-lime-300"
        >
          {t.customMixButton}
        </Link>
      </section>
    </main>
  );
}