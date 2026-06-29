'use client';

import { useEffect, useState } from 'react';
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

const RECENT_ARTISTS_STORAGE_KEY = 'beatguess-recent-artists';
const CUSTOM_MIX_BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=2200&q=90',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=2200&q=90',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=2200&q=90',
  'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=2200&q=90',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=2200&q=90',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2200&q=90',
];

function getRandomCustomMixBackground() {
  return CUSTOM_MIX_BACKGROUND_IMAGES[
    Math.floor(Math.random() * CUSTOM_MIX_BACKGROUND_IMAGES.length)
  ];
}
export default function CustomMixPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language].customMix;
  const [backgroundImage, setBackgroundImage] = useState('');
  useEffect(() => {
  setBackgroundImage(getRandomCustomMixBackground());
}, []);

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
    const recentArtists = artistsToSave.slice(-3).reverse().map((artist) => ({
      id: artist.id,
      name: artist.name,
     image: artist.imageLarge ?? artist.image,
    }));

    localStorage.setItem(
      RECENT_ARTISTS_STORAGE_KEY,
      JSON.stringify(recentArtists),
    );
  } catch {
    // If browser storage fails, the quiz should still work.
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
    const customMixBackgroundImage =
  selectedArtists[0]?.imageLarge ?? selectedArtists[0]?.image ?? backgroundImage;
  const selectedArtistIds = new Set(
  selectedArtists.map((artist) => artist.id),
);

const isQuizReady = selectedArtists.length > 0;

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

  return (
  <main className="relative min-h-screen overflow-x-hidden bg-black px-4 pb-28 pt-6 text-white md:px-8 md:pb-10">
    <div className="pointer-events-none absolute inset-0">
      {customMixBackgroundImage && (
        <>
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center opacity-70"
            style={{
              backgroundImage: `url(${customMixBackgroundImage})`,
            }}
          />

          <div
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-35 blur-2xl"
            style={{
              backgroundImage: `url(${customMixBackgroundImage})`,
            }}
          />
        </>
      )}

      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(163,230,53,0.18),transparent_35%)]" />
    </div>

    <section className="relative mx-auto max-w-7xl">
      <a
        href="/"
        className="inline-flex items-center text-sm font-medium text-lime-300 transition hover:text-lime-200"
      >
        ← Back home
      </a>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.65fr_0.95fr]">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* HERO */}
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/60 p-6 shadow-[0_0_60px_rgba(132,204,22,0.12)] backdrop-blur-xl md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.45em] text-lime-300">
                  Custom Artist Mix
                </p>

                <h1 className="mt-5 max-w-3xl text-4xl font-black leading-none tracking-tight md:text-6xl">
                  Build a quiz that feels like your playlist.
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
                  Pick your artists, choose the challenge, and BeatGuess creates
                  a fresh audio quiz with smart replay history.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-200">
                    🎧{' '}
                    {difficulty === 'easy'
                      ? 'Full preview'
                      : difficulty === 'medium'
                        ? '20-second preview'
                        : '10-second preview'}
                  </div>

                  <div className="rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-200">
                    ⚡ {questionAmount} questions
                  </div>

                  <div className="rounded-full border border-zinc-800 bg-black/70 px-4 py-2 text-sm text-zinc-200">
  👥 {selectedArtists.length} {selectedArtistLabel}
</div>

<div className="rounded-full border border-zinc-800 bg-black/70 px-4 py-2 text-sm text-zinc-200">
  🧠 {answerModeLabel}
</div>

<div className="rounded-full border border-zinc-800 bg-black/70 px-4 py-2 text-sm text-zinc-200">
  🎯 {questionTypeLabel}
</div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-lime-400/20 bg-black/70 p-5 shadow-[0_0_30px_rgba(132,204,22,0.08)]">
                <p className="text-xs uppercase tracking-[0.4em] text-lime-300">
                  Ready setup
                </p>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4">
                    <span className="text-zinc-400">Difficulty</span>
                    <span className="font-bold capitalize text-lime-300">
                      {difficulty}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4">
                    <span className="text-zinc-400">Answer mode</span>
                    <span className="font-bold text-lime-300">
                      {answerMode === 'typed'
                        ? 'Typing challenge'
                        : 'Multiple choice'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4">
                    <span className="text-zinc-400">Quiz length</span>
                    <span className="font-bold text-lime-300">
                      {questionAmount} questions
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4">
                    <span className="text-zinc-400">Artists</span>
                    <span className="font-bold text-lime-300">
                      {selectedArtists.length}
                    </span>
                  </div>
                </div>

                <button
                  onClick={startQuiz}
                  disabled={selectedArtists.length === 0}
                  className="mt-5 w-full rounded-2xl bg-lime-400 px-6 py-4 text-lg font-black text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {selectedArtists.length === 0
                    ? 'Select artists to start'
                    : `Start ${difficulty} quiz`}
                </button>
              </div>
            </div>
          </div>

          {/* SEARCH CARD */}
          <div className="rounded-[2rem] border border-white/10 bg-black/65 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">1. Search artists</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Add one artist or mix different worlds together.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 md:flex-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    searchArtists();
                  }
                }}
                placeholder="Search artist e.g. Drake, Burna Boy, Ninho..."
                className="flex-1 rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
              />

              <button
                onClick={searchArtists}
                disabled={isLoading}
                className="rounded-2xl bg-lime-400 px-8 py-4 font-bold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>

          {/* SEARCH RESULTS */}
          <div className="rounded-[2rem] border border-white/10 bg-black/65 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">Search results</h2>
              <span className="rounded-full border border-zinc-800 bg-black px-4 py-2 text-sm text-zinc-400">
                {artists.length} result{artists.length !== 1 ? 's' : ''}
              </span>
            </div>

            {artists.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-zinc-800 bg-black px-6 py-12 text-center">
                <p className="text-4xl">🎵</p>
                <p className="mt-4 text-lg font-semibold text-zinc-200">
                  No artists yet
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Search an artist and your results will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {artists.map((artist) => {
  const isArtistSelected = selectedArtistIds.has(artist.id);

  return (
    <button
      key={artist.id}
      type="button"
      onClick={() =>
        isArtistSelected ? removeArtist(artist.id) : selectArtist(artist)
      }
      className={`group overflow-hidden rounded-3xl border text-left transition ${
        isArtistSelected
          ? 'border-lime-400 bg-lime-400/15 shadow-[0_0_35px_rgba(132,204,22,0.18)]'
          : 'border-white/10 bg-black/70 hover:border-lime-400 hover:bg-black/85'
      }`}
    >
      <div className="relative h-36 overflow-hidden">
        <img
          src={artist.imageLarge ?? artist.image}
          alt={artist.name}
          className="h-full w-full object-cover opacity-85 transition group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {isArtistSelected && (
          <div className="absolute inset-0 bg-lime-400/20" />
        )}

        <div className="absolute left-4 top-4">
          <span
            className={`rounded-full px-3 py-2 text-xs font-black ${
              isArtistSelected
                ? 'bg-lime-400 text-black'
                : 'bg-black/70 text-white'
            }`}
          >
            {isArtistSelected ? `✓ ${t.added}` : `+ ${t.add}`}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="truncate text-2xl font-black text-white">
            {artist.name}
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm text-zinc-300">
            {artist.fans.toLocaleString()} {t.fans}
          </p>
          <p className="text-sm text-zinc-500">
            {artist.albums} {t.albums}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-black ${
            isArtistSelected
              ? 'bg-lime-400 text-black'
              : 'bg-zinc-900 text-lime-300'
          }`}
        >
          {isArtistSelected ? '✓' : '+'}
        </div>
      </div>
    </button>
  );
})}
              </div>
            )}
          </div>

          {/* SELECTED ARTISTS */}
          <div className="rounded-[2rem] border border-white/10 bg-black/65 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">2. Selected artists</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Your current quiz lineup.
                </p>
              </div>

              <div className="rounded-full border border-zinc-800 bg-black px-4 py-2 text-sm text-zinc-400">
                {selectedArtists.length} selected
              </div>
            </div>

            {selectedArtists.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-zinc-800 bg-black px-6 py-12 text-center">
                <p className="text-4xl">🎤</p>
                <p className="mt-4 text-lg font-semibold text-zinc-200">
                  Your quiz lineup is empty
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Search and add artists to unlock the start button.
                </p>
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap gap-3">
                {selectedArtists.map((artist) => (
                  <button
                    key={artist.id}
                    onClick={() => removeArtist(artist.id)}
                    className="flex items-center gap-3 rounded-full border border-lime-400/30 bg-black px-3 py-2 text-sm text-white transition hover:border-red-400"
                  >
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <span className="font-medium">{artist.name}</span>
                    <span className="text-zinc-500">×</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          {/* GAME SETUP */}
          <div className="rounded-[2rem] border border-white/10 bg-black/65 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-black">3. Game setup</h2>

            {/* QUIZ LENGTH */}
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                Quiz length
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3">
                {[5, 10, 15, 20].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setQuestionAmount(amount)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      questionAmount === amount
                        ? 'border-lime-400 bg-lime-400/10'
                        : 'border-zinc-800 bg-black hover:border-lime-400'
                    }`}
                  >
                    <p className="text-xl font-black">{amount}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {amount === 5
                        ? 'Quick'
                        : amount === 10
                          ? 'Standard'
                          : amount === 15
                            ? 'Long'
                            : 'Challenge'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* ANSWER MODE */}
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                Answer mode
              </p>

              <div className="mt-3 grid gap-3">
                <button
                 onClick={() => setAnswerMode('mcq')}
                  className={`rounded-2xl border p-4 text-left transition ${
                    answerMode === 'mcq'
                      ? 'border-lime-400 bg-lime-400/10'
                      : 'border-zinc-800 bg-black hover:border-lime-400'
                  }`}
                >
                  <p className="font-bold">Multiple choice</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Choose the correct answer from 4 options.
                  </p>
                </button>

                <button
                  onClick={() => setAnswerMode('typed')}
                  className={`rounded-2xl border p-4 text-left transition ${
                    answerMode === 'typed'
                      ? 'border-lime-400 bg-lime-400/10'
                      : 'border-zinc-800 bg-black hover:border-lime-400'
                  }`}
                >
                  <p className="font-bold">Typing challenge</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Type the answer yourself. Harder, but more competitive.
                  </p>
                </button>
              </div>
            </div>

            {/* QUESTION TYPE */}
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                Question type
              </p>

              <div className="mt-3 grid gap-3">
                {[
                  {
                    value: 'song',
                    label: 'Song title',
                    description:
                      answerMode === 'typed'
                        ? 'Listen and type the song title.'
                        : 'Listen and choose the correct song title.',
                  },
                  {
                    value: 'artist',
                    label: 'Artist name',
                    description:
                      answerMode === 'typed'
                        ? 'Listen and type the artist name.'
                        : 'Listen and choose the correct artist.',
                  },
                  {
                    value: 'album',
                    label: 'Album name',
                    description:
                      answerMode === 'typed'
                        ? 'Listen and type the album name.'
                        : 'Listen and choose the correct album.',
                  },
                  {
                    value: 'mixed',
                    label: 'Mixed',
                    description:
                      answerMode === 'typed'
                        ? 'The app randomly asks for song, artist, or album.'
                        : 'The app randomly shows song, artist, or album options.',
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setTypedAnswerKind(option.value as TypedAnswerKind)
                      
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      typedAnswerKind === option.value
                        ? 'border-lime-400 bg-lime-400/10'
                        : 'border-zinc-800 bg-black hover:border-lime-400'
                    }`}
                  >
                    <p className="font-bold">{option.label}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* DIFFICULTY */}
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                Difficulty
              </p>

              <div className="mt-3 grid gap-3">
                {[
                  {
                    value: 'easy',
                    label: 'Easy',
                    description: 'Full preview',
                  },
                  {
                    value: 'medium',
                    label: 'Medium',
                    description: '20-second preview',
                  },
                  {
                    value: 'hard',
                    label: 'Hard',
                    description: '10-second preview',
                  },
                ].map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setDifficulty(level.value as Difficulty)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      difficulty === level.value
                        ? 'border-lime-400 bg-lime-400/10'
                        : 'border-zinc-800 bg-black hover:border-lime-400'
                    }`}
                  >
                    <p className="font-bold">{level.label}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {level.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SMART REPLAY */}
          <div className="rounded-[2rem] border border-white/10 bg-black/65 p-6 backdrop-blur-xl">
            <h2 className="text-xl font-black">Smart replay history</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              BeatGuess remembers played songs and segments to avoid repeating
              the same parts too often.
            </p>

            <button
              type="button"
              onClick={resetPlayedHistory}
              className="mt-5 w-full rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-bold text-white transition hover:border-lime-400 hover:text-lime-300"
            >
              Reset played history
            </button>

            {historyResetMessage && (
              <p className="mt-4 rounded-xl border border-lime-400/30 bg-lime-400/10 px-4 py-3 text-sm text-lime-200">
                {historyResetMessage}
              </p>
            )}
          </div>
        </aside>
      </div>
       </section>

    {isQuizReady && (
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-[1.5rem] border border-lime-400/30 bg-black/85 p-3 shadow-[0_0_45px_rgba(132,204,22,0.25)] backdrop-blur-xl md:left-1/2 md:right-auto md:w-[560px] md:-translate-x-1/2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {selectedArtists.slice(0, 3).map((artist) => (
                <img
                  key={artist.id}
                  src={artist.image}
                  alt={artist.name}
                  className="h-10 w-10 rounded-full border-2 border-black object-cover"
                />
              ))}
            </div>

            <div>
              <p className="text-sm font-black text-white">
                {selectedArtists.length} {selectedArtistLabel} ready
              </p>
              <p className="text-xs text-zinc-400">
                {questionAmount} questions · {answerModeLabel} · {questionTypeLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={startQuiz}
            className="rounded-2xl bg-lime-400 px-5 py-3 text-sm font-black text-black transition hover:scale-[1.02] hover:bg-lime-300"
          >
            ▶ {t.startQuiz}
          </button>
        </div>
      </div>
    )}
  </main>
);
}