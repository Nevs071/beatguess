'use client';

import { languageLabels, type Language } from '@/lib/i18n';
import { useLanguage } from '@/lib/use-language';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed left-1/2 top-3 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-zinc-800 bg-black/85 p-1 shadow-2xl backdrop-blur md:left-auto md:right-4 md:top-4 md:translate-x-0">
      {(['en', 'fr', 'de'] as Language[]).map((nextLanguage) => (
        <button
          key={nextLanguage}
          type="button"
          onClick={() => setLanguage(nextLanguage)}
          className={`rounded-full px-3 py-2 text-xs font-black transition md:px-4 ${
            language === nextLanguage
              ? 'bg-lime-400 text-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span className="md:hidden">{nextLanguage.toUpperCase()}</span>
          <span className="hidden md:inline">
            {languageLabels[nextLanguage]}
          </span>
        </button>
      ))}
    </div>
  );
}