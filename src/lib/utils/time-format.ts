/**
 * Time formatting utilities
 */

/**
 * Format seconds into human-readable wait time
 * @param seconds - Number of seconds
 * @returns Formatted string (e.g., "30 seconds", "1m 26s", "5 minutes")
 */
export function formatWaitTime(seconds: number): string {
  if (seconds < 10) {
    return "Starting soon";
  } else if (seconds < 60) {
    return `~${Math.round(seconds)} seconds`;
  } else if (seconds < 120) {
    const remainingSeconds = Math.round(seconds % 60);
    return remainingSeconds > 0 ? `~1m ${remainingSeconds}s` : "~1 minute";
  } else {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return remainingSeconds > 0
      ? `~${minutes}m ${remainingSeconds}s`
      : `~${minutes} minutes`;
  }
}

/**
 * Format seconds into a short time display
 * @param seconds - Number of seconds
 * @returns Short formatted string (e.g., "1:26", "5:00")
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
