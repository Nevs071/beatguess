"use client";

import { useEffect, useMemo, useState } from "react";
import {
  clearScoreHistory,
  readScoreHistory,
  type ScoreHistoryItem,
} from "@/lib/score-history";
import { useLanguage } from "@/lib/use-language";

type Auth0User = {
  sub?: string;
  name?: string;
  email?: string;
  picture?: string;
};

type OnlineScoreRow = {
  id: string;
  player_name?: string | null;
  player_email?: string | null;
  score: number;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
  difficulty: string;
  created_at: string;
};

type ScoresApiResponse = {
  scores?: OnlineScoreRow[];
  error?: string;
};

type DisplayScore = {
  id: string;
  playerName: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  difficulty: string;
  createdAt: string;
};

const scoreBackgroundTiles = [
  {
    label: "SCORE",
    icon: "🏆",
    background:
      "linear-gradient(135deg, rgba(236,72,153,0.76), rgba(34,211,238,0.42))",
  },
  {
    label: "RANK",
    icon: "🔥",
    background:
      "linear-gradient(135deg, rgba(163,230,53,0.76), rgba(59,130,246,0.42))",
  },
  {
    label: "BEAT",
    icon: "♪",
    background:
      "linear-gradient(135deg, rgba(168,85,247,0.78), rgba(236,72,153,0.38))",
  },
  {
    label: "HITS",
    icon: "♫",
    background:
      "linear-gradient(135deg, rgba(34,211,238,0.72), rgba(14,165,233,0.34))",
  },
  {
    label: "WIN",
    icon: "⚡",
    background:
      "linear-gradient(135deg, rgba(249,115,22,0.70), rgba(236,72,153,0.42))",
  },
  {
    label: "TOP",
    icon: "♬",
    background:
      "linear-gradient(135deg, rgba(132,204,22,0.72), rgba(34,211,238,0.36))",
  },
];

function ScoresMusicBackground() {
  const tiles = Array.from({ length: 72 }, (_, index) => {
    return scoreBackgroundTiles[index % scoreBackgroundTiles.length];
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#160020] via-[#07152f] to-[#020617]" />

      <div className="absolute -left-32 -top-40 hidden w-[150%] rotate-[-8deg] grid-cols-4 gap-5 opacity-75 md:grid md:grid-cols-6 lg:grid-cols-8">
        {tiles.map((tile, index) => (
          <div
            key={index}
            className={`relative h-40 overflow-hidden rounded-[1.5rem] border border-white/10 shadow-2xl md:h-52 ${
              index % 2 === 0 ? "translate-y-10" : "-translate-y-4"
            }`}
            style={{
              background: tile.background,
            }}
          >
            <div className="flex h-full flex-col justify-between p-4">
              <span className="text-5xl font-black text-white/85">
                {tile.icon}
              </span>

              <span className="text-2xl font-black tracking-[0.18em] text-white/80">
                {tile.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/32 to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/28 to-black/64" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.22),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(163,230,53,0.18),transparent_42%)]" />
    </div>
  );
}

function mapLocalScore(item: ScoreHistoryItem): DisplayScore {
  return {
    id: item.id,
    playerName: item.playerName,
    score: item.score,
    correctAnswers: item.correctAnswers,
    totalQuestions: item.totalQuestions,
    accuracy: item.accuracy,
    difficulty: item.difficulty,
    createdAt: item.createdAt,
  };
}

function mapOnlineScore(item: OnlineScoreRow): DisplayScore {
  return {
    id: item.id,
    playerName: item.player_name ?? item.player_email ?? "Player",
    score: Number(item.score),
    correctAnswers: Number(item.correct_answers),
    totalQuestions: Number(item.total_questions),
    accuracy: Number(item.accuracy),
    difficulty: item.difficulty,
    createdAt: item.created_at,
  };
}

export default function ScoresPage() {
  const { language } = useLanguage();
  const [history, setHistory] = useState<ScoreHistoryItem[]>([]);
  const [user, setUser] = useState<Auth0User | null>(null);
  const [personalOnlineScores, setPersonalOnlineScores] = useState<
    OnlineScoreRow[]
  >([]);
  const [leaderboardScores, setLeaderboardScores] = useState<OnlineScoreRow[]>(
    [],
  );
  const [isLoadingOnlineScores, setIsLoadingOnlineScores] = useState(true);
  const [onlineScoreError, setOnlineScoreError] = useState("");

  const text = {
    en: {
      backHome: "Back home",
      titleOnline: "Online score history",
      titleGuest: "Local guest scores",
      subtitleOnline:
        "These scores are linked to your account and sync across all your devices.",
      subtitleGuest:
        "You are playing as guest. These scores are saved only in this browser.",
      loadingOnline: "Loading online scores...",
      onlineError:
        "Online scores could not be loaded. Your local guest scores still work.",
      signedInAs: "Signed in as",
      onlineMode: "Account mode",
      guestMode: "Guest mode",
      myScores: "My scores",
      leaderboard: "Global leaderboard",
      leaderboardDescription:
        "Best saved results from all logged-in BeatGuess players.",
      emptyTitle: "No scores yet",
      emptyDescription: "Finish a quiz and your result will appear here.",
      emptyOnlineDescription:
        "Finish a quiz while logged in and it will sync here.",
      emptyLeaderboard: "No online leaderboard scores yet.",
      personalBest: "Personal best",
      bestDescription: "Your strongest result so far.",
      noBestYet: "No personal best yet",
      player: "Player",
      score: "Score",
      correct: "Correct",
      accuracy: "Accuracy",
      difficulty: "Difficulty",
      rank: "Rank",
      date: "Date",
      clear: "Clear local history",
      play: "Play a quiz",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      rankLegendTitle: "BeatGuess Legend",
      rankGeniusTitle: "Music Genius",
      rankHitMasterTitle: "Hit Master",
      rankSolidEarTitle: "Solid Ear",
      rankBeatHunterTitle: "Beat Hunter",
      rankWarmupTitle: "Warm-up Listener",
      rankRookieTitle: "Rookie Ear",
      rankSilentTitle: "Silent Mode",
    },
    fr: {
      backHome: "Retour accueil",
      titleOnline: "Historique des scores en ligne",
      titleGuest: "Scores locaux invité",
      subtitleOnline:
        "Ces scores sont liés à ton compte et se synchronisent sur tous tes appareils.",
      subtitleGuest:
        "Tu joues en mode invité. Ces scores sont enregistrés seulement dans ce navigateur.",
      loadingOnline: "Chargement des scores en ligne...",
      onlineError:
        "Impossible de charger les scores en ligne. Les scores locaux invités fonctionnent toujours.",
      signedInAs: "Connecté avec",
      onlineMode: "Mode compte",
      guestMode: "Mode invité",
      myScores: "Mes scores",
      leaderboard: "Classement global",
      leaderboardDescription:
        "Les meilleurs résultats enregistrés par les joueurs connectés sur BeatGuess.",
      emptyTitle: "Aucun score pour le moment",
      emptyDescription: "Termine un quiz et ton résultat apparaîtra ici.",
      emptyOnlineDescription:
        "Termine un quiz en étant connecté et il sera synchronisé ici.",
      emptyLeaderboard: "Aucun score en ligne dans le classement pour le moment.",
      personalBest: "Meilleur score",
      bestDescription: "Ton meilleur résultat jusqu’à maintenant.",
      noBestYet: "Aucun meilleur score pour le moment",
      player: "Joueur",
      score: "Score",
      correct: "Correct",
      accuracy: "Précision",
      difficulty: "Difficulté",
      rank: "Rang",
      date: "Date",
      clear: "Effacer l’historique local",
      play: "Jouer un quiz",
      easy: "Facile",
      medium: "Moyen",
      hard: "Difficile",
      rankLegendTitle: "Légende BeatGuess",
      rankGeniusTitle: "Génie musical",
      rankHitMasterTitle: "Maître des hits",
      rankSolidEarTitle: "Bonne oreille",
      rankBeatHunterTitle: "Chasseur de beats",
      rankWarmupTitle: "Échauffement",
      rankRookieTitle: "Oreille débutante",
      rankSilentTitle: "Mode silencieux",
    },
    de: {
      backHome: "Zurück zur Startseite",
      titleOnline: "Online-Punktehistorie",
      titleGuest: "Lokale Gastpunkte",
      subtitleOnline:
        "Diese Punkte sind mit deinem Konto verknüpft und werden auf allen Geräten synchronisiert.",
      subtitleGuest:
        "Du spielst als Gast. Diese Punkte werden nur in diesem Browser gespeichert.",
      loadingOnline: "Online-Punkte werden geladen...",
      onlineError:
        "Online-Punkte konnten nicht geladen werden. Lokale Gastpunkte funktionieren weiterhin.",
      signedInAs: "Angemeldet als",
      onlineMode: "Konto-Modus",
      guestMode: "Gastmodus",
      myScores: "Meine Punkte",
      leaderboard: "Globale Rangliste",
      leaderboardDescription:
        "Die besten gespeicherten Ergebnisse aller angemeldeten BeatGuess-Spieler.",
      emptyTitle: "Noch keine Punkte",
      emptyDescription: "Beende ein Quiz, dann erscheint dein Ergebnis hier.",
      emptyOnlineDescription:
        "Beende ein Quiz, während du angemeldet bist, dann wird es hier synchronisiert.",
      emptyLeaderboard: "Noch keine Online-Punkte in der Rangliste.",
      personalBest: "Persönlicher Bestwert",
      bestDescription: "Dein bisher stärkstes Ergebnis.",
      noBestYet: "Noch kein persönlicher Bestwert",
      player: "Spieler",
      score: "Punkte",
      correct: "Richtig",
      accuracy: "Genauigkeit",
      difficulty: "Schwierigkeit",
      rank: "Rang",
      date: "Datum",
      clear: "Lokale Historie löschen",
      play: "Quiz spielen",
      easy: "Einfach",
      medium: "Mittel",
      hard: "Schwer",
      rankLegendTitle: "BeatGuess-Legende",
      rankGeniusTitle: "Musikgenie",
      rankHitMasterTitle: "Hit-Meister",
      rankSolidEarTitle: "Gutes Ohr",
      rankBeatHunterTitle: "Beat-Jäger",
      rankWarmupTitle: "Warm-up-Hörer",
      rankRookieTitle: "Anfänger-Ohr",
      rankSilentTitle: "Silent Mode",
    },
  }[language];

  useEffect(() => {
    setHistory(readScoreHistory());

    async function loadOnlineScores() {
      try {
        setIsLoadingOnlineScores(true);
        setOnlineScoreError("");

        const profileResponse = await fetch("/auth/profile", {
          cache: "no-store",
        });

        if (!profileResponse.ok) {
          setUser(null);
          setPersonalOnlineScores([]);
          setLeaderboardScores([]);
          return;
        }

        const profile = (await profileResponse.json()) as Auth0User;
        setUser(profile);

        const [personalResponse, leaderboardResponse] = await Promise.all([
          fetch("/api/scores/me", { cache: "no-store" }),
          fetch("/api/scores/leaderboard", { cache: "no-store" }),
        ]);

        if (!personalResponse.ok || !leaderboardResponse.ok) {
          throw new Error("Could not load online scores");
        }

        const personalData =
          (await personalResponse.json()) as ScoresApiResponse;
        const leaderboardData =
          (await leaderboardResponse.json()) as ScoresApiResponse;

        setPersonalOnlineScores(personalData.scores ?? []);
        setLeaderboardScores(leaderboardData.scores ?? []);
      } catch {
        setOnlineScoreError(text.onlineError);
      } finally {
        setIsLoadingOnlineScores(false);
      }
    }

    void loadOnlineScores();
  }, [text.onlineError]);

  const personalScores = useMemo(() => {
    const scores = user
      ? personalOnlineScores.map(mapOnlineScore)
      : history.map(mapLocalScore);

    return [...scores].sort((firstScore, secondScore) => {
      return (
        new Date(secondScore.createdAt).getTime() -
        new Date(firstScore.createdAt).getTime()
      );
    });
  }, [history, personalOnlineScores, user]);

  const leaderboardDisplayScores = useMemo(() => {
    return leaderboardScores.map(mapOnlineScore);
  }, [leaderboardScores]);

  const bestScore =
    personalScores.length > 0
      ? [...personalScores].sort((firstScore, secondScore) => {
          if (secondScore.score !== firstScore.score) {
            return secondScore.score - firstScore.score;
          }

          if (secondScore.accuracy !== firstScore.accuracy) {
            return secondScore.accuracy - firstScore.accuracy;
          }

          return secondScore.correctAnswers - firstScore.correctAnswers;
        })[0]
      : null;

  function resetHistory() {
    clearScoreHistory();
    setHistory([]);
  }

  function getDifficultyLabel(difficulty: string) {
    if (difficulty === "hard") {
      return text.hard;
    }

    if (difficulty === "medium") {
      return text.medium;
    }

    return text.easy;
  }

  function getRankTitle(accuracy: number) {
    if (accuracy === 100) {
      return text.rankLegendTitle;
    }

    if (accuracy >= 91) {
      return text.rankGeniusTitle;
    }

    if (accuracy >= 76) {
      return text.rankHitMasterTitle;
    }

    if (accuracy >= 61) {
      return text.rankSolidEarTitle;
    }

    if (accuracy >= 41) {
      return text.rankBeatHunterTitle;
    }

    if (accuracy >= 21) {
      return text.rankWarmupTitle;
    }

    if (accuracy >= 1) {
      return text.rankRookieTitle;
    }

    return text.rankSilentTitle;
  }

  function renderScoresTable(scores: DisplayScore[], emptyDescription: string) {
    if (scores.length === 0) {
      return (
        <div className="mt-6 rounded-3xl border border-dashed border-white/15 bg-black/35 p-10 text-center backdrop-blur-xl">
          <p className="text-5xl">🏆</p>
          <h2 className="mt-4 text-2xl font-bold">{text.emptyTitle}</h2>
          <p className="mt-2 text-zinc-400">{emptyDescription}</p>
        </div>
      );
    }

    return (
      <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 backdrop-blur-xl">
        <div className="hidden grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr_0.9fr_1fr_1fr] gap-4 border-b border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-zinc-400 md:grid">
          <span>{text.player}</span>
          <span>{text.score}</span>
          <span>{text.correct}</span>
          <span>{text.accuracy}</span>
          <span>{text.difficulty}</span>
          <span>{text.rank}</span>
          <span>{text.date}</span>
        </div>

        <div className="divide-y divide-zinc-800">
          {scores.map((item) => (
            <div
              key={item.id}
              className="grid gap-4 bg-black/35 px-5 py-5 transition hover:bg-white/5 md:grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr_0.9fr_1fr_1fr]"
            >
              <div>
                <p className="text-sm text-zinc-500">{text.player}</p>
                <p className="font-bold">{item.playerName}</p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">{text.score}</p>
                <p className="font-black text-lime-300">{item.score}</p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">{text.correct}</p>
                <p className="font-bold">
                  {item.correctAnswers} / {item.totalQuestions}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">{text.accuracy}</p>
                <p className="font-bold">{item.accuracy}%</p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">{text.difficulty}</p>
                <p className="font-bold">{getDifficultyLabel(item.difficulty)}</p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">{text.rank}</p>
                <p className="font-bold">{getRankTitle(item.accuracy)}</p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">{text.date}</p>
                <p className="font-bold">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 pb-32 pt-24 text-white md:px-6 md:py-10">
      <ScoresMusicBackground />

      <section className="relative mx-auto max-w-6xl">
        <a
          href="/"
          className="text-sm font-medium text-lime-300 hover:text-lime-200"
        >
          ← {text.backHome}
        </a>

        <div className="mt-10 rounded-[2.5rem] border border-white/10 bg-black/40 p-5 shadow-[0_0_100px_rgba(34,211,238,0.10)] backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-lime-300">
                BeatGuess · {user ? text.onlineMode : text.guestMode}
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
                {user ? text.titleOnline : text.titleGuest}
              </h1>

              <p className="mt-4 max-w-2xl text-zinc-400">
                {user ? text.subtitleOnline : text.subtitleGuest}
              </p>

              {user && (
                <p className="mt-3 text-sm font-bold text-zinc-300">
                  {text.signedInAs} {user.name ?? user.email ?? "Account"}
                </p>
              )}

              {isLoadingOnlineScores && (
                <p className="mt-3 text-sm font-bold text-cyan-300">
                  {text.loadingOnline}
                </p>
              )}

              {onlineScoreError && (
                <p className="mt-3 text-sm font-bold text-red-300">
                  {onlineScoreError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/quiz/custom-mix"
                className="rounded-full bg-lime-400 px-6 py-3 text-center font-black text-black transition hover:bg-lime-300"
              >
                {text.play}
              </a>

              {!user && (
                <button
                  type="button"
                  onClick={resetHistory}
                  disabled={history.length === 0}
                  className="rounded-full border border-zinc-700 px-6 py-3 font-bold text-white transition hover:border-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {text.clear}
                </button>
              )}
            </div>
          </div>

          {bestScore && (
            <div className="mt-10 rounded-[2rem] border border-lime-400/30 bg-gradient-to-br from-lime-400/15 via-cyan-400/10 to-pink-500/10 p-6 shadow-[0_0_80px_rgba(163,230,53,0.12)] backdrop-blur-xl">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-lime-300">
                    {text.personalBest}
                  </p>

                  <h2 className="mt-3 text-3xl font-black text-white">
                    {bestScore.playerName}
                  </h2>

                  <p className="mt-2 text-sm text-zinc-400">
                    {text.bestDescription}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl">
                    <p className="text-sm text-zinc-500">{text.score}</p>
                    <p className="mt-1 text-3xl font-black text-lime-300">
                      {bestScore.score}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl">
                    <p className="text-sm text-zinc-500">{text.correct}</p>
                    <p className="mt-1 text-3xl font-black text-lime-300">
                      {bestScore.correctAnswers} / {bestScore.totalQuestions}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl">
                    <p className="text-sm text-zinc-500">{text.accuracy}</p>
                    <p className="mt-1 text-3xl font-black text-lime-300">
                      {bestScore.accuracy}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl">
                <p className="text-sm text-zinc-500">{text.rank}</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {getRankTitle(bestScore.accuracy)}
                </p>
              </div>
            </div>
          )}

          <div className="mt-10">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
              {text.myScores}
            </p>

            {renderScoresTable(
              personalScores,
              user ? text.emptyOnlineDescription : text.emptyDescription,
            )}
          </div>

          {user && (
            <div className="mt-12">
              <p className="text-sm uppercase tracking-[0.3em] text-pink-300">
                {text.leaderboard}
              </p>

              <p className="mt-2 text-sm text-zinc-400">
                {text.leaderboardDescription}
              </p>

              {renderScoresTable(
                leaderboardDisplayScores,
                text.emptyLeaderboard,
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
