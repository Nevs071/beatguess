import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/language-provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import { PlayerProvider } from '@/lib/player-provider';
import { PlayerWidget } from '@/components/player-widget';
import { AuthAccountWidget } from '@/components/auth-account-widget';

export const metadata: Metadata = {
  title: 'BeatGuess',
  description: 'A music quiz game powered by audio previews.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <PlayerProvider>
            <LanguageSwitcher />
            <PlayerWidget />
            <AuthAccountWidget />
            {children}
          </PlayerProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}