import {
  voiceLanguages,
  normalizeVoiceLanguage,
  type VoiceLanguage,
} from "@/i18n";

export interface ParsedVoiceFilename {
  language: VoiceLanguage;
  name: string;
  /** True when a recognized locale prefix was found in the filename. */
  hasLocalePrefix: boolean;
}

/**
 * Parse bulk-upload filename stem into language + voice name.
 * Mirrors backend ``parse_voice_filename``.
 *
 * Examples:
 * - ``en Male 1.wav`` → language=en, name=Male 1
 * - ``zh-TW Mao.mp3`` → language=zh-TW, name=Mao
 */
export function parseVoiceFilename(filename: string): ParsedVoiceFilename {
  const stem = filename.replace(/\.[^/.]+$/, "").trim();
  if (!stem) {
    return { language: "en", name: "unnamed", hasLocalePrefix: false };
  }

  const spaceIdx = stem.search(/\s/);
  if (spaceIdx > 0) {
    const token = stem.slice(0, spaceIdx);
    const rest = stem.slice(spaceIdx).trim();
    const locale = normalizeVoiceLanguage(token);
    // Only treat as locale prefix when token itself is a known locale/alias,
    // not when normalize fell through via language-prefix heuristics on
    // arbitrary words. Match backend match_locale_token by checking exact locals.
    if (rest && isKnownLocaleToken(token) && locale) {
      return { language: locale, name: rest, hasLocalePrefix: true };
    }
  }

  return { language: "en", name: stem, hasLocalePrefix: false };
}

function isKnownLocaleToken(token: string): boolean {
  const normalized = token.trim().replace(/_/g, "-");
  if (!normalized) return false;
  const lower = normalized.toLowerCase();

  if (voiceLanguages.some((locale) => locale.toLowerCase() === lower)) {
    return true;
  }

  // Aliases aligned with backend LOCALE_ALIASES
  const aliases: Record<string, VoiceLanguage> = {
    zh: "zh-CN",
    "zh-hans": "zh-CN",
    "zh-hant": "zh-TW",
    "en-us": "en",
    "en-gb": "en",
    "es-es": "es",
    "es-mx": "es",
    "fr-fr": "fr",
    "de-de": "de",
    "ja-jp": "ja",
    "ko-kr": "ko",
  };
  return lower in aliases;
}
