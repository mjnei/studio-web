export const locales = ["en", "zh-CN", "zh-TW", "ja", "ko", "de", "fr", "es"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇺🇸" },
  es: { name: "Español", flag: "🇪🇸" },
  fr: { name: "Français", flag: "🇫🇷" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  ko: { name: "한국어", flag: "🇰🇷" },
  ja: { name: "日本語", flag: "🇯🇵" },
  "zh-CN": { name: "简体中文", flag: "简" },
  "zh-TW": { name: "繁體中文", flag: "繁" },
};

export const defaultLocale: Locale = "en";

/** voices.languages.* translation key suffix for each locale. */
export const voiceLanguageLabelKey: Record<Locale, string> = {
  en: "en",
  "zh-CN": "zhCN",
  "zh-TW": "zhTW",
  ja: "ja",
  ko: "ko",
  de: "de",
  fr: "fr",
  es: "es",
};

/** Locale → BCP 47 tag for `Intl` / `toLocaleDateString`. */
export const localeToDateLocale: Record<Locale, string> = {
  en: "en-US",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
  ja: "ja-JP",
  ko: "ko-KR",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
};

const LOCALE_BY_LOWER = new Map<string, Locale>(
  locales.map((locale) => [locale.toLowerCase(), locale])
);

/**
 * Normalize any locale input to a supported BCP-47 code.
 * Mirrors backend `normalize_locale()` but returns null when unrecognized.
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

  if (lower.startsWith("zh")) {
    if (lower.includes("hant") || lower === "zh-tw") {
      return "zh-TW";
    }
    return "zh-CN";
  }

  const language = lower.split("-")[0];
  for (const locale of locales) {
    if (locale.split("-")[0].toLowerCase() === language) {
      return locale;
    }
  }

  return null;
}

/** Resolve a raw localStorage locale value to a supported locale. */
export function resolveStoredLocale(raw: string | null | undefined): Locale | null {
  return normalizeLocale(raw);
}

/** Normalize any language input to a supported locale code. */
export function normalizeVoiceLanguage(language: string | null | undefined): Locale | null {
  return normalizeLocale(language);
}

/** Translation key for a voice language code (BCP-47 canonical set only). */
export function getVoiceLanguageTranslationKey(language: string | null | undefined): string | null {
  if (!language) return null;

  const voiceLocale = normalizeVoiceLanguage(language);
  if (!voiceLocale) return null;

  return `voices.languages.${voiceLanguageLabelKey[voiceLocale]}`;
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
  return normalizeVoiceLanguage(voiceLanguage) ?? uiLocale;
}
