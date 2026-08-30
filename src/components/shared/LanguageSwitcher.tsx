"use client";

import { ChevronDown } from "lucide-react";
import { useI18n, locales, localeNames, getApiLocale, type Locale } from "@/i18n";
import { updateUser } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

interface LanguageSwitcherProps {
  /** On small screens, show only the locale symbol in the closed control (top nav). */
  compactOnSmallScreens?: boolean;
}

export function LanguageSwitcher({ compactOnSmallScreens = false }: LanguageSwitcherProps) {
  const { locale, setLocale } = useI18n();
  const { isAuthenticated } = useAuth();

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    if (isAuthenticated) {
      void updateUser({ locale: getApiLocale(newLocale) });
    }
  };

  return (
    <div className="relative inline-block">
      <select
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value as Locale)}
        aria-label={localeNames[locale].name}
        className={`appearance-none bg-surface-raised text-text-primary border border-border-default rounded-lg h-9 px-2.5 pr-7 text-body font-medium cursor-pointer hover:bg-surface-hover hover:border-border-strong transition-all focus:border-accent-primary focus-ring [color-scheme:dark] ${
          compactOnSmallScreens ? "max-md:text-transparent max-md:w-11 max-md:px-2" : ""
        }`}
      >
        {locales.map((loc) => (
          <option key={loc} value={loc} className="bg-surface-raised text-text-primary">
            {localeNames[loc].flag} {localeNames[loc].name}
          </option>
        ))}
      </select>
      {compactOnSmallScreens && (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-body leading-none md:hidden"
          aria-hidden
        >
          {localeNames[locale].flag}
        </div>
      )}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
        <ChevronDown className="h-4 w-4" aria-hidden />
      </div>
    </div>
  );
}
