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

export const AMBIENT_BACKGROUND_STYLES = ["aurora", "mesh", "grid"] as const;

export type AmbientBackgroundStyle = (typeof AMBIENT_BACKGROUND_STYLES)[number];

export const DEFAULT_AMBIENT_BACKGROUND: AmbientBackgroundStyle = "aurora";
export const AMBIENT_BACKGROUND_STORAGE_KEY = "appearance:ambientBackground";

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

function readStoredStyle(): AmbientBackgroundStyle {
  if (typeof window === "undefined") {
    return DEFAULT_AMBIENT_BACKGROUND;
  }
  const stored = localStorage.getItem(AMBIENT_BACKGROUND_STORAGE_KEY);
  return isAmbientBackgroundStyle(stored) ? stored : DEFAULT_AMBIENT_BACKGROUND;
}

function applyDocumentStyle(style: AmbientBackgroundStyle) {
  document.documentElement.dataset.ambientBg = style;
}

export function AmbientBackgroundProvider({ children }: { children: ReactNode }) {
  const [style, setStyleState] = useState<AmbientBackgroundStyle>(DEFAULT_AMBIENT_BACKGROUND);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const next = readStoredStyle();
    applyDocumentStyle(next);
    setTimeout(() => {
      setStyleState(next);
      setHydrated(true);
    }, 0);
  }, []);

  const setStyle = useCallback((next: AmbientBackgroundStyle) => {
    setStyleState(next);
    localStorage.setItem(AMBIENT_BACKGROUND_STORAGE_KEY, next);
    applyDocumentStyle(next);
  }, []);

  const value = useMemo(
    () => ({
      style: hydrated ? style : DEFAULT_AMBIENT_BACKGROUND,
      setStyle,
    }),
    [hydrated, style, setStyle]
  );

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
