/** Supported languages (UI, voices, catalog, TTS). */
export const locales = ["en", "zh-CN", "zh-TW"] as const;
export type Locale = (typeof locales)[number];

/** @deprecated Use {@link Locale} — voice/catalog codes are the same as UI locales. */
export type VoiceLanguage = Locale;

export const localeNames: Record<Locale, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇺🇸" },
  "zh-CN": { name: "简体中文", flag: "简" },
  "zh-TW": { name: "繁體中文", flag: "繁" },
};

/** English display names for language codes (admin + filename UX). */
export const voiceLanguageNames: Record<Locale, string> = {
  en: "English",
  "zh-CN": "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
};

export const defaultLocale: Locale = "en";

/** voices.languages.* translation key suffix for each locale. */
export const voiceLanguageLabelKey: Record<Locale, string> = {
  en: "en",
  "zh-CN": "zhCN",
  "zh-TW": "zhTW",
};

/** Locale → BCP 47 tag for `Intl` / `toLocaleDateString`. */
export const localeToDateLocale: Record<Locale, string> = {
  en: "en-US",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
};

const LOCALE_BY_LOWER = new Map<string, Locale>(
  locales.map((locale) => [locale.toLowerCase(), locale])
);

/** Input aliases → canonical locale (aligned with backend LOCALE_ALIASES). */
const LOCALE_ALIASES: Record<string, Locale> = {
  zh: "zh-CN",
  "en-us": "en",
  "en-gb": "en",
};

/**
 * Normalize any locale input to a supported locale.
 * Mirrors backend `normalize_locale()` but returns null when unrecognized.
 * Script tags (zh-Hans / zh-Hant) are not accepted — use zh-CN / zh-TW.
 */
export function normalizeLocale(input: string | null | undefined): Locale | null {
  if (!input?.trim()) return null;

  const normalized = input.trim().replace(/_/g, "-");
  if (locales.includes(normalized as Locale)) {
    return normalized as Locale;
  }

  const lower = normalized.toLowerCase();

  const caseMatch = LOCALE_BY_LOWER.get(lower);
  if (caseMatch) {
    return caseMatch;
  }

  const aliasMatch = LOCALE_ALIASES[lower];
  if (aliasMatch) {
    return aliasMatch;
  }

  // Regional variants of single-tag locales only (e.g. en-US → en).
  // Multi-tag Chinese forms like zh-Hans / zh-Hant are not accepted.
  const language = lower.split("-")[0];
  if (language === "zh") {
    return null;
  }

  for (const locale of locales) {
    if (!locale.includes("-") && locale.toLowerCase() === language) {
      return locale;
    }
  }

  return null;
}

/** Resolve a raw localStorage locale value to a supported UI locale. */
export function resolveStoredLocale(raw: string | null | undefined): Locale | null {
  return normalizeLocale(raw);
}

/** Normalize any language input to a supported locale (voices / catalog / TTS). */
export function normalizeVoiceLanguage(
  language: string | null | undefined
): Locale | null {
  return normalizeLocale(language);
}

/** Translation key for a voice language code (BCP-47 canonical set only). */
export function getVoiceLanguageTranslationKey(language: string | null | undefined): string | null {
  if (!language) return null;

  const locale = normalizeLocale(language);
  if (!locale) return null;

  return `voices.languages.${voiceLanguageLabelKey[locale]}`;
}

export function getDateLocale(locale: Locale): string {
  return localeToDateLocale[locale] ?? "en-US";
}

export function isChineseLocale(locale: Locale): boolean {
  return locale === "zh-CN" || locale === "zh-TW";
}

/** BCP-47 language for TTS job metadata — prefer voice language, else UI locale. */
export function resolveTtsLanguage(
  voiceLanguage: string | null | undefined,
  uiLocale: Locale = defaultLocale
): Locale {
  return normalizeLocale(voiceLanguage) ?? uiLocale;
}
