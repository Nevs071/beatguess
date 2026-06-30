'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/use-language';

const textByLanguage = {
  en: {
    backHome: 'Back home',
    label: 'Choose your mode',
    title: 'How do you want to play?',
    subtitle:
      'Play alone to train your ear, or create a challenge room and compete with friends on the same quiz.',
    soloTitle: 'Solo Quiz',
    soloDescription:
      'Choose your artists, play alone, and try to beat your personal score.',
    soloButton: 'Start solo quiz',
    challengeTitle: 'Challenge Room',
    challengeDescription:
      'Create a room, invite friends with a link, and compare everyone on the same leaderboard.',
    challengeButton: 'Create challenge room',
  },
  fr: {
    backHome: 'Retour accueil',
    label: 'Choisis ton mode',
    title: 'Comment veux-tu jouer ?',
    subtitle:
      'Joue seul pour entraîner ton oreille, ou crée une salle de défi pour affronter tes amis sur le même quiz.',
    soloTitle: 'Quiz solo',
    soloDescription:
      'Choisis tes artistes, joue seul, et essaie de battre ton meilleur score.',
    soloButton: 'Lancer un quiz solo',
    challengeTitle: 'Salle de défi',
    challengeDescription:
      'Crée une salle, invite tes amis avec un lien, et comparez vos scores sur le même classement.',
    challengeButton: 'Créer une salle',
  },
  de: {
    backHome: 'Zurück zur Startseite',
    label: 'Wähle deinen Modus',
    title: 'Wie möchtest du spielen?',
    subtitle:
      'Spiele alleine, um dein Ohr zu trainieren, oder erstelle einen Challenge-Raum und tritt gegen Freunde im gleichen Quiz an.',
    soloTitle: 'Solo-Quiz',
    soloDescription:
      'Wähle deine Künstler, spiele alleine und versuche, deinen persönlichen Score zu schlagen.',
    soloButton: 'Solo-Quiz starten',
    challengeTitle: 'Challenge-Raum',
    challengeDescription:
      'Erstelle einen Raum, lade Freunde per Link ein und vergleicht eure Scores auf derselben Rangliste.',
    challengeButton: 'Challenge-Raum erstellen',
  },
} as const;

export default function PlayPage() {
  const { language } = useLanguage();
  const text = textByLanguage[language];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 pb-32 pt-24 text-white md:px-6 md:py-10">
      <div className="absolute inset-0 bg-gradient-to-br from-[#160020] via-[#07152f] to-[#020617]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(163,230,53,0.22),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(236,72,153,0.18),transparent_42%)]" />

      <section className="relative mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-sm font-black text-lime-300 hover:text-lime-200"
        >
          ← {text.backHome}
        </Link>

        <div className="mt-10 rounded-[2.5rem] border border-white/10 bg-black/40 p-6 shadow-[0_0_100px_rgba(34,211,238,0.10)] backdrop-blur-xl md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-lime-300">
            {text.label}
          </p>

          <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
            {text.title}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-400">
            {text.subtitle}
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Link
              href="/quiz/custom-mix"
              className="group rounded-[2rem] border border-lime-400/30 bg-lime-400/10 p-7 transition hover:scale-[1.01] hover:border-lime-300 hover:bg-lime-400/15"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-400 text-3xl">
                🎧
              </div>

              <h2 className="mt-6 text-4xl font-black text-white">
                {text.soloTitle}
              </h2>

              <p className="mt-4 text-base leading-7 text-zinc-400">
                {text.soloDescription}
              </p>

              <div className="mt-8 inline-flex rounded-full bg-lime-400 px-6 py-3 font-black text-black transition group-hover:bg-lime-300">
                {text.soloButton}
              </div>
            </Link>

            <Link
              href="/challenge"
              className="group rounded-[2rem] border border-cyan-400/30 bg-cyan-400/10 p-7 transition hover:scale-[1.01] hover:border-cyan-300 hover:bg-cyan-400/15"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-300 text-3xl">
                👥
              </div>

              <h2 className="mt-6 text-4xl font-black text-white">
                {text.challengeTitle}
              </h2>

              <p className="mt-4 text-base leading-7 text-zinc-400">
                {text.challengeDescription}
              </p>

              <div className="mt-8 inline-flex rounded-full bg-cyan-300 px-6 py-3 font-black text-black transition group-hover:bg-cyan-200">
                {text.challengeButton}
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}