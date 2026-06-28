'use client';

import { useEffect, useState } from 'react';
import {
  clearScoreHistory,
  readScoreHistory,
  type ScoreHistoryItem,
} from '@/lib/score-history';
import { useLanguage } from '@/lib/use-language';

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

  const text = {
    en: {
      backHome: 'Back home',
      title: 'Local score history',
      subtitle:
        'Scores are saved only in this browser. Later we can replace this with real accounts and online leaderboards.',
      emptyTitle: 'No scores yet',
      emptyDescription: 'Finish a quiz and your result will appear here.',
      player: 'Player',
      score: 'Score',
      correct: 'Correct',
      accuracy: 'Accuracy',
      difficulty: 'Difficulty',
      rank: 'Rank',
      date: 'Date',
      clear: 'Clear history',
      play: 'Play a quiz',
    },
    fr: {
      backHome: 'Retour accueil',
      title: 'Historique local des scores',
      subtitle:
        'Les scores sont enregistrés seulement dans ce navigateur. Plus tard, on pourra remplacer ça par de vrais comptes et un classement en ligne.',
      emptyTitle: 'Aucun score pour le moment',
      emptyDescription: 'Termine un quiz et ton résultat apparaîtra ici.',
      player: 'Joueur',
      score: 'Score',
      correct: 'Correct',
      accuracy: 'Précision',
      difficulty: 'Difficulté',
      rank: 'Rang',
      date: 'Date',
      clear: 'Effacer l’historique',
      play: 'Jouer un quiz',
    },
    de: {
      backHome: 'Zurück zur Startseite',
      title: 'Lokale Punktehistorie',
      subtitle:
        'Die Punkte werden nur in diesem Browser gespeichert. Später können wir echte Konten und Online-Ranglisten hinzufügen.',
      emptyTitle: 'Noch keine Punkte',
      emptyDescription: 'Beende ein Quiz, dann erscheint dein Ergebnis hier.',
      player: 'Spieler',
      score: 'Punkte',
      correct: 'Richtig',
      accuracy: 'Genauigkeit',
      difficulty: 'Schwierigkeit',
      rank: 'Rang',
      date: 'Datum',
      clear: 'Historie löschen',
      play: 'Quiz spielen',
    },
  }[language];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <a
          href="/"
          className="text-sm font-medium text-lime-300 hover:text-lime-200"
        >
          ← {text.backHome}
        </a>

        <div className="mt-10 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8">
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

          {history.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-zinc-800 bg-black p-10 text-center">
              <p className="text-5xl">🏆</p>
              <h2 className="mt-4 text-2xl font-bold">{text.emptyTitle}</h2>
              <p className="mt-2 text-zinc-400">{text.emptyDescription}</p>
            </div>
          ) : (
            <div className="mt-10 overflow-hidden rounded-3xl border border-zinc-800">
              <div className="hidden grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr_0.9fr_1fr_1fr] gap-4 border-b border-zinc-800 bg-black px-5 py-4 text-sm font-bold text-zinc-400 md:grid">
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
                    className="grid gap-4 bg-zinc-950 px-5 py-5 md:grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr_0.9fr_1fr_1fr]"
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
                      <p className="text-sm text-zinc-500">
                        {text.difficulty}
                      </p>
                      <p className="font-bold capitalize">{item.difficulty}</p>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-500">{text.rank}</p>
                      <p className="font-bold">{item.rankTitle}</p>
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
