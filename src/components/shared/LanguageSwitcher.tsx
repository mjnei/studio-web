"use client";

import { useI18n, locales, localeNames, type Locale } from "@/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="relative inline-block">
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="appearance-none bg-surface-secondary text-text-primary border border-border-primary rounded-md px-3 py-2 pr-8 text-sm font-medium cursor-pointer hover:bg-surface-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc].flag} {localeNames[loc].name}
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
