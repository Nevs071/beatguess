'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/use-language';

type Auth0User = {
  name?: string;
  email?: string;
  picture?: string;
};

export function AuthAccountWidget() {
  const { language } = useLanguage();
  const [user, setUser] = useState<Auth0User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const text = {
    en: {
      signIn: 'Sign in',
      logout: 'Logout',
      account: 'Account',
    },
    fr: {
      signIn: 'Connexion',
      logout: 'Déconnexion',
      account: 'Compte',
    },
    de: {
      signIn: 'Anmelden',
      logout: 'Abmelden',
      account: 'Konto',
    },
  }[language];

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch('/auth/profile');

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = (await response.json()) as Auth0User;
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return (
      <a
        href="/auth/login"
        className="fixed bottom-20 right-4 z-50 rounded-full border border-lime-400/40 bg-lime-400 px-4 py-3 text-sm font-black text-black shadow-2xl transition hover:bg-lime-300"
      >
        {text.signIn}
      </a>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 flex max-w-[280px] items-center gap-3 rounded-full border border-white/10 bg-black/85 px-4 py-3 text-white shadow-2xl backdrop-blur-xl">
      <a href="/account" className="shrink-0">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name ?? user.email ?? text.account}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-400 text-sm font-black text-black">
            U
          </div>
        )}
      </a>

      <div className="min-w-0 flex-1">
        <a href="/account" className="block truncate text-sm font-black hover:text-lime-300">
          {user.name ?? user.email ?? text.account}
        </a>

        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
          <a href="/account" className="hover:text-lime-300">
            {text.account}
          </a>
          <span>·</span>
          <a href="/auth/logout" className="hover:text-red-300">
            {text.logout}
          </a>
        </div>
      </div>
    </div>
  );
}
