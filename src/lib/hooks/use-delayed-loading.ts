"use client";

import { useEffect, useState } from "react";

const DEFAULT_DELAY_MS = 150;

/**
 * Delays showing a loading indicator until loading has persisted past `delayMs`.
 * Avoids a flash of loading state (FOLS) on fast cached responses.
 */
export function useDelayedLoading(isLoading: boolean, delayMs = DEFAULT_DELAY_MS): boolean {
  const [pastDelay, setPastDelay] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const timer = window.setTimeout(() => setPastDelay(true), delayMs);
    return () => {
      window.clearTimeout(timer);
      setPastDelay(false);
    };
  }, [isLoading, delayMs]);

  return isLoading && pastDelay;
}
