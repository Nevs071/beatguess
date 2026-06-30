"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { translations, type Language } from "@/lib/i18n";
import { useLanguage } from "@/lib/use-language";

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

const RECENT_ARTISTS_STORAGE_KEY = "beatguess-recent-artists";

const FALLBACK_PREVIEW_ARTISTS: PreviewArtist[] = [
  { id: 1, name: "Burna Boy" },
  { id: 2, name: "Drake" },
  { id: 3, name: "Aya Nakamura" },
  { id: 4, name: "The Weeknd" },
  { id: 5, name: "Ninho" },
  { id: 6, name: "Rema" },
  { id: 7, name: "Tems" },
  { id: 8, name: "Dua Lipa" },
  { id: 9, name: "Damso" },
  { id: 10, name: "Tyla" },
  { id: 11, name: "Soolking" },
  { id: 12, name: "J Balvin" },
  { id: 13, name: "Kendrick Lamar" },
  { id: 14, name: "SZA" },
  { id: 15, name: "Cardi B" },
  { id: 16, name: "Migos" },
  { id: 17, name: "Travis Scott" },
  { id: 18, name: "J Cole" },
  { id: 19, name: "Lil Baby" },
  { id: 20, name: "Pop Smoke" },
];
const FALLBACK_BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?auto=format&fit=crop&w=2200&q=90",

  "https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1464375117522-1311d8a5b81f?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1508973379184-7517410fb0bc?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=2200&q=90",

  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1549213783-8284d0336c4f?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=2200&q=90",

  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1800&q=80",
];

function getRandomBackgroundImage() {
  return FALLBACK_BACKGROUND_IMAGES[
    Math.floor(Math.random() * FALLBACK_BACKGROUND_IMAGES.length)
  ];
}

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
    challengeButton: string;
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
    liveQuiz: string;
    listen: string;
    guess: string;
    scoreLabel: string;
    questionType: string;
    questionTypeValue: string;
    modeLabel: string;
    modeValue: string;
    startChallenge: string;
  }
> = {
  en: {
    playNow: "Start playing",
    scoreButton: "View scores",
    challengeButton: "Multiplayer Challenge",
    
    heroLabel: "Music quiz arena",
    heroTitle: "Guess the beat. Build your challenge. Beat your score.",
    heroSubtitle:
      "Create a quiz from your favorite artists, listen to short previews, and prove how well you really know the music.",
    liveStatus: "Game server online",
    checking: "Checking game server...",
    offline: "Game server offline",
    howToPlay: "How it works",
    stepOneTitle: "Pick artists",
    stepOneDescription: "Choose the artists you want in your quiz.",
    stepTwoTitle: "Choose mode",
    stepTwoDescription: "Play multiple choice or typing challenge.",
    stepThreeTitle: "Guess tracks",
    stepThreeDescription: "Listen, answer, score, and replay.",
    gameModes: "Game modes",
    customMix: "Custom artist mix",
    typingChallenge: "Typing challenge",
    mixedQuestions: "Song, artist, album",
    localScores: "Local score history",
    liveQuiz: "Live quiz",
    listen: "Listen",
    guess: "Guess",
    scoreLabel: "Score",
    questionType: "Question type",
    questionTypeValue: "Song · Artist · Album",
    modeLabel: "Mode",
    modeValue: "MCQ + Typing",
    startChallenge: "Start the challenge",
  },
  fr: {
    playNow: "Commencer à jouer",
    scoreButton: "Voir les scores",
    challengeButton: "Défi multijoueur",
    heroLabel: "Arène de quiz musical",
    heroTitle: "Devine le son. Crée ton défi. Bats ton score.",
    heroSubtitle:
      "Crée un quiz avec tes artistes préférés, écoute des extraits courts et prouve que tu connais vraiment la musique.",
    liveStatus: "Serveur du jeu en ligne",
    checking: "Vérification du serveur...",
    offline: "Serveur du jeu hors ligne",
    howToPlay: "Comment jouer",
    stepOneTitle: "Choisis des artistes",
    stepOneDescription: "Sélectionne les artistes que tu veux dans ton quiz.",
    stepTwoTitle: "Choisis le mode",
    stepTwoDescription: "Joue en choix multiple ou en défi écrit.",
    stepThreeTitle: "Devine les titres",
    stepThreeDescription: "Écoute, réponds, marque des points et rejoue.",
    gameModes: "Modes de jeu",
    customMix: "Mix d’artistes",
    typingChallenge: "Défi écrit",
    mixedQuestions: "Titre, artiste, album",
    localScores: "Historique local",
    liveQuiz: "Quiz en direct",
    listen: "Écoute",
    guess: "Devine",
    scoreLabel: "Score",
    questionType: "Type de question",
    questionTypeValue: "Titre · Artiste · Album",
    modeLabel: "Mode",
    modeValue: "QCM + Écrit",
    startChallenge: "Lancer le défi",
  },
  de: {
    playNow: "Jetzt spielen",
    scoreButton: "Punkte ansehen",
    challengeButton: "Multiplayer-Challenge",
    heroLabel: "Musikquiz-Arena",
    heroTitle: "Errate den Beat. Baue deine Challenge. Schlage deinen Score.",
    heroSubtitle:
      "Erstelle ein Quiz mit deinen Lieblingskünstlern, höre kurze Previews und zeige, wie gut du Musik wirklich kennst.",
    liveStatus: "Spielserver online",
    checking: "Spielserver wird geprüft...",
    offline: "Spielserver offline",
    howToPlay: "So funktioniert es",
    stepOneTitle: "Künstler wählen",
    stepOneDescription: "Wähle die Künstler für dein Quiz aus.",
    stepTwoTitle: "Modus wählen",
    stepTwoDescription: "Spiele Multiple Choice oder Schreib-Challenge.",
    stepThreeTitle: "Tracks erraten",
    stepThreeDescription: "Hören, antworten, punkten und erneut spielen.",
    gameModes: "Spielmodi",
    customMix: "Eigener Künstler-Mix",
    typingChallenge: "Schreib-Challenge",
    mixedQuestions: "Song, Künstler, Album",
    localScores: "Lokale Punkte",
    liveQuiz: "Live-Quiz",
    listen: "Hören",
    guess: "Raten",
    scoreLabel: "Punkte",
    questionType: "Fragetyp",
    questionTypeValue: "Song · Künstler · Album",
    modeLabel: "Modus",
    modeValue: "MCQ + Schreiben",
    startChallenge: "Challenge starten",
  },
};

export default function HomePage() {
  const { language } = useLanguage();
  const text = homeGameText[language];
  const t = translations[language].home;

  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isCheckingBackend, setIsCheckingBackend] = useState(true);
  const [previewArtists, setPreviewArtists] = useState<PreviewArtist[]>([]);
  const [backgroundImage, setBackgroundImage] = useState("");

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);

        if (!response.ok) {
          throw new Error("Backend health check failed");
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
          const recentArtists = parsedArtists.slice(0, 3);
          const firstArtistWithImage = recentArtists.find(
            (artist) => artist.image,
          );

          setPreviewArtists(recentArtists);
          setBackgroundImage(getRandomBackgroundImage());

          return;
        }
      }

      setPreviewArtists(getRandomPreviewArtists());
      setBackgroundImage(getRandomBackgroundImage());
    } catch {
      setPreviewArtists(getRandomPreviewArtists());
      setBackgroundImage(getRandomBackgroundImage());
    }
  }, []);

  const recentArtistImages = previewArtists
    .map((artist) => artist.image)
    .filter(Boolean) as string[];

  const homeBackgroundImages = Array.from({ length: 120 }, (_, index) => {
    const images =
      recentArtistImages.length > 0
        ? [...recentArtistImages, ...FALLBACK_BACKGROUND_IMAGES]
        : FALLBACK_BACKGROUND_IMAGES;

    return images[index % images.length];
  });

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black px-4 pb-28 pt-6 text-white md:px-8 md:pb-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#160020] via-[#07152f] to-[#020617]" />

        {backgroundImage && (
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center opacity-25 blur-sm"
            style={{
              backgroundImage: `url(${backgroundImage})`,
            }}
          />
        )}

        <div className="absolute -left-32 -top-40 grid w-[150%] rotate-[-8deg] grid-cols-4 gap-5 opacity-55 md:grid-cols-6 lg:grid-cols-8">
          {homeBackgroundImages.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={`h-40 rounded-[1.5rem] border border-white/10 bg-zinc-900 bg-cover bg-center shadow-2xl md:h-52 ${
                index % 2 === 0 ? "translate-y-10" : "-translate-y-4"
              }`}
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.04), rgba(0,0,0,0.35)), url(${image})`,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black/58 via-black/35 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/62" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.22),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(163,230,53,0.18),transparent_42%)]" />
      </div>

      <section className="relative mx-auto flex max-w-7xl flex-col py-20 md:py-24 lg:min-h-[calc(100vh-3rem)] lg:justify-center">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/40 bg-lime-400/10 px-4 py-2 text-sm font-black text-lime-300 shadow-[0_0_30px_rgba(132,204,22,0.15)]">
              <span className="h-2 w-2 rounded-full bg-lime-400" />
              {text.heroLabel}
            </div>

            <h1 className="mt-6 max-w-4xl text-[3rem] font-black leading-[0.95] tracking-tight sm:text-6xl md:text-7xl xl:text-8xl">
              {text.heroTitle}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 md:mt-7 md:text-xl md:leading-8">
              {text.heroSubtitle}
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
  <Link
    href="/quiz/custom-mix"
    className="group w-full rounded-[1.5rem] bg-lime-400 px-7 py-5 text-center text-lg font-black text-black shadow-[0_0_40px_rgba(132,204,22,0.35)] transition hover:scale-[1.02] hover:bg-lime-300 sm:w-auto sm:px-9 sm:text-xl"
  >
    ▶ {text.playNow}
  </Link>

  <Link
    href="/challenge"
    className="w-full rounded-[1.5rem] border border-cyan-400/40 bg-cyan-400/10 px-7 py-5 text-center text-lg font-black text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-400/20 sm:w-auto sm:px-9 sm:text-xl"
  >
    👥 {text.challengeButton}
  </Link>

  <Link
    href="/scores"
    className="w-full rounded-[1.5rem] border border-zinc-700 bg-black/60 px-7 py-5 text-center text-lg font-black text-white transition hover:border-lime-400 hover:text-lime-300 sm:w-auto sm:px-9 sm:text-xl"
  >
    🏆 {text.scoreButton}
  </Link>
</div>

            <div className="mt-7 inline-flex rounded-2xl border border-zinc-800 bg-black/50 backdrop-blur-xl px-5 py-3 text-sm text-zinc-400">
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

          <div className="relative hidden md:block">
            <div className="absolute inset-0 rounded-[2.5rem] bg-lime-400/20 blur-[80px]" />

            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[2rem] border border-lime-400/20 bg-black/65 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">
                    BeatGuess
                  </p>
                  <div className="rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-xs font-bold text-lime-300">
                    {text.liveQuiz}
                  </div>
                </div>
                <div className="mt-6 rounded-[1.5rem] border border-lime-400/20 bg-black/55 p-4 backdrop-blur-xl md:hidden">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-lime-300">
                    BeatGuess
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-zinc-800 bg-black/45 backdrop-blur-xl p-3 text-center">
                      <p className="text-2xl">🎧</p>
                      <p className="mt-1 text-xs font-bold text-zinc-300">
                        {text.listen}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-black/45 backdrop-blur-xl p-3 text-center">
                      <p className="text-2xl">🎯</p>
                      <p className="mt-1 text-xs font-bold text-zinc-300">
                        {text.guess}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-black/45 backdrop-blur-xl p-3 text-center">
                      <p className="text-2xl">🏆</p>
                      <p className="mt-1 text-xs font-bold text-zinc-300">
                        {text.scoreLabel}
                      </p>
                    </div>
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
                    <div className="rounded-2xl border border-zinc-800 bg-black/50 backdrop-blur-xl p-4">
                      <p className="text-xs text-zinc-500">
                        {text.questionType}
                      </p>
                      <p className="mt-1 text-lg font-black text-white">
                        {text.questionTypeValue}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-black/50 backdrop-blur-xl p-4">
                      <p className="text-xs text-zinc-500">{text.modeLabel}</p>
                      <p className="mt-1 text-lg font-black text-lime-300">
                        {text.modeValue}
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
                  {text.startChallenge}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: "🎤",
              title: text.stepOneTitle,
              description: text.stepOneDescription,
            },
            {
              icon: "🎮",
              title: text.stepTwoTitle,
              description: text.stepTwoDescription,
            },
            {
              icon: "⚡",
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
              className="rounded-full border border-zinc-800 bg-black/45 backdrop-blur-xl px-4 py-2 text-sm font-bold text-zinc-300"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
