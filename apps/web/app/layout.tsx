import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/language-provider';
import { LanguageSwitcher } from '@/components/language-switcher';

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
          <LanguageSwitcher />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}