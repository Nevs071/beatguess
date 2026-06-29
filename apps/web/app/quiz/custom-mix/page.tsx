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
type TypedAnswerKind = 'song' | 'artist' | 'album' | 'mixed';

type SetupStep =
  | 'artists'
  | 'length'
  | 'mode'
  | 'type'
  | 'difficulty'
  | 'review';

const RECENT_ARTISTS_STORAGE_KEY = 'beatguess-recent-artists';

export default function CustomMixPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language].customMix;

  const [setupStep, setSetupStep] = useState<SetupStep>('artists');
  const [query, setQuery] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [questionAmount, setQuestionAmount] = useState(10);
  const [historyResetMessage, setHistoryResetMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [answerMode, setAnswerMode] = useState<AnswerMode>('mcq');
  const [typedAnswerKind, setTypedAnswerKind] =
    useState<TypedAnswerKind>('song');

  const setupSteps: SetupStep[] = [
    'artists',
    'length',
    'mode',
    'type',
    'difficulty',
    'review',
  ];

  const currentStepIndex = setupSteps.indexOf(setupStep);
  const progressPercent = ((currentStepIndex + 1) / setupSteps.length) * 100;

  const canGoNext = setupStep !== 'artists' || selectedArtists.length > 0;

  const difficultyLabel =
    difficulty === 'easy'
      ? 'Easy'
      : difficulty === 'medium'
        ? 'Medium'
        : 'Hard';

  const answerModeLabel =
    answerMode === 'typed' ? 'Typing challenge' : 'Multiple choice';

  const questionTypeLabel =
    typedAnswerKind === 'artist'
      ? 'Artist name'
      : typedAnswerKind === 'album'
        ? 'Album name'
        : typedAnswerKind === 'mixed'
          ? 'Mixed'
          : 'Song title';

  const lengthOptions = [
    {
      value: 5,
      label: 'Quick round',
      description: 'A short warm-up before the real battle.',
    },
    {
      value: 10,
      label: 'Standard game',
      description: 'The best balance for a normal music quiz.',
    },
    {
      value: 15,
      label: 'Long session',
      description: 'More tracks, more pressure, more points.',
    },
    {
      value: 20,
      label: 'Arena challenge',
      description: 'A full challenge for real music fans.',
    },
  ];

  const answerModeOptions: {
    value: AnswerMode;
    label: string;
    description: string;
  }[] = [
    {
      value: 'mcq',
      label: 'Multiple choice',
      description: 'Pick the correct answer from several options.',
    },
    {
      value: 'typed',
      label: 'Typing challenge',
      description: 'Type the answer yourself for a harder game.',
    },
  ];

  const questionTypeOptions: {
    value: TypedAnswerKind;
    label: string;
    description: string;
  }[] = [
    {
      value: 'song',
      label: 'Song title',
      description: 'Guess the name of the song.',
    },
    {
      value: 'artist',
      label: 'Artist name',
      description: 'Guess who performs the track.',
    },
    {
      value: 'album',
      label: 'Album name',
      description: 'Guess the album connected to the track.',
    },
    {
      value: 'mixed',
      label: 'Mixed',
      description: 'Every question can ask something different.',
    },
  ];

  const difficultyOptions: {
    value: Difficulty;
    label: string;
    description: string;
  }[] = [
    {
      value: 'easy',
      label: 'Easy',
      description: 'Full 30-second preview.',
    },
    {
      value: 'medium',
      label: 'Medium',
      description: 'Only 20 seconds to recognize the track.',
    },
    {
      value: 'hard',
      label: 'Hard',
      description: 'Only 10 seconds. No mercy.',
    },
  ];

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

  function saveRecentArtistsForHomePage(artistsToSave: Artist[]) {
    try {
      const recentArtists = artistsToSave
        .slice(-3)
        .reverse()
        .map((artist) => ({
          id: artist.id,
          name: artist.name,
          image: artist.imageLarge || artist.image,
        }));

      localStorage.setItem(
        RECENT_ARTISTS_STORAGE_KEY,
        JSON.stringify(recentArtists),
      );
    } catch {
      // The quiz should still start if localStorage fails.
    }
  }

  function startQuiz() {
    if (selectedArtists.length === 0) {
      return;
    }

    const artistIds = selectedArtists.map((artist) => artist.id).join(',');

    saveRecentArtistsForHomePage(selectedArtists);

    router.push(
      `/quiz/play?artists=${artistIds}&difficulty=${difficulty}&amount=${questionAmount}&answerMode=${answerMode}&typedAnswerKind=${typedAnswerKind}`,
    );
  }

  function goToNextStep() {
    if (!canGoNext) {
      return;
    }

    const nextStep = setupSteps[currentStepIndex + 1];

    if (nextStep) {
      setSetupStep(nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function goToPreviousStep() {
    const previousStep = setupSteps[currentStepIndex - 1];

    if (previousStep) {
      setSetupStep(previousStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function renderChoiceCards<T extends string | number>(
    options: {
      value: T;
      label: string;
      description: string;
    }[],
    selectedValue: T,
    onSelect: (value: T) => void,
  ) {
    return (
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`rounded-[2rem] border p-6 text-left transition hover:border-lime-400 ${
              selectedValue === option.value
                ? 'border-lime-400 bg-lime-400/10 shadow-[0_0_40px_rgba(132,204,22,0.12)]'
                : 'border-zinc-800 bg-black'
            }`}
          >
            <p className="text-4xl font-black text-lime-300">
              {String(option.value).toUpperCase()}
            </p>

            <h2 className="mt-5 text-2xl font-black">{option.label}</h2>
            <p className="mt-2 leading-7 text-zinc-400">
              {option.description}
            </p>
          </button>
        ))}
      </div>
    );
  }

    function renderArtistsStep() {
    return (
      <div>
        <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">
          Level 01
        </p>

        <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
          Build your lineup.
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
          Search your favorite artists and create the music world for this quiz.
        </p>

        <div className="mt-8 rounded-[2rem] border border-zinc-800 bg-black p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  searchArtists();
                }
              }}
              placeholder={t.searchPlaceholder}
              className="min-h-16 flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 text-lg text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
            />

            <button
              type="button"
              onClick={searchArtists}
              disabled={isLoading}
              className="min-h-16 rounded-2xl bg-lime-400 px-8 text-lg font-black text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? t.searchingButton : t.searchButton}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black">Search results</h2>

            <span className="rounded-full border border-zinc-800 bg-black px-4 py-2 text-sm text-zinc-400">
              {artists.length} results
            </span>
          </div>

          {artists.length === 0 ? (
            <div className="mt-5 rounded-[2rem] border border-dashed border-zinc-800 bg-black px-6 py-14 text-center">
              <p className="text-5xl">♪</p>
              <h3 className="mt-5 text-2xl font-black">No artists yet</h3>
              <p className="mt-2 text-zinc-500">
                Search an artist and your results will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {artists.map((artist) => {
                const isSelected = selectedArtists.some(
                  (selectedArtist) => selectedArtist.id === artist.id,
                );

                return (
                  <button
                    key={artist.id}
                    type="button"
                    onClick={() => selectArtist(artist)}
                    className={`group overflow-hidden rounded-[1.75rem] border bg-black text-left transition hover:border-lime-400 ${
                      isSelected ? 'border-lime-400' : 'border-zinc-800'
                    }`}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={artist.imageLarge || artist.image}
                        alt={artist.name}
                        className="h-full w-full object-cover opacity-80 transition group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                      <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-black text-white">
                        {isSelected ? '✓ Added' : '+ Add'}
                      </div>

                      <h3 className="absolute bottom-4 left-4 right-4 truncate text-2xl font-black">
                        {artist.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between p-4">
                      <div className="text-sm text-zinc-400">
                        <p>
                          {artist.fans.toLocaleString()} {t.fans}
                        </p>
                        <p>
                          {artist.albums} {t.albums}
                        </p>
                      </div>

                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-xl font-black text-lime-300">
                        {isSelected ? '✓' : '+'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black">Your lineup</h2>

            <span className="rounded-full border border-zinc-800 bg-black px-4 py-2 text-sm text-zinc-400">
              {selectedArtists.length} selected
            </span>
          </div>

          {selectedArtists.length === 0 ? (
            <div className="mt-5 rounded-[2rem] border border-dashed border-zinc-800 bg-black px-6 py-12 text-center">
              <p className="text-5xl">♪</p>
              <h3 className="mt-4 text-xl font-black">
                Your quiz lineup is empty
              </h3>
              <p className="mt-2 text-zinc-500">
                Add at least one artist to unlock the next level.
              </p>
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap gap-3">
              {selectedArtists.map((artist) => (
                <button
                  key={artist.id}
                  type="button"
                  onClick={() => removeArtist(artist.id)}
                  className="group flex items-center gap-3 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-2 text-white transition hover:border-red-400 hover:bg-red-500/10"
                >
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <span className="font-black">{artist.name}</span>
                  <span className="text-zinc-400 group-hover:text-red-300">
                    ×
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

    function renderStepContent() {
    if (setupStep === 'artists') {
      return renderArtistsStep();
    }

    if (setupStep === 'length') {
      return (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">
            Level 02
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
            Pick your round length.
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            Choose how long this music battle should be.
          </p>

          {renderChoiceCards(
            lengthOptions,
            questionAmount,
            setQuestionAmount,
          )}
        </div>
      );
    }

    if (setupStep === 'mode') {
      return (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">
            Level 03
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
            Choose your battle mode.
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            Multiple choice is fast. Typing challenge is harder and more
            competitive.
          </p>

          {renderChoiceCards(answerModeOptions, answerMode, setAnswerMode)}
        </div>
      );
    }

    if (setupStep === 'type') {
      return (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">
            Level 04
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
            What should players guess?
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            Decide what kind of music knowledge this quiz will test.
          </p>

          {renderChoiceCards(
            questionTypeOptions,
            typedAnswerKind,
            setTypedAnswerKind,
          )}
        </div>
      );
    }

    if (setupStep === 'difficulty') {
      return (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">
            Level 05
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
            Set the difficulty.
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            The harder the level, the less time players hear from each track.
          </p>

          {renderChoiceCards(difficultyOptions, difficulty, setDifficulty)}
        </div>
      );
    }

    return (
      <div>
        <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">
          Final level
        </p>

        <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
          Your quiz is ready.
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
          Review your challenge and launch the arena.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[2rem] border border-zinc-800 bg-black p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Artists
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {selectedArtists.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center gap-3 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-2"
                >
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <span className="font-black">{artist.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-black p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Game setup
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                <span className="text-zinc-400">Length</span>
                <span className="font-black text-lime-300">
                  {questionAmount} questions
                </span>
              </div>

              <div className="flex justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                <span className="text-zinc-400">Mode</span>
                <span className="font-black text-lime-300">
                  {answerModeLabel}
                </span>
              </div>

              <div className="flex justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                <span className="text-zinc-400">Type</span>
                <span className="font-black text-lime-300">
                  {questionTypeLabel}
                </span>
              </div>

              <div className="flex justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                <span className="text-zinc-400">Difficulty</span>
                <span className="font-black text-lime-300">
                  {difficultyLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] border border-zinc-800 bg-black p-6">
          <h2 className="text-2xl font-black">{t.smartReplayTitle}</h2>

          <p className="mt-3 leading-7 text-zinc-400">
            {t.smartReplayDescription}
          </p>

          <button
            type="button"
            onClick={resetPlayedHistory}
            className="mt-5 rounded-2xl border border-zinc-700 px-5 py-3 font-bold text-white transition hover:border-lime-400 hover:text-lime-300"
          >
            {t.resetHistory}
          </button>

          {historyResetMessage && (
            <p className="mt-4 rounded-xl border border-lime-400/30 bg-lime-400/10 px-4 py-3 text-sm text-lime-200">
              {historyResetMessage}
            </p>
          )}
        </div>
      </div>
    );
  }

    return (
    <main className="min-h-screen overflow-hidden bg-black px-4 pb-32 pt-24 text-white md:px-8 md:pt-8">
      <section className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <a
            href="/"
            className="rounded-full border border-zinc-800 bg-black px-4 py-2 text-sm font-black text-lime-300 transition hover:border-lime-400"
          >
            ← {t.backHome}
          </a>

          <div className="hidden rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-400 md:block">
            Step {currentStepIndex + 1} / {setupSteps.length}
          </div>
        </div>

        <div className="mt-6 rounded-full border border-zinc-800 bg-zinc-950 p-1">
          <div
            className="h-3 rounded-full bg-lime-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[2.5rem] border border-zinc-800 bg-[radial-gradient(circle_at_top_left,rgba(163,230,53,0.13),transparent_35%),linear-gradient(135deg,#09090b,#000000)] p-5 shadow-[0_0_70px_rgba(132,204,22,0.08)] md:p-8">
            {renderStepContent()}

            <div className="mt-10 flex flex-col gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                disabled={currentStepIndex === 0}
                className="rounded-2xl border border-zinc-700 px-6 py-4 font-black text-white transition hover:border-lime-400 hover:text-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Back
              </button>

              {setupStep === 'review' ? (
                <button
                  type="button"
                  onClick={startQuiz}
                  className="rounded-2xl bg-lime-400 px-8 py-4 text-lg font-black text-black transition hover:scale-[1.02] hover:bg-lime-300"
                >
                  ▶ {t.startQuiz}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goToNextStep}
                  disabled={!canGoNext}
                  className="rounded-2xl bg-lime-400 px-8 py-4 text-lg font-black text-black transition hover:scale-[1.02] hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {setupStep === 'artists' && selectedArtists.length === 0
                    ? 'Select artists to continue'
                    : 'Next level →'}
                </button>
              )}
            </div>
          </section>

          <aside className="hidden lg:block">
            <div className="sticky top-8 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">
                Quiz setup
              </p>

              <h2 className="mt-3 text-3xl font-black">Your challenge</h2>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-sm text-zinc-500">Artists</p>
                  <p className="mt-1 text-2xl font-black text-lime-300">
                    {selectedArtists.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-sm text-zinc-500">Length</p>
                  <p className="mt-1 text-xl font-black">
                    {questionAmount} questions
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-sm text-zinc-500">Mode</p>
                  <p className="mt-1 text-xl font-black">{answerModeLabel}</p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-sm text-zinc-500">Question type</p>
                  <p className="mt-1 text-xl font-black">
                    {questionTypeLabel}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-sm text-zinc-500">Difficulty</p>
                  <p className="mt-1 text-xl font-black">{difficultyLabel}</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-lime-400/30 bg-lime-400/10 p-4">
                <p className="text-sm font-bold text-lime-200">
                  Level {currentStepIndex + 1} of {setupSteps.length}
                </p>

                <p className="mt-1 text-sm text-zinc-400">
                  Complete each level to launch your music quiz.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}