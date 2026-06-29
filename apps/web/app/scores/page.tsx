"use client";

import { useEffect, useState } from "react";
import {
  clearScoreHistory,
  readScoreHistory,
  type ScoreHistoryItem,
} from "@/lib/score-history";
import { useLanguage } from "@/lib/use-language";


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

export default function ScoresPage() {
  const { language } = useLanguage();
  const [history, setHistory] = useState<ScoreHistoryItem[]>([]);

  useEffect(() => {
    setHistory(readScoreHistory());
  }, []);

  function resetHistory() {
    clearScoreHistory();
    setHistory([]);
  }
  const bestScore =
    history.length > 0
      ? [...history].sort((firstScore, secondScore) => {
          if (secondScore.score !== firstScore.score) {
            return secondScore.score - firstScore.score;
          }

          if (secondScore.accuracy !== firstScore.accuracy) {
            return secondScore.accuracy - firstScore.accuracy;
          }

          return secondScore.correctAnswers - firstScore.correctAnswers;
        })[0]
      : null;

  const text = {
    en: {
      backHome: "Back home",
      title: "Local score history",
      subtitle:
        "Scores are saved only in this browser. Later we can replace this with real accounts and online leaderboards.",
      emptyTitle: "No scores yet",
      emptyDescription: "Finish a quiz and your result will appear here.",
      personalBest: "Personal best",
      bestDescription: "Your strongest local result so far.",
      noBestYet: "No personal best yet",
      player: "Player",
      score: "Score",
      correct: "Correct",
      accuracy: "Accuracy",
      difficulty: "Difficulty",
      rank: "Rank",
      date: "Date",
      clear: "Clear history",
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
      title: "Historique local des scores",
      subtitle:
        "Les scores sont enregistrés seulement dans ce navigateur. Plus tard, on pourra remplacer ça par de vrais comptes et un classement en ligne.",
      emptyTitle: "Aucun score pour le moment",
      emptyDescription: "Termine un quiz et ton résultat apparaîtra ici.",
      player: "Joueur",
      score: "Score",
      correct: "Correct",
      accuracy: "Précision",
      difficulty: "Difficulté",
      rank: "Rang",
      date: "Date",
      clear: "Effacer l’historique",
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
      personalBest: "Meilleur score",
      bestDescription: "Ton meilleur résultat local jusqu’à maintenant.",
      noBestYet: "Aucun meilleur score pour le moment",
    },
    de: {
      backHome: "Zurück zur Startseite",
      title: "Lokale Punktehistorie",
      subtitle:
        "Die Punkte werden nur in diesem Browser gespeichert. Später können wir echte Konten und Online-Ranglisten hinzufügen.",
      emptyTitle: "Noch keine Punkte",
      emptyDescription: "Beende ein Quiz, dann erscheint dein Ergebnis hier.",
      player: "Spieler",
      score: "Punkte",
      correct: "Richtig",
      accuracy: "Genauigkeit",
      difficulty: "Schwierigkeit",
      rank: "Rang",
      date: "Datum",
      clear: "Historie löschen",
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
      personalBest: "Persönlicher Bestwert",
      bestDescription: "Dein bisher stärkstes lokales Ergebnis.",
      noBestYet: "Noch kein persönlicher Bestwert",
    },
  }[language];

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
                BeatGuess
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
                {text.title}
              </h1>

              <p className="mt-4 max-w-2xl text-zinc-400">{text.subtitle}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/quiz/custom-mix"
                className="rounded-full bg-lime-400 px-6 py-3 text-center font-black text-black transition hover:bg-lime-300"
              >
                {text.play}
              </a>

              <button
                type="button"
                onClick={resetHistory}
                disabled={history.length === 0}
                className="rounded-full border border-zinc-700 px-6 py-3 font-bold text-white transition hover:border-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {text.clear}
              </button>
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

          {history.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-white/15 bg-black/35 p-10 text-center backdrop-blur-xl">
              <p className="text-5xl">🏆</p>
              <h2 className="mt-4 text-2xl font-bold">{text.emptyTitle}</h2>
              <p className="mt-2 text-zinc-400">{text.emptyDescription}</p>
            </div>
          ) : (
            <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 backdrop-blur-xl">
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
                {history.map((item) => (
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
                      <p className="font-bold">
                        {getDifficultyLabel(item.difficulty)}
                      </p>
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
          )}
        </div>
      </section>
    </main>
  );
}
