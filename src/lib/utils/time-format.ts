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

type RelativeTimeBucket =
  | { kind: "invalid" }
  | { kind: "just_now" }
  | { kind: "minutes"; count: number }
  | { kind: "hours"; count: number }
  | { kind: "days"; count: number }
  | { kind: "weeks"; count: number }
  | { kind: "months"; count: number }
  | { kind: "years"; count: number };

function getRelativeTimeBucket(
  dateInput: string | Date | number | undefined | null
): RelativeTimeBucket {
  if (dateInput == null || dateInput === "") return { kind: "invalid" };
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return { kind: "invalid" };

  const diffMs = Math.max(0, Date.now() - date.getTime());
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return { kind: "just_now" };
  if (diffMins < 60) return { kind: "minutes", count: diffMins };

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return { kind: "hours", count: diffHours };

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return { kind: "days", count: diffDays };
  if (diffDays < 30) return { kind: "weeks", count: Math.floor(diffDays / 7) };
  if (diffDays < 365) return { kind: "months", count: Math.floor(diffDays / 30) };
  return { kind: "years", count: Math.floor(diffDays / 365) };
}

/**
 * Compact relative time for dense UI (e.g. "5m ago", "2w ago", "1y ago").
 */
export function formatRelativeTimeCompact(
  dateInput: string | Date | number | undefined | null,
  fallback = "—"
): string {
  const bucket = getRelativeTimeBucket(dateInput);
  switch (bucket.kind) {
    case "invalid":
      return fallback;
    case "just_now":
      return "just now";
    case "minutes":
      return `${bucket.count}m ago`;
    case "hours":
      return `${bucket.count}h ago`;
    case "days":
      return `${bucket.count}d ago`;
    case "weeks":
      return `${bucket.count}w ago`;
    case "months":
      return `${bucket.count}mo ago`;
    case "years":
      return `${bucket.count}y ago`;
  }
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

/** Toast body for session resume — avoids awkward "from just now ago" phrasing. */
export function formatSessionResumeMessage(
  relativeTime: string,
  t: (key: string, options?: Record<string, string | number>) => string
): string {
  if (relativeTime === "just now") {
    return t("project.shell.sessionRestoredJustNow");
  }
  if (relativeTime === "yesterday") {
    return t("project.shell.sessionRestoredYesterday");
  }
  if (relativeTime === "recently") {
    return t("project.shell.sessionRestored");
  }
  return t("project.shell.sessionRestoredFromAgo", { time: relativeTime });
}

/** Relative time with an "ago" suffix (e.g. "5 minutes ago", "yesterday"). */
export function formatRelativeTimeAgoWithSuffix(
  dateInput: string | Date | number | undefined | null,
  t: (key: string, options?: Record<string, string | number>) => string,
  keyPrefix: string
): string {
  const relativeTime = formatRelativeTimeAgo(dateInput);
  if (relativeTime === "just now") {
    return t(`${keyPrefix}.justNow`);
  }
  if (relativeTime === "yesterday") {
    return t(`${keyPrefix}.yesterday`);
  }
  if (relativeTime === "recently") {
    return t(`${keyPrefix}.recently`);
  }
  return t(`${keyPrefix}.ago`, { time: relativeTime });
}

/**
 * Localized relative time using count-based keys under `keyPrefix`:
 * justNow, minutesAgo, hoursAgo, daysAgo, weeksAgo, monthsAgo, yearsAgo.
 */
export function formatRelativeTimeLocalized(
  dateInput: string | Date | number | undefined | null,
  t: (key: string, options?: Record<string, string | number>) => string,
  keyPrefix: string,
  fallback = "—"
): string {
  const bucket = getRelativeTimeBucket(dateInput);
  switch (bucket.kind) {
    case "invalid":
      return fallback;
    case "just_now":
      return t(`${keyPrefix}.justNow`);
    case "minutes":
      return t(`${keyPrefix}.minutesAgo`, { count: bucket.count });
    case "hours":
      return t(`${keyPrefix}.hoursAgo`, { count: bucket.count });
    case "days":
      return t(`${keyPrefix}.daysAgo`, { count: bucket.count });
    case "weeks":
      return t(`${keyPrefix}.weeksAgo`, { count: bucket.count });
    case "months":
      return t(`${keyPrefix}.monthsAgo`, { count: bucket.count });
    case "years":
      return t(`${keyPrefix}.yearsAgo`, { count: bucket.count });
  }
}
