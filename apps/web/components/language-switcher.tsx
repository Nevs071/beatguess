'use client';

import { languageLabels, type Language } from '@/lib/i18n';
import { useLanguage } from '@/lib/use-language';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-1 rounded-full border border-zinc-800 bg-black/80 p-1 shadow-2xl backdrop-blur">
      {(['en', 'fr', 'de'] as Language[]).map((nextLanguage) => (
        <button
          key={nextLanguage}
          type="button"
          onClick={() => setLanguage(nextLanguage)}
          className={`rounded-full px-3 py-2 text-xs font-bold transition ${
            language === nextLanguage
              ? 'bg-lime-400 text-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {languageLabels[nextLanguage]}
        </button>
      ))}
    </div>
  );
}