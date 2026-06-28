'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/use-language';
import { usePlayer } from '@/lib/use-player';

export function PlayerWidget() {
  const { language } = useLanguage();
  const { player, saveGuestPlayer, clearPlayer } = usePlayer();
  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState('');

  const text = {
    en: {
      playAsGuest: 'Play as guest',
      playerProfile: 'Player profile',
      description: 'Save a guest name for this browser.',
      currentPlayer: 'Current player',
      guestMode: 'Guest mode',
      resetPlayer: 'Reset player',
      guestPlaceholder: 'Your guest name',
      continueAsGuest: 'Continue as guest',
      accountLater: 'Create account coming later',
      viewScores: 'View scores',
    },
    fr: {
      playAsGuest: 'Jouer en invité',
      playerProfile: 'Profil joueur',
      description: 'Sauvegarde un nom invité pour ce navigateur.',
      currentPlayer: 'Joueur actuel',
      guestMode: 'Mode invité',
      resetPlayer: 'Réinitialiser le joueur',
      guestPlaceholder: 'Ton nom invité',
      continueAsGuest: 'Continuer en invité',
      accountLater: 'Création de compte bientôt',
      viewScores: 'Voir les scores',
    },
    de: {
      playAsGuest: 'Als Gast spielen',
      playerProfile: 'Spielerprofil',
      description: 'Speichere einen Gastnamen für diesen Browser.',
      currentPlayer: 'Aktueller Spieler',
      guestMode: 'Gastmodus',
      resetPlayer: 'Spieler zurücksetzen',
      guestPlaceholder: 'Dein Gastname',
      continueAsGuest: 'Als Gast fortfahren',
      accountLater: 'Konto-Erstellung kommt später',
      viewScores: 'Punkte ansehen',
    },
  }[language];

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
          {player ? `👤 ${player.name}` : `👤 ${text.playAsGuest}`}
        </button>
      )}

      {isOpen && (
        <div className="w-[320px] rounded-3xl border border-zinc-800 bg-zinc-950 p-5 text-white shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">{text.playerProfile}</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {text.description}
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
              <p className="text-sm text-zinc-400">{text.currentPlayer}</p>
              <p className="mt-1 text-xl font-black text-lime-300">
                {player.name}
              </p>
              <p className="mt-1 text-sm text-zinc-500">{text.guestMode}</p>

              <div className="mt-4 flex flex-col gap-3">
                <a
                  href="/scores"
                  className="rounded-full bg-lime-400 px-4 py-2 text-center text-sm font-black text-black hover:bg-lime-300"
                >
                  {text.viewScores}
                </a>

                <button
                  type="button"
                  onClick={clearPlayer}
                  className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold text-white hover:border-red-400 hover:text-red-300"
                >
                  {text.resetPlayer}
                </button>
              </div>
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
                placeholder={text.guestPlaceholder}
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
              />

              <button
                type="button"
                onClick={submitGuestName}
                disabled={!guestName.trim()}
                className="mt-3 w-full rounded-2xl bg-lime-400 px-5 py-3 font-black text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {text.continueAsGuest}
              </button>

              <button
                type="button"
                disabled
                className="mt-3 w-full rounded-2xl border border-zinc-800 px-5 py-3 font-bold text-zinc-500"
              >
                {text.accountLater}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
