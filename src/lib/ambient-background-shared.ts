/**
 * Server-safe ambient theme helpers (no DOM / localStorage).
 * Used by RootLayout (SSR cookie) and the client provider.
 */

export const AMBIENT_BACKGROUND_STYLES = ["aurora", "mesh", "grid"] as const;

export type AmbientBackgroundStyle = (typeof AMBIENT_BACKGROUND_STYLES)[number];

export const DEFAULT_AMBIENT_BACKGROUND: AmbientBackgroundStyle = "aurora";

/** localStorage key (cross-tab sync + migration from pre-cookie installs) */
export const AMBIENT_BACKGROUND_STORAGE_KEY = "appearance:ambientBackground";

/** Cookie name for SSR `data-ambient-bg` on first paint */
export const AMBIENT_BACKGROUND_COOKIE = "ambient-bg";

/** 1 year */
export const AMBIENT_BACKGROUND_COOKIE_MAX_AGE = 31536000;

export function parseAmbientBackgroundStyle(
  value: string | undefined | null
): AmbientBackgroundStyle {
  if (value && (AMBIENT_BACKGROUND_STYLES as readonly string[]).includes(value)) {
    return value as AmbientBackgroundStyle;
  }
  return DEFAULT_AMBIENT_BACKGROUND;
}

/** Cookie string for `document.cookie` (Path=/, Max-Age=1y, SameSite=Lax) */
export function serializeAmbientBackgroundCookie(style: AmbientBackgroundStyle): string {
  return `${AMBIENT_BACKGROUND_COOKIE}=${style}; path=/; max-age=${AMBIENT_BACKGROUND_COOKIE_MAX_AGE}; SameSite=Lax`;
}
