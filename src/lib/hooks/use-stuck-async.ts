"use client";

import { useCallback, useEffect, useState } from "react";

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Returns true when `isActive` has been continuously true for longer than `timeoutMs`.
 * Call `reset()` after a retry to restart the timer while still active.
 *
 * Pass `activityKey` when "making progress" should defer the timeout (e.g. poll returns
 * updated job status). The timer restarts whenever `activityKey` changes while active.
 */
export function useStuckAsync(
  isActive: boolean,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  activityKey?: string
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

    setIsStuck(false); // progress detected (activityKey changed) or explicit reset — restart clean
    const timer = window.setTimeout(() => setIsStuck(true), timeoutMs);
    return () => window.clearTimeout(timer);
  }, [isActive, timeoutMs, generation, activityKey]);

  return { isStuck, reset };
}
