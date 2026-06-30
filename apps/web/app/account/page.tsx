"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/use-language";

type Auth0User = {
  name?: string;
  email?: string;
  picture?: string;
};

type OnlineScore = {
  id: string;
  player_name?: string | null;
  player_email?: string | null;
  player_picture?: string | null;
  score: number;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
  difficulty: string;
  answer_mode: string;
  typed_answer_kind?: string | null;
  created_at: string;
};

type ScoresResponse = {
  scores: OnlineScore[];
};

const textByLanguage = {
  en: {
    backHome: "Back home",
    title: "Account dashboard",
    subtitle: "Your BeatGuess identity, online score history, and global leaderboard.",
    signInTitle: "Sign in to sync your scores",
    signInDescription:
      "Create an account or sign in to save your results across all your devices.",
    signIn: "Sign in",
    play: "Play a quiz",
    logout: "Logout",
    onlineAccount: "Online account",
    bestScore: "Best score",
    totalGames: "Games played",
    averageAccuracy: "Average accuracy",
    myScores: "My recent scores",
    leaderboard: "Global leaderboard",
    noScores: "No online scores yet. Finish a quiz while logged in.",
    score: "Score",
    correct: "Correct",
    accuracy: "Accuracy",
    difficulty: "Difficulty",
    mode: "Mode",
    date: "Date",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    multipleChoice: "Multiple choice",
    typed: "Typed",
    player: "Player",
  },
  fr: {
    backHome: "Retour accueil",
    title: "Tableau de bord du compte",
    subtitle: "Ton identité BeatGuess, tes scores en ligne et le classement global.",
    signInTitle: "Connecte-toi pour synchroniser tes scores",
    signInDescription:
      "Crée un compte ou connecte-toi pour sauvegarder tes résultats sur tous tes appareils.",
    signIn: "Connexion",
    play: "Jouer un quiz",
    logout: "Déconnexion",
    onlineAccount: "Compte en ligne",
    bestScore: "Meilleur score",
    totalGames: "Parties jouées",
    averageAccuracy: "Précision moyenne",
    myScores: "Mes scores récents",
    leaderboard: "Classement global",
    noScores: "Aucun score en ligne pour le moment. Termine un quiz en étant connecté.",
    score: "Score",
    correct: "Correct",
    accuracy: "Précision",
    difficulty: "Difficulté",
    mode: "Mode",
    date: "Date",
    easy: "Facile",
    medium: "Moyen",
    hard: "Difficile",
    multipleChoice: "Choix multiple",
    typed: "Écrit",
    player: "Joueur",
  },
  de: {
    backHome: "Zurück zur Startseite",
    title: "Konto-Dashboard",
    subtitle: "Deine BeatGuess-Identität, Online-Punkte und globale Rangliste.",
    signInTitle: "Melde dich an, um deine Punkte zu synchronisieren",
    signInDescription:
      "Erstelle ein Konto oder melde dich an, um deine Ergebnisse auf allen Geräten zu speichern.",
    signIn: "Anmelden",
    play: "Quiz spielen",
    logout: "Abmelden",
    onlineAccount: "Online-Konto",
    bestScore: "Bester Score",
    totalGames: "Gespielte Quizze",
    averageAccuracy: "Durchschnittliche Genauigkeit",
    myScores: "Meine letzten Scores",
    leaderboard: "Globale Rangliste",
    noScores: "Noch keine Online-Scores. Beende ein Quiz, während du angemeldet bist.",
    score: "Punkte",
    correct: "Richtig",
    accuracy: "Genauigkeit",
    difficulty: "Schwierigkeit",
    mode: "Modus",
    date: "Datum",
    easy: "Einfach",
    medium: "Mittel",
    hard: "Schwer",
    multipleChoice: "Multiple Choice",
    typed: "Getippt",
    player: "Spieler",
  },
} as const;
type AccountText = (typeof textByLanguage)[keyof typeof textByLanguage];

function AccountBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#160020] via-[#07152f] to-[#020617]" />
      <div className="absolute left-[-10%] top-[-15%] h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />
      <div className="absolute right-[-10%] top-[10%] h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute bottom-[-20%] left-[20%] h-96 w-96 rounded-full bg-lime-400/15 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.18),transparent_35%)]" />
      <div className="absolute inset-0 bg-black/35" />
    </div>
  );
}

function getDifficultyLabel(difficulty: string, text: AccountText) {
  if (difficulty === "hard") {
    return text.hard;
  }

  if (difficulty === "medium") {
    return text.medium;
  }

  return text.easy;
}

function getModeLabel(mode: string, text: AccountText) {
  if (mode === "typed") {
    return text.typed;
  }

  return text.multipleChoice;
}

function formatDate(value: string, language: "en" | "fr" | "de") {
  const locale = language === "fr" ? "fr-FR" : language === "de" ? "de-DE" : "en-US";
  return new Date(value).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ScoreRow({
  score,
  index,
  showPlayer,
  language,
  text,
}: {
  score: OnlineScore;
  index?: number;
  showPlayer?: boolean;
  language: "en" | "fr" | "de";
 text: AccountText;
}) {
  return (
    <div className="grid gap-4 rounded-3xl border border-white/10 bg-black/35 p-5 backdrop-blur-xl transition hover:bg-white/5 md:grid-cols-[0.35fr_1.2fr_0.7fr_0.8fr_0.8fr_0.9fr_0.9fr] md:items-center">
      <div className="text-2xl font-black text-lime-300">
        {typeof index === "number" ? `#${index + 1}` : "•"}
      </div>

      <div className="min-w-0">
        <p className="text-sm text-zinc-500">
          {showPlayer ? text.player : text.date}
        </p>
        <p className="truncate font-black text-white">
          {showPlayer
            ? score.player_name ?? score.player_email ?? text.player
            : formatDate(score.created_at, language)}
        </p>
      </div>

      <div>
        <p className="text-sm text-zinc-500">{text.score}</p>
        <p className="font-black text-lime-300">{score.score}</p>
      </div>

      <div>
        <p className="text-sm text-zinc-500">{text.correct}</p>
        <p className="font-bold text-white">
          {score.correct_answers} / {score.total_questions}
        </p>
      </div>

      <div>
        <p className="text-sm text-zinc-500">{text.accuracy}</p>
        <p className="font-bold text-white">{score.accuracy}%</p>
      </div>

      <div>
        <p className="text-sm text-zinc-500">{text.difficulty}</p>
        <p className="font-bold text-white">{getDifficultyLabel(score.difficulty, text)}</p>
      </div>

      <div>
        <p className="text-sm text-zinc-500">{text.mode}</p>
        <p className="font-bold text-white">{getModeLabel(score.answer_mode, text)}</p>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { language } = useLanguage();
  const text = textByLanguage[language];

  const [user, setUser] = useState<Auth0User | null>(null);
  const [myScores, setMyScores] = useState<OnlineScore[]>([]);
  const [leaderboard, setLeaderboard] = useState<OnlineScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAccount() {
      try {
        const profileResponse = await fetch("/auth/profile", {
          cache: "no-store",
        });

        if (!profileResponse.ok) {
          setUser(null);
          setMyScores([]);
          setLeaderboard([]);
          return;
        }

        const profile = (await profileResponse.json()) as Auth0User;
        setUser(profile);

        const [myScoresResponse, leaderboardResponse] = await Promise.all([
          fetch("/api/scores/me", { cache: "no-store" }),
          fetch("/api/scores/leaderboard", { cache: "no-store" }),
        ]);

        if (myScoresResponse.ok) {
          const data = (await myScoresResponse.json()) as ScoresResponse;
          setMyScores(data.scores ?? []);
        }

        if (leaderboardResponse.ok) {
          const data = (await leaderboardResponse.json()) as ScoresResponse;
          setLeaderboard(data.scores ?? []);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadAccount();
  }, []);

  const bestScore = useMemo(() => {
    if (myScores.length === 0) {
      return null;
    }

    return [...myScores].sort((firstScore, secondScore) => {
      if (secondScore.accuracy !== firstScore.accuracy) {
        return secondScore.accuracy - firstScore.accuracy;
      }

      if (secondScore.score !== firstScore.score) {
        return secondScore.score - firstScore.score;
      }

      return secondScore.correct_answers - firstScore.correct_answers;
    })[0];
  }, [myScores]);

  const averageAccuracy = useMemo(() => {
    if (myScores.length === 0) {
      return 0;
    }

    const totalAccuracy = myScores.reduce((total, item) => total + item.accuracy, 0);
    return Math.round(totalAccuracy / myScores.length);
  }, [myScores]);

  if (isLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 pb-32 pt-24 text-white md:px-6 md:py-10">
        <AccountBackground />
        <section className="relative mx-auto max-w-6xl">
          <div className="rounded-[2.5rem] border border-white/10 bg-black/40 p-8 text-center backdrop-blur-xl">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-lime-300">BeatGuess</p>
            <h1 className="mt-4 text-4xl font-black">Loading account...</h1>
          </div>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 pb-32 pt-24 text-white md:px-6 md:py-10">
        <AccountBackground />
        <section className="relative mx-auto max-w-4xl">
          <a href="/" className="text-sm font-bold text-lime-300 hover:text-lime-200">
            ← {text.backHome}
          </a>

          <div className="mt-10 rounded-[2.5rem] border border-white/10 bg-black/45 p-8 text-center shadow-[0_0_100px_rgba(34,211,238,0.10)] backdrop-blur-xl md:p-12">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-lime-300">BeatGuess</p>
            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">
              {text.signInTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
              {text.signInDescription}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="/auth/login"
                className="rounded-full bg-lime-400 px-6 py-3 font-black text-black transition hover:bg-lime-300"
              >
                {text.signIn}
              </a>
              <a
                href="/quiz/custom-mix"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 font-black text-white transition hover:border-lime-400 hover:bg-white/10"
              >
                {text.play}
              </a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 pb-32 pt-24 text-white md:px-6 md:py-10">
      <AccountBackground />

      <section className="relative mx-auto max-w-6xl">
        <a href="/" className="text-sm font-bold text-lime-300 hover:text-lime-200">
          ← {text.backHome}
        </a>

        <div className="mt-10 rounded-[2.5rem] border border-white/10 bg-black/40 p-5 shadow-[0_0_100px_rgba(34,211,238,0.10)] backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name ?? user.email ?? text.onlineAccount}
                  className="h-20 w-20 rounded-3xl border border-white/10 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-lime-400 text-3xl font-black text-black">
                  U
                </div>
              )}

              <div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-lime-300">
                  {text.onlineAccount}
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
                  {user.name ?? user.email ?? text.title}
                </h1>
                {user.email && <p className="mt-2 text-zinc-400">{user.email}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/quiz/custom-mix"
                className="rounded-full bg-lime-400 px-6 py-3 text-center font-black text-black transition hover:bg-lime-300"
              >
                {text.play}
              </a>
              <a
                href="/auth/logout"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-center font-black text-white transition hover:border-red-400 hover:text-red-300"
              >
                {text.logout}
              </a>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
              <p className="text-sm text-zinc-500">{text.bestScore}</p>
              <p className="mt-2 text-4xl font-black text-lime-300">
                {bestScore ? bestScore.score : 0}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
              <p className="text-sm text-zinc-500">{text.totalGames}</p>
              <p className="mt-2 text-4xl font-black text-cyan-300">{myScores.length}</p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
              <p className="text-sm text-zinc-500">{text.averageAccuracy}</p>
              <p className="mt-2 text-4xl font-black text-pink-300">{averageAccuracy}%</p>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <section>
              <h2 className="text-2xl font-black">{text.myScores}</h2>

              <div className="mt-5 grid gap-3">
                {myScores.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/15 bg-black/35 p-8 text-center text-zinc-400 backdrop-blur-xl">
                    {text.noScores}
                  </div>
                ) : (
                  myScores
                    .slice(0, 10)
                    .map((item) => (
                      <ScoreRow key={item.id} score={item} language={language} text={text} />
                    ))
                )}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black">{text.leaderboard}</h2>

              <div className="mt-5 grid gap-3">
                {leaderboard.slice(0, 10).map((item, index) => (
                  <ScoreRow
                    key={item.id}
                    score={item}
                    index={index}
                    showPlayer
                    language={language}
                    text={text}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
