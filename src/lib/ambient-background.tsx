"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AMBIENT_BACKGROUND_COOKIE,
  AMBIENT_BACKGROUND_STORAGE_KEY,
  AMBIENT_BACKGROUND_STYLES,
  DEFAULT_AMBIENT_BACKGROUND,
  parseAmbientBackgroundStyle,
  serializeAmbientBackgroundCookie,
  type AmbientBackgroundStyle,
} from "@/lib/ambient-background-shared";

export {
  AMBIENT_BACKGROUND_STYLES,
  AMBIENT_BACKGROUND_STORAGE_KEY,
  AMBIENT_BACKGROUND_COOKIE,
  AMBIENT_BACKGROUND_COOKIE_MAX_AGE,
  DEFAULT_AMBIENT_BACKGROUND,
  parseAmbientBackgroundStyle,
  serializeAmbientBackgroundCookie,
  type AmbientBackgroundStyle,
} from "@/lib/ambient-background-shared";

type AmbientBackgroundContextValue = {
  style: AmbientBackgroundStyle;
  setStyle: (style: AmbientBackgroundStyle) => void;
};

const AmbientBackgroundContext = createContext<AmbientBackgroundContextValue | undefined>(
  undefined
);

function isAmbientBackgroundStyle(value: string | null): value is AmbientBackgroundStyle {
  return value !== null && (AMBIENT_BACKGROUND_STYLES as readonly string[]).includes(value);
}

function applyDocumentStyle(style: AmbientBackgroundStyle) {
  document.documentElement.dataset.ambientBg = style;
}

function readLocalStorageStyle(): AmbientBackgroundStyle | null {
  const stored = localStorage.getItem(AMBIENT_BACKGROUND_STORAGE_KEY);
  return isAmbientBackgroundStyle(stored) ? stored : null;
}

function readCookieStyle(): AmbientBackgroundStyle | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${AMBIENT_BACKGROUND_COOKIE}=([^;]*)`)
  );
  if (!match) return null;
  const raw = decodeURIComponent(match[1]);
  return isAmbientBackgroundStyle(raw) ? raw : null;
}

function persistTheme(style: AmbientBackgroundStyle) {
  document.cookie = serializeAmbientBackgroundCookie(style);
  localStorage.setItem(AMBIENT_BACKGROUND_STORAGE_KEY, style);
  applyDocumentStyle(style);
}

export function AmbientBackgroundProvider({
  children,
  initialStyle = DEFAULT_AMBIENT_BACKGROUND,
}: {
  children: ReactNode;
  /** From SSR cookie so first paint matches React state (no theme flash). */
  initialStyle?: AmbientBackgroundStyle;
}) {
  const [style, setStyleState] = useState<AmbientBackgroundStyle>(initialStyle);

  useEffect(() => {
    const fromCookie = readCookieStyle();
    const fromStorage = readLocalStorageStyle();

    let next = initialStyle;

    if (!fromCookie && fromStorage) {
      // Pre-cookie installs: promote localStorage → cookie for future SSR
      next = fromStorage;
      persistTheme(next);
    } else if (fromCookie) {
      next = fromCookie;
      // Keep localStorage aligned for cross-tab `storage` events
      localStorage.setItem(AMBIENT_BACKGROUND_STORAGE_KEY, next);
      applyDocumentStyle(next);
    } else {
      applyDocumentStyle(next);
    }

    // Defer React state when client storage differs from SSR (migration path).
    // Avoids react-hooks/set-state-in-effect cascading-render lint.
    let timer: number | undefined;
    if (next !== initialStyle) {
      timer = window.setTimeout(() => setStyleState(next), 0);
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== AMBIENT_BACKGROUND_STORAGE_KEY) return;
      const nextStyle = parseAmbientBackgroundStyle(event.newValue);
      setStyleState(nextStyle);
      document.cookie = serializeAmbientBackgroundCookie(nextStyle);
      applyDocumentStyle(nextStyle);
    };

    window.addEventListener("storage", onStorage);
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
    };
  }, [initialStyle]);

  const setStyle = useCallback((next: AmbientBackgroundStyle) => {
    setStyleState(next);
    persistTheme(next);
  }, []);

  const value = useMemo(() => ({ style, setStyle }), [style, setStyle]);

  return (
    <AmbientBackgroundContext.Provider value={value}>{children}</AmbientBackgroundContext.Provider>
  );
}

export function useAmbientBackground(): AmbientBackgroundContextValue {
  const ctx = useContext(AmbientBackgroundContext);
  if (!ctx) {
    throw new Error("useAmbientBackground must be used within AmbientBackgroundProvider");
  }
  return ctx;
}
