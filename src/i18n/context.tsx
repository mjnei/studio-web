"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, defaultLocale, normalizeLocale, resolveStoredLocale } from "./config";

type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = { [key: string]: TranslationValue };
export type InterpolationValues = Record<string, string | number | boolean>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, options?: InterpolationValues) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translationFiles = [
  "common",
  "auth",
  "onboarding",
  "dashboard",
  "projects",
  "project",
  "jobs",
  "voices",
  "settings",
  "shell",
  "profile",
  "help",
  "pricing",
  "billing",
  "referral",
  "notifications",
  "movies",
] as const;

const translationsCache: Record<Locale, Translations> = {} as Record<Locale, Translations>;

function deepMerge(target: Translations, source: Translations): Translations {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = result[key];
    if (
      typeof sourceVal === "object" &&
      sourceVal !== null &&
      typeof targetVal === "object" &&
      targetVal !== null
    ) {
      result[key] = deepMerge(targetVal as Translations, sourceVal as Translations);
    } else {
      result[key] = sourceVal;
    }
  }
  return result;
}

async function loadTranslations(locale: Locale): Promise<Translations> {
  if (translationsCache[locale]) {
    return translationsCache[locale];
  }

  try {
    const results = await Promise.all(
      translationFiles.map(async (file) => {
        const response = await fetch(
          `/locales/${encodeURIComponent(locale)}/${encodeURIComponent(file)}.json`
        );
        if (!response.ok) {
          return {} as Translations;
        }
        return response.json() as Promise<Translations>;
      })
    );
    const translations = results.reduce((acc, cur) => deepMerge(acc, cur), {} as Translations);
    translationsCache[locale] = translations;
    return translations;
  } catch (error) {
    console.error(`Error loading translations for ${locale}:`, error);
    if (locale !== defaultLocale) {
      return loadTranslations(defaultLocale);
    }
    return {};
  }
}

function getNestedValue(obj: Translations, path: string): string | undefined {
  const keys = path.split(".");
  let current: TranslationValue = obj;

  for (const key of keys) {
    if (typeof current === "string") {
      return undefined;
    }
    current = current[key];
    if (current === undefined) {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}

function replacePlaceholders(template: string, options?: InterpolationValues): string {
  if (!options) {
    return template;
  }

  // Replace all {key} patterns with corresponding option values
  return template.replace(/{(\w+)}/g, (match, key) => {
    if (key in options) {
      const value = options[key];
      return String(value);
    }
    // If placeholder not found in options, preserve the placeholder
    return match;
  });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    const rawLocale = localStorage.getItem("locale");
    const savedLocale = resolveStoredLocale(rawLocale);
    if (!savedLocale) return;

    if (rawLocale !== savedLocale) {
      localStorage.setItem("locale", savedLocale);
    }

    setTimeout(() => {
      setLocaleState(savedLocale);
    }, 0);
  }, []);

  useEffect(() => {
    loadTranslations(locale).then(setTranslations);
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    const normalized = normalizeLocale(newLocale) ?? defaultLocale;
    setLocaleState(normalized);
    localStorage.setItem("locale", normalized);
  };

  const t = (key: string, options?: InterpolationValues): string => {
    const value = getNestedValue(translations, key);
    let translationString = value;

    if (translationString === undefined) {
      if (locale !== defaultLocale) {
        const defaultValue = getNestedValue(translationsCache[defaultLocale] || {}, key);
        if (defaultValue !== undefined) {
          translationString = defaultValue;
        }
      }
    }

    if (translationString === undefined) {
      translationString = key;
    }

    // Apply placeholder replacement if options provided
    return replacePlaceholders(translationString, options);
  };

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
