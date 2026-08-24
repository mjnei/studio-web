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
    return "Ready soon";
  } else if (seconds < 60) {
    return `~${Math.round(seconds)} seconds`;
  } else if (seconds < 120) {
    const remainingSeconds = Math.round(seconds % 60);
    return remainingSeconds > 0 ? `~1m ${remainingSeconds}s` : "~1 minute";
  } else {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return remainingSeconds > 0 ? `~${minutes}m ${remainingSeconds}s` : `~${minutes} minutes`;
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

/**
 * Format timestamp into human-readable relative time (e.g. "5 minutes", "2 hours", "yesterday")
 */
export function formatRelativeTimeAgo(
  dateInput: string | Date | number | undefined | null
): string {
  if (!dateInput) return "recently";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "recently";

  const now = Date.now();
  const diffSeconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));

  if (diffSeconds < 60) {
    return "just now";
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? "1 minute" : `${diffMinutes} minutes`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? "1 hour" : `${diffHours} hours`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return "yesterday";
  }
  if (diffDays < 30) {
    return `${diffDays} days`;
  }
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return diffMonths === 1 ? "1 month" : `${diffMonths} months`;
  }
  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? "1 year" : `${diffYears} years`;
}
