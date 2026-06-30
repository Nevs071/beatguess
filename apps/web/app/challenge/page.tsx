'use client';

import { useState } from 'react';
import { API_BASE_URL } from '@/lib/api';

type Artist = {
  id: number;
  name: string;
  image: string;
  fans: number;
};

type Difficulty = 'easy' | 'medium' | 'hard';
type AnswerMode = 'mcq' | 'typed';
type TypedAnswerKind = 'song' | 'artist' | 'album' | 'mixed';

export default function ChallengePage() {
  const [query, setQuery] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [questionAmount, setQuestionAmount] = useState(10);
  const [answerMode, setAnswerMode] = useState<AnswerMode>('mcq');
  const [typedAnswerKind, setTypedAnswerKind] = useState<TypedAnswerKind>('song');
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState('');

  const createdLink =
    typeof window !== 'undefined' && createdRoomCode
      ? `${window.location.origin}/challenge/${createdRoomCode}`
      : '';

  async function searchArtists() {
    if (query.trim().length < 2) {
      setError('Type at least 2 characters.');
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/music/artists/search?query=${encodeURIComponent(query.trim())}`,
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setArtists(data.artists ?? data ?? []);
    } catch {
      setError('Could not search artists.');
    } finally {
      setIsSearching(false);
    }
  }

  function addArtist(artist: Artist) {
    setSelectedArtists((currentArtists) => {
      if (currentArtists.some((currentArtist) => currentArtist.id === artist.id)) {
        return currentArtists;
      }

      return [...currentArtists, artist];
    });
  }

  function removeArtist(artistId: number) {
    setSelectedArtists((currentArtists) =>
      currentArtists.filter((artist) => artist.id !== artistId),
    );
  }

  async function createChallenge() {
    if (selectedArtists.length === 0) {
      setError('Select at least one artist.');
      return;
    }

    setIsCreating(true);
    setError('');
    setCreatedRoomCode('');

    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          artistIds: selectedArtists.map((artist) => String(artist.id)),
          difficulty,
          questionAmount,
          answerMode,
          typedAnswerKind,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Challenge creation failed');
      }

      setCreatedRoomCode(data.challenge.room_code);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not create challenge.',
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function copyChallengeLink() {
    if (!createdLink) return;
    await navigator.clipboard.writeText(createdLink);
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 pb-28 pt-24 text-white md:px-6 md:py-10">
      <section className="mx-auto max-w-6xl">
        <a href="/" className="text-sm font-bold text-lime-300 hover:text-lime-200">
          ← Back home
        </a>

        <div className="mt-10 rounded-[2.5rem] border border-white/10 bg-black/45 p-6 shadow-[0_0_100px_rgba(34,211,238,0.10)] backdrop-blur-xl md:p-8">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-lime-300">
            Multiplayer challenge
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            Create a BeatGuess room
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Pick artists and settings, then invite friends with a room link.
            Everyone plays the same challenge and competes on the room leaderboard.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-2xl font-black">1. Choose artists</h2>

              <div className="mt-5 flex gap-3">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void searchArtists();
                  }}
                  placeholder="Search artist e.g. Drake, Ninho, Burna Boy..."
                  className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/45 px-5 py-3 font-bold text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-400"
                />

                <button
                  type="button"
                  onClick={() => void searchArtists()}
                  disabled={isSearching}
                  className="rounded-full bg-lime-400 px-5 py-3 font-black text-black transition hover:bg-lime-300 disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {error && (
                <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                  {error}
                </p>
              )}

              <div className="mt-5 grid gap-3">
                {artists.slice(0, 8).map((artist) => {
                  const isSelected = selectedArtists.some(
                    (selectedArtist) => selectedArtist.id === artist.id,
                  );

                  return (
                    <button
                      key={artist.id}
                      type="button"
                      onClick={() => addArtist(artist)}
                      disabled={isSelected}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/35 p-3 text-left transition hover:border-lime-400 disabled:opacity-50"
                    >
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="h-14 w-14 rounded-2xl object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-black">{artist.name}</p>
                        <p className="text-sm text-zinc-500">
                          {artist.fans?.toLocaleString() ?? 0} fans
                        </p>
                      </div>

                      <span className="text-sm font-black text-lime-300">
                        {isSelected ? 'Added' : 'Add'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-2xl font-black">2. Room settings</h2>

              <div className="mt-5">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">
                  Selected artists
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedArtists.length === 0 ? (
                    <span className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-500">
                      No artists yet
                    </span>
                  ) : (
                    selectedArtists.map((artist) => (
                      <button
                        key={artist.id}
                        type="button"
                        onClick={() => removeArtist(artist.id)}
                        className="rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-2 text-sm font-bold text-lime-200"
                      >
                        {artist.name} ×
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Questions</span>
                  <select value={questionAmount} onChange={(event) => setQuestionAmount(Number(event.target.value))} className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 font-bold text-white">
                    <option value={5}>5 questions</option>
                    <option value={10}>10 questions</option>
                    <option value={15}>15 questions</option>
                    <option value={20}>20 questions</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Difficulty</span>
                  <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)} className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 font-bold text-white">
                    <option value="easy">Easy · full preview</option>
                    <option value="medium">Medium · 20 seconds</option>
                    <option value="hard">Hard · 10 seconds</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Answer mode</span>
                  <select value={answerMode} onChange={(event) => setAnswerMode(event.target.value as AnswerMode)} className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 font-bold text-white">
                    <option value="mcq">Multiple choice</option>
                    <option value="typed">Typing challenge</option>
                  </select>
                </label>

                {answerMode === 'typed' && (
                  <label className="grid gap-2">
                    <span className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Typed question type</span>
                    <select value={typedAnswerKind} onChange={(event) => setTypedAnswerKind(event.target.value as TypedAnswerKind)} className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 font-bold text-white">
                      <option value="song">Song title</option>
                      <option value="artist">Artist name</option>
                      <option value="album">Album name</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </label>
                )}
              </div>

              <button type="button" onClick={() => void createChallenge()} disabled={isCreating || selectedArtists.length === 0} className="mt-7 w-full rounded-full bg-lime-400 px-6 py-4 text-center text-lg font-black text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50">
                {isCreating ? 'Creating room...' : 'Create challenge room'}
              </button>

              {createdRoomCode && (
                <div className="mt-6 rounded-[1.5rem] border border-lime-400/30 bg-lime-400/10 p-5">
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-lime-300">Room created</p>
                  <p className="mt-2 text-4xl font-black">{createdRoomCode}</p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <a href={`/challenge/${createdRoomCode}`} className="rounded-full bg-white px-5 py-3 text-center font-black text-black transition hover:bg-zinc-200">
                      Open room
                    </a>

                    <button type="button" onClick={() => void copyChallengeLink()} className="rounded-full border border-white/15 px-5 py-3 font-black text-white transition hover:border-lime-400">
                      Copy link
                    </button>
                  </div>

                  <p className="mt-3 break-all text-sm text-zinc-400">{createdLink}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
