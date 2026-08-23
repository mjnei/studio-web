"use client";

import { ChevronDown } from "lucide-react";
import { useI18n, locales, localeNames, type Locale } from "@/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="relative inline-block">
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="appearance-none bg-surface-raised text-text-primary border border-border-default rounded-lg px-2 py-1.5 pr-7 text-body font-medium cursor-pointer hover:bg-surface-hover hover:border-border-strong transition-all focus:border-accent-primary focus-ring [color-scheme:dark]"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc} className="bg-surface-raised text-text-primary">
            {localeNames[loc].flag} {localeNames[loc].name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
        <ChevronDown className="h-4 w-4" aria-hidden />
      </div>
    </div>
  );
}
