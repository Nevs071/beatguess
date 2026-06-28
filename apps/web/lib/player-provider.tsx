'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const PLAYER_STORAGE_KEY = 'beatguess-player';

type Player = {
  name: string;
  mode: 'guest';
};

type PlayerContextValue = {
  player: Player | null;
  saveGuestPlayer: (name: string) => void;
  clearPlayer: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const storedPlayer = localStorage.getItem(PLAYER_STORAGE_KEY);

    if (!storedPlayer) {
      return;
    }

    try {
      const parsedPlayer = JSON.parse(storedPlayer) as Player;

      if (parsedPlayer?.name && parsedPlayer?.mode === 'guest') {
        setPlayer(parsedPlayer);
      }
    } catch {
      localStorage.removeItem(PLAYER_STORAGE_KEY);
    }
  }, []);

  function saveGuestPlayer(name: string) {
    const cleanName = name.trim();

    if (!cleanName) {
      return;
    }

    const nextPlayer: Player = {
      name: cleanName,
      mode: 'guest',
    };

    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(nextPlayer));
    setPlayer(nextPlayer);
  }

  function clearPlayer() {
    localStorage.removeItem(PLAYER_STORAGE_KEY);
    setPlayer(null);
  }

  const value = useMemo(
    () => ({
      player,
      saveGuestPlayer,
      clearPlayer,
    }),
    [player],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error('usePlayer must be used inside PlayerProvider');
  }

  return context;
}