"use client";

import { useI18n, locales, localeNames, type Locale } from "@/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="relative inline-block">
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="appearance-none bg-surface-raised text-text-primary border border-border-default rounded-lg px-2 py-1.5 pr-7 text-sm font-medium cursor-pointer hover:bg-surface-hover hover:border-border-strong transition-all focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary [color-scheme:dark]"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc} className="bg-surface-raised text-text-primary">
            {localeNames[loc].flag}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
