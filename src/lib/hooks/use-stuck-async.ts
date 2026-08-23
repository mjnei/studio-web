"use client";

import { useCallback, useEffect, useState } from "react";

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Returns true when `isActive` has been continuously true for longer than `timeoutMs`.
 * Call `reset()` after a retry to restart the timer while still active.
 */
export function useStuckAsync(
  isActive: boolean,
  timeoutMs = DEFAULT_TIMEOUT_MS
): { isStuck: boolean; reset: () => void } {
  const [isStuck, setIsStuck] = useState(false);
  const [generation, setGeneration] = useState(0);

  const reset = useCallback(() => {
    setIsStuck(false);
    setGeneration((g) => g + 1);
  }, []);

  useEffect(() => {
    if (!isActive) {
      setIsStuck(false);
      return;
    }

    const timer = window.setTimeout(() => setIsStuck(true), timeoutMs);
    return () => window.clearTimeout(timer);
  }, [isActive, timeoutMs, generation]);

  return { isStuck, reset };
}
