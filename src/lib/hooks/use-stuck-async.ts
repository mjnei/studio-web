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
  const [generation, setGeneration] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const sessionKey = `${isActive}:${generation}:${activityKey ?? ""}:${timeoutMs}`;
  const [activeSession, setActiveSession] = useState(sessionKey);

  if (sessionKey !== activeSession) {
    setActiveSession(sessionKey);
    if (timedOut) {
      setTimedOut(false);
    }
  }

  const reset = useCallback(() => {
    setTimedOut(false);
    setGeneration((g) => g + 1);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const timer = window.setTimeout(() => setTimedOut(true), timeoutMs);
    return () => window.clearTimeout(timer);
  }, [isActive, timeoutMs, generation, activityKey]);

  return { isStuck: isActive && timedOut, reset };
}
