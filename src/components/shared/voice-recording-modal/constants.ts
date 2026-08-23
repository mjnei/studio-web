export const MAX_DURATION_S = 60;

export const RECORDING_TIMER_INTERVAL_MS = 200;

export const AUTO_PLAY_DELAY_MS = 300;

export const SUPPORTED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
] as const;

export const RECORDING_LANGUAGES = [
  { code: "en" },
  { code: "es" },
  { code: "fr" },
  { code: "de" },
  { code: "ja" },
  { code: "ko" },
  { code: "zh" },
  { code: "pt" },
  { code: "it" },
  { code: "ru" },
] as const;

const VOICE_NAME_ADJECTIVES = [
  "amber",
  "azure",
  "bronze",
  "coral",
  "crimson",
  "cyan",
  "emerald",
  "golden",
  "indigo",
  "jade",
  "lavender",
  "magenta",
  "navy",
  "olive",
  "pearl",
  "ruby",
  "sapphire",
  "silver",
  "topaz",
  "violet",
] as const;

const VOICE_NAME_NOUNS = [
  "dolphin",
  "eagle",
  "falcon",
  "hawk",
  "lion",
  "owl",
  "panther",
  "phoenix",
  "raven",
  "tiger",
  "wolf",
  "bear",
  "fox",
  "lynx",
  "otter",
  "seal",
  "whale",
  "cobra",
  "dragon",
  "gryphon",
] as const;

export { VOICE_NAME_ADJECTIVES, VOICE_NAME_NOUNS };
