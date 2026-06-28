'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

type Artist = {
  id: number;
  name: string;
  image: string;
  imageLarge: string;
  fans: number;
  albums: number;
};

type Difficulty = 'easy' | 'medium' | 'hard';

export default function CustomMixPage() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function searchArtists() {
    if (query.trim().length < 2) {
      setError('Type at least 2 characters.');
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
      setError('Could not search artists. Check if backend is running.');
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

  function startQuiz() {
    if (selectedArtists.length === 0) {
      return;
    }

    const artistIds = selectedArtists.map((artist) => artist.id).join(',');
    router.push(`/quiz/play?artists=${artistIds}&difficulty=${difficulty}`);
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <a href="/" className="text-sm text-lime-300 hover:text-lime-200">
          ← Back home
        </a>

        <div className="mt-10">
          <p className="text-sm uppercase tracking-[0.3em] text-lime-300">
            Custom Artist Mix
          </p>

          <h1 className="mt-4 text-4xl font-bold md:text-6xl">
            Build your own music quiz
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Search artists from different genres and add them to your custom
            quiz mix. BeatGuess will generate audio questions from your
            selection.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 md:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                searchArtists();
              }
            }}
            placeholder="Search artist e.g. Drake, Burna Boy, Ninho..."
            className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
          />

          <button
            onClick={searchArtists}
            disabled={isLoading}
            className="rounded-2xl bg-lime-400 px-8 py-4 font-semibold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-xl font-semibold">Choose difficulty</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              {
                value: 'easy',
                label: 'Easy',
                description: '30-second preview',
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
                <h3 className="font-semibold">{level.label}</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  {level.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {selectedArtists.length > 0 && (
          <div className="mt-10 rounded-3xl border border-lime-400/30 bg-lime-400/10 p-5">
            <h2 className="text-xl font-semibold">Selected artists</h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {selectedArtists.map((artist) => (
                <button
                  key={artist.id}
                  onClick={() => removeArtist(artist.id)}
                  className="flex items-center gap-3 rounded-full border border-lime-400/30 bg-black px-3 py-2 text-sm text-white hover:border-red-400"
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

            <button
              onClick={startQuiz}
              disabled={selectedArtists.length === 0}
              className="mt-5 rounded-full bg-lime-400 px-6 py-3 font-semibold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Start {difficulty} quiz with {selectedArtists.length} artist
              {selectedArtists.length > 1 ? 's' : ''}
            </button>
          </div>
        )}

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {artists.map((artist) => (
            <button
              key={artist.id}
              onClick={() => selectArtist(artist)}
              className="flex items-center gap-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 text-left transition hover:border-lime-400"
            >
              <img
                src={artist.image}
                alt={artist.name}
                className="h-20 w-20 rounded-2xl object-cover"
              />

              <div>
                <h2 className="text-lg font-semibold">{artist.name}</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {artist.fans.toLocaleString()} fans
                </p>
                <p className="text-sm text-zinc-500">
                  {artist.albums} albums
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}