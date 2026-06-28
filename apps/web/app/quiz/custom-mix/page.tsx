'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import { translations } from '@/lib/i18n';
import { useLanguage } from '@/lib/use-language';

type Artist = {
  id: number;
  name: string;
  image: string;
  imageLarge: string;
  fans: number;
  albums: number;
};

type Difficulty = 'easy' | 'medium' | 'hard';
type AnswerMode = 'mcq' | 'typed';

export default function CustomMixPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language].customMix;

  const [query, setQuery] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [questionAmount, setQuestionAmount] = useState(10);
  const [historyResetMessage, setHistoryResetMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [answerMode, setAnswerMode] = useState<AnswerMode>('mcq');

  async function searchArtists() {
    if (query.trim().length < 2) {
      setError(t.errorShortQuery);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/music/artists/search?q=${encodeURIComponent(
          query.trim(),
        )}`,
      );

      if (!response.ok) {
        throw new Error('Failed to search artists');
      }

      const data: Artist[] = await response.json();
      setArtists(data);
    } catch {
      setError(t.errorSearch);
    } finally {
      setIsLoading(false);
    }
  }

  function selectArtist(artist: Artist) {
    const alreadySelected = selectedArtists.some(
      (selectedArtist) => selectedArtist.id === artist.id,
    );

    if (alreadySelected) {
      return;
    }

    setSelectedArtists([...selectedArtists, artist]);
  }

  function removeArtist(artistId: number) {
    setSelectedArtists(
      selectedArtists.filter((artist) => artist.id !== artistId),
    );
  }

  function resetPlayedHistory() {
    localStorage.removeItem('beatguess-played-track-segments');
    setHistoryResetMessage(t.historyResetMessage);

    setTimeout(() => {
      setHistoryResetMessage('');
    }, 3000);
  }

  function startQuiz() {
    if (selectedArtists.length === 0) {
      return;
    }

    const artistIds = selectedArtists.map((artist) => artist.id).join(',');

    router.push(
  `/quiz/play?artists=${artistIds}&difficulty=${difficulty}&amount=${questionAmount}&answerMode=${answerMode}`,
);
  }

  const difficultyDescription =
    difficulty === 'hard'
      ? t.secondPreview10
      : difficulty === 'medium'
        ? t.secondPreview20
        : t.fullPreview;

  const difficultyLabel =
    difficulty === 'hard'
      ? language === 'de'
        ? 'Schwer'
        : language === 'fr'
          ? 'Difficile'
          : 'hard'
      : difficulty === 'medium'
        ? language === 'de'
          ? 'Mittel'
          : language === 'fr'
            ? 'Moyen'
            : 'medium'
        : language === 'de'
          ? 'Einfach'
          : language === 'fr'
            ? 'Facile'
            : 'easy';

  const selectedArtistLabel =
    selectedArtists.length === 1 ? t.selectedArtist : t.selectedArtists;

  return (
    <main className="min-h-screen overflow-hidden bg-black px-5 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <a
          href="/"
          className="text-sm font-medium text-lime-300 hover:text-lime-200"
        >
          ← {t.backHome}
        </a>

        <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 px-6 py-8 md:px-10 md:py-12">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-lime-400/20 blur-3xl" />
          <div className="absolute -bottom-24 left-20 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-lime-300">
                {t.label}
              </p>

              <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
                {t.heroTitle}
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
                {t.heroDescription}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-full border border-zinc-800 bg-black/70 px-4 py-2 text-sm text-zinc-300">
                  🎧 {difficultyDescription}
                </div>
                <div className="rounded-full border border-zinc-800 bg-black/70 px-4 py-2 text-sm text-zinc-300">
                  ⚡ {questionAmount} {t.questions}
                </div>
                <div className="rounded-full border border-zinc-800 bg-black/70 px-4 py-2 text-sm text-zinc-300">
                  👥 {selectedArtists.length} {selectedArtistLabel}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-lime-400/30 bg-black/60 p-6 shadow-2xl shadow-lime-400/10">
              <p className="text-sm uppercase tracking-[0.25em] text-lime-300">
                {t.readySetup}
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <span className="text-zinc-400">{t.difficulty}</span>
                  <span className="font-bold text-lime-300">
                    {difficultyLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
  <span className="text-zinc-400">{t.answerMode}</span>
  <span className="font-bold text-lime-300">
    {answerMode === 'mcq' ? t.multipleChoice : t.typingChallenge}
  </span>
</div>

                <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <span className="text-zinc-400">{t.quizLength}</span>
                  <span className="font-bold text-lime-300">
                    {questionAmount} {t.questions}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <span className="text-zinc-400">{t.artists}</span>
                  <span className="font-bold text-lime-300">
                    {selectedArtists.length}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={startQuiz}
                disabled={selectedArtists.length === 0}
                className="mt-6 w-full rounded-2xl bg-lime-400 px-6 py-4 text-lg font-black text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {selectedArtists.length === 0
                  ? t.selectArtistsToStart
                  : t.startQuiz}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5 md:p-6">
            <h2 className="text-2xl font-bold">{t.searchTitle}</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {t.searchDescription}
            </p>

            <div className="mt-5 flex flex-col gap-3 md:flex-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    searchArtists();
                  }
                }}
                placeholder={t.searchPlaceholder}
                className="flex-1 rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
              />

              <button
                type="button"
                onClick={searchArtists}
                disabled={isLoading}
                className="rounded-2xl bg-lime-400 px-8 py-4 font-bold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? t.searchingButton : t.searchButton}
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {artists.map((artist) => {
                const isSelected = selectedArtists.some(
                  (selectedArtist) => selectedArtist.id === artist.id,
                );

                return (
                  <button
                    key={artist.id}
                    type="button"
                    onClick={() => selectArtist(artist)}
                    className={`group flex items-center gap-4 rounded-3xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-lime-400 bg-lime-400/10'
                        : 'border-zinc-800 bg-black hover:border-lime-400'
                    }`}
                  >
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="h-20 w-20 rounded-2xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold">
                        {artist.name}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        {artist.fans.toLocaleString()} {t.fans}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {artist.albums} {t.albums}
                      </p>
                    </div>

                    <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 group-hover:border-lime-400 group-hover:text-lime-300">
                      {isSelected ? t.added : t.add}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5 md:p-6">
              <h2 className="text-2xl font-bold">{t.selectedTitle}</h2>

              {selectedArtists.length === 0 ? (
                <div className="mt-5 rounded-3xl border border-dashed border-zinc-800 bg-black p-6 text-center">
                  <p className="text-4xl">🎙️</p>
                  <p className="mt-3 text-zinc-400">{t.emptyLineup}</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {t.emptyLineupDescription}
                  </p>
                </div>
              ) : (
                <div className="mt-5 flex flex-wrap gap-3">
                  {selectedArtists.map((artist) => (
                    <button
                      key={artist.id}
                      type="button"
                      onClick={() => removeArtist(artist.id)}
                      className="flex items-center gap-3 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-2 text-sm text-white transition hover:border-red-400 hover:bg-red-500/10"
                    >
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <span>{artist.name}</span>
                      <span className="text-zinc-500">×</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5 md:p-6">
              <h2 className="text-2xl font-bold">{t.gameSetup}</h2>

              <div className="mt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  {t.quizLength}
                </p>
                  <div className="mt-6">
  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
    {t.answerMode}
  </p>

  <div className="mt-3 space-y-3">
    {[
      {
        value: 'mcq',
        label: t.multipleChoice,
        description: t.multipleChoiceDescription,
      },
      {
        value: 'typed',
        label: t.typingChallenge,
        description: t.typingChallengeDescription,
      },
    ].map((mode) => (
      <button
        key={mode.value}
        type="button"
        onClick={() => setAnswerMode(mode.value as AnswerMode)}
        className={`w-full rounded-2xl border p-4 text-left transition ${
          answerMode === mode.value
            ? 'border-lime-400 bg-lime-400/10'
            : 'border-zinc-800 bg-black hover:border-lime-400'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold">{mode.label}</h3>
            <p className="mt-1 text-sm text-zinc-400">
              {mode.description}
            </p>
          </div>

          {answerMode === mode.value && (
            <span className="text-lime-300">●</span>
          )}
        </div>
      </button>
    ))}
  </div>
</div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[5, 10, 15, 20].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setQuestionAmount(amount)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        questionAmount === amount
                          ? 'border-lime-400 bg-lime-400/10'
                          : 'border-zinc-800 bg-black hover:border-lime-400'
                      }`}
                    >
                      <h3 className="font-bold">{amount}</h3>
                      <p className="mt-1 text-xs text-zinc-400">
                        {amount === 5
                          ? t.quick
                          : amount === 10
                            ? t.standard
                            : amount === 15
                              ? t.long
                              : t.challenge}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  {t.difficulty}
                </p>

                <div className="mt-3 space-y-3">
                  {[
                    {
                      value: 'easy',
                      label:
                        language === 'de'
                          ? 'Einfach'
                          : language === 'fr'
                            ? 'Facile'
                            : 'Easy',
                      description: t.fullPreview,
                    },
                    {
                      value: 'medium',
                      label:
                        language === 'de'
                          ? 'Mittel'
                          : language === 'fr'
                            ? 'Moyen'
                            : 'Medium',
                      description: t.secondPreview20,
                    },
                    {
                      value: 'hard',
                      label:
                        language === 'de'
                          ? 'Schwer'
                          : language === 'fr'
                            ? 'Difficile'
                            : 'Hard',
                      description: t.secondPreview10,
                    },
                  ].map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setDifficulty(level.value as Difficulty)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        difficulty === level.value
                          ? 'border-lime-400 bg-lime-400/10'
                          : 'border-zinc-800 bg-black hover:border-lime-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold">{level.label}</h3>
                          <p className="mt-1 text-sm text-zinc-400">
                            {level.description}
                          </p>
                        </div>
                        {difficulty === level.value && (
                          <span className="text-lime-300">●</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5 md:p-6">
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-bold">{t.smartReplayTitle}</h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    {t.smartReplayDescription}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetPlayedHistory}
                  className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-bold text-white transition hover:border-lime-400 hover:text-lime-300"
                >
                  {t.resetHistory}
                </button>
              </div>

              {historyResetMessage && (
                <p className="mt-4 rounded-xl border border-lime-400/30 bg-lime-400/10 px-4 py-3 text-sm text-lime-200">
                  {historyResetMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}