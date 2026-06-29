'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { translations, type Language } from '@/lib/i18n';
import { useLanguage } from '@/lib/use-language';

type HealthStatus = {
  status: string;
  app: string;
  version: string;
};
type PreviewArtist = {
  id: number;
  name: string;
  image?: string;
};

const RECENT_ARTISTS_STORAGE_KEY = 'beatguess-recent-artists';

const FALLBACK_PREVIEW_ARTISTS: PreviewArtist[] = [
  { id: 1, name: 'Burna Boy' },
  { id: 2, name: 'Drake' },
  { id: 3, name: 'Aya Nakamura' },
  { id: 4, name: 'The Weeknd' },
  { id: 5, name: 'Ninho' },
  { id: 6, name: 'Rema' },
  { id: 7, name: 'Tems' },
  { id: 8, name: 'Dua Lipa' },
  { id: 9, name: 'Damso' },
  { id: 10, name: 'Tyla' },
  { id: 11, name: 'Soolking' },
  { id: 12, name: 'J Balvin' },
  { id: 13, name: 'Kendrick Lamar' },
  { id: 14, name: 'SZA' },
  { id: 15, name: 'Cardi B' },
  { id: 16, name: 'Migos' },
  { id: 17, name: 'Travis Scott' },
  { id: 18, name: 'J Cole' },
  { id: 19, name: 'Lil Baby' },
  { id: 20, name: 'Pop Smoke' },
];

function getRandomPreviewArtists() {
  return [...FALLBACK_PREVIEW_ARTISTS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
}

const homeGameText: Record<
  Language,
  {
    playNow: string;
    scoreButton: string;
    heroLabel: string;
    heroTitle: string;
    heroSubtitle: string;
    liveStatus: string;
    checking: string;
    offline: string;
    howToPlay: string;
    stepOneTitle: string;
    stepOneDescription: string;
    stepTwoTitle: string;
    stepTwoDescription: string;
    stepThreeTitle: string;
    stepThreeDescription: string;
    gameModes: string;
    customMix: string;
    typingChallenge: string;
    mixedQuestions: string;
    localScores: string;
  }
> = {
  en: {
    playNow: 'Start playing',
    scoreButton: 'View scores',
    heroLabel: 'Music quiz arena',
    heroTitle: 'Guess the beat. Build your challenge. Beat your score.',
    heroSubtitle:
      'Create a quiz from your favorite artists, listen to short previews, and prove how well you really know the music.',
    liveStatus: 'Game server online',
    checking: 'Checking game server...',
    offline: 'Game server offline',
    howToPlay: 'How it works',
    stepOneTitle: 'Pick artists',
    stepOneDescription: 'Choose the artists you want in your quiz.',
    stepTwoTitle: 'Choose mode',
    stepTwoDescription: 'Play multiple choice or typing challenge.',
    stepThreeTitle: 'Guess tracks',
    stepThreeDescription: 'Listen, answer, score, and replay.',
    gameModes: 'Game modes',
    customMix: 'Custom artist mix',
    typingChallenge: 'Typing challenge',
    mixedQuestions: 'Song, artist, album',
    localScores: 'Local score history',
  },
  fr: {
    playNow: 'Commencer à jouer',
    scoreButton: 'Voir les scores',
    heroLabel: 'Arène de quiz musical',
    heroTitle: 'Devine le son. Crée ton défi. Bats ton score.',
    heroSubtitle:
      'Crée un quiz avec tes artistes préférés, écoute des extraits courts et prouve que tu connais vraiment la musique.',
    liveStatus: 'Serveur du jeu en ligne',
    checking: 'Vérification du serveur...',
    offline: 'Serveur du jeu hors ligne',
    howToPlay: 'Comment jouer',
    stepOneTitle: 'Choisis des artistes',
    stepOneDescription: 'Sélectionne les artistes que tu veux dans ton quiz.',
    stepTwoTitle: 'Choisis le mode',
    stepTwoDescription: 'Joue en choix multiple ou en défi écrit.',
    stepThreeTitle: 'Devine les titres',
    stepThreeDescription: 'Écoute, réponds, marque des points et rejoue.',
    gameModes: 'Modes de jeu',
    customMix: 'Mix d’artistes',
    typingChallenge: 'Défi écrit',
    mixedQuestions: 'Titre, artiste, album',
    localScores: 'Historique local',
  },
  de: {
    playNow: 'Jetzt spielen',
    scoreButton: 'Punkte ansehen',
    heroLabel: 'Musikquiz-Arena',
    heroTitle: 'Errate den Beat. Baue deine Challenge. Schlage deinen Score.',
    heroSubtitle:
      'Erstelle ein Quiz mit deinen Lieblingskünstlern, höre kurze Previews und zeige, wie gut du Musik wirklich kennst.',
    liveStatus: 'Spielserver online',
    checking: 'Spielserver wird geprüft...',
    offline: 'Spielserver offline',
    howToPlay: 'So funktioniert es',
    stepOneTitle: 'Künstler wählen',
    stepOneDescription: 'Wähle die Künstler für dein Quiz aus.',
    stepTwoTitle: 'Modus wählen',
    stepTwoDescription: 'Spiele Multiple Choice oder Schreib-Challenge.',
    stepThreeTitle: 'Tracks erraten',
    stepThreeDescription: 'Hören, antworten, punkten und erneut spielen.',
    gameModes: 'Spielmodi',
    customMix: 'Eigener Künstler-Mix',
    typingChallenge: 'Schreib-Challenge',
    mixedQuestions: 'Song, Künstler, Album',
    localScores: 'Lokale Punkte',
  },
};

export default function HomePage() {
  const { language } = useLanguage();
  const text = homeGameText[language];
  const t = translations[language].home;

  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isCheckingBackend, setIsCheckingBackend] = useState(true);
  const [previewArtists, setPreviewArtists] = useState<PreviewArtist[]>([]);

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

useEffect(() => {
  try {
    const savedArtists = localStorage.getItem(RECENT_ARTISTS_STORAGE_KEY);

    if (savedArtists) {
      const parsedArtists = JSON.parse(savedArtists) as PreviewArtist[];

      if (Array.isArray(parsedArtists) && parsedArtists.length > 0) {
        setPreviewArtists(parsedArtists.slice(0, 3));
        return;
      }
    }

    setPreviewArtists(getRandomPreviewArtists());
  } catch {
    setPreviewArtists(getRandomPreviewArtists());
  }
}, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-4 py-6 text-white md:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-12rem] h-[35rem] w-[35rem] -translate-x-1/2 rounded-full bg-lime-400/20 blur-[150px]" />
        <div className="absolute bottom-[-10rem] left-[-8rem] h-[30rem] w-[30rem] rounded-full bg-purple-500/15 blur-[150px]" />
        <div className="absolute right-[-8rem] top-56 h-[28rem] w-[28rem] rounded-full bg-green-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
      </div>

      <section className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col justify-center">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/40 bg-lime-400/10 px-4 py-2 text-sm font-black text-lime-300 shadow-[0_0_30px_rgba(132,204,22,0.15)]">
              <span className="h-2 w-2 rounded-full bg-lime-400" />
              {text.heroLabel}
            </div>

            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-none tracking-tight md:text-7xl xl:text-8xl">
              {text.heroTitle}
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
              {text.heroSubtitle}
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/quiz/custom-mix"
                className="group rounded-[1.5rem] bg-lime-400 px-9 py-5 text-center text-xl font-black text-black shadow-[0_0_40px_rgba(132,204,22,0.35)] transition hover:scale-[1.02] hover:bg-lime-300"
              >
                ▶ {text.playNow}
              </Link>

              <Link
                href="/scores"
                className="rounded-[1.5rem] border border-zinc-700 bg-black/60 px-9 py-5 text-center text-xl font-black text-white transition hover:border-lime-400 hover:text-lime-300"
              >
                🏆 {text.scoreButton}
              </Link>
            </div>

            <div className="mt-7 inline-flex rounded-2xl border border-zinc-800 bg-zinc-950/80 px-5 py-3 text-sm text-zinc-400">
              {isCheckingBackend ? (
                <span>{text.checking}</span>
              ) : healthStatus ? (
                <span>
                  <span className="text-lime-300">●</span> {text.liveStatus}
                </span>
              ) : (
                <span className="text-red-300">● {text.offline}</span>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2.5rem] bg-lime-400/20 blur-[80px]" />

            <div className="relative overflow-hidden rounded-[2.5rem] border border-zinc-800 bg-zinc-950/90 p-6 shadow-2xl">
              <div className="rounded-[2rem] border border-lime-400/20 bg-black p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">
                    BeatGuess
                  </p>
                  <div className="rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-xs font-bold text-lime-300">
                    Live quiz
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-[0.8fr_1.2fr] gap-4">
                  <div className="aspect-square rounded-[1.5rem] border border-zinc-800 bg-[radial-gradient(circle_at_30%_30%,rgba(163,230,53,0.35),transparent_35%),linear-gradient(135deg,#18181b,#000)] p-4">
                    <div className="flex h-full items-center justify-center rounded-full border border-lime-400/30 bg-black shadow-[inset_0_0_30px_rgba(132,204,22,0.12)]">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-lime-400 text-4xl text-black">
                        ♪
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <p className="text-xs text-zinc-500">Question type</p>
                      <p className="mt-1 text-lg font-black text-white">
                        Song · Artist · Album
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <p className="text-xs text-zinc-500">Mode</p>
                      <p className="mt-1 text-lg font-black text-lime-300">
                        MCQ + Typing
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {previewArtists.map((artist) => (
  <div
    key={artist.id}
    className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3"
  >
    <div className="flex items-center gap-3">
      {artist.image ? (
        <img
          src={artist.image}
          alt={artist.name}
          className="h-9 w-9 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-400 text-sm font-black text-black">
          ♪
        </div>
      )}

      <span className="font-bold">{artist.name}</span>
    </div>

    <span className="text-lime-300">●</span>
  </div>
))}
                </div>

               <Link
  href="/quiz/custom-mix"
  className="mt-5 block rounded-2xl bg-lime-400 px-5 py-4 text-center text-lg font-black text-black transition hover:scale-[1.02] hover:bg-lime-300"
>
  Start the challenge
</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: '🎤',
              title: text.stepOneTitle,
              description: text.stepOneDescription,
            },
            {
              icon: '🎮',
              title: text.stepTwoTitle,
              description: text.stepTwoDescription,
            },
            {
              icon: '⚡',
              title: text.stepThreeTitle,
              description: text.stepThreeDescription,
            },
          ].map((step) => (
            <div
              key={step.title}
              className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950/80 p-5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10 text-2xl">
                {step.icon}
              </div>

              <h2 className="mt-4 text-xl font-black">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {[
            text.customMix,
            text.typingChallenge,
            text.mixedQuestions,
            text.localScores,
          ].map((item) => (
            <div
              key={item}
              className="rounded-full border border-zinc-800 bg-black/70 px-4 py-2 text-sm font-bold text-zinc-300"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}