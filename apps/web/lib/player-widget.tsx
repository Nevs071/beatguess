'use client';

import { useState } from 'react';
import { usePlayer } from '@/lib/use-player';

export function PlayerWidget() {
  const { player, saveGuestPlayer, clearPlayer } = usePlayer();
  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState('');

  function submitGuestName() {
    if (!guestName.trim()) {
      return;
    }

    saveGuestPlayer(guestName);
    setGuestName('');
    setIsOpen(false);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full border border-zinc-800 bg-black/90 px-4 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur transition hover:border-lime-400 hover:text-lime-300"
        >
          {player ? `👤 ${player.name}` : '👤 Play as guest'}
        </button>
      )}

      {isOpen && (
        <div className="w-[320px] rounded-3xl border border-zinc-800 bg-zinc-950 p-5 text-white shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Player profile</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Save a guest name for this browser.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-white"
            >
              ×
            </button>
          </div>

          {player ? (
            <div className="mt-5 rounded-2xl border border-lime-400/30 bg-lime-400/10 p-4">
              <p className="text-sm text-zinc-400">Current player</p>
              <p className="mt-1 text-xl font-black text-lime-300">
                {player.name}
              </p>
              <p className="mt-1 text-sm text-zinc-500">Guest mode</p>

              <button
                type="button"
                onClick={clearPlayer}
                className="mt-4 rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold text-white hover:border-red-400 hover:text-red-300"
              >
                Reset player
              </button>
            </div>
          ) : (
            <div className="mt-5">
              <input
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    submitGuestName();
                  }
                }}
                placeholder="Your guest name"
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
              />

              <button
                type="button"
                onClick={submitGuestName}
                disabled={!guestName.trim()}
                className="mt-3 w-full rounded-2xl bg-lime-400 px-5 py-3 font-black text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue as guest
              </button>

              <button
                type="button"
                disabled
                className="mt-3 w-full rounded-2xl border border-zinc-800 px-5 py-3 font-bold text-zinc-500"
              >
                Create account coming later
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}