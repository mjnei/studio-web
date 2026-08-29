import { ApiError } from "@/lib/api-client";

/** Tracks projects we've already shown a not-found toast for (survives remounts / Strict Mode). */
const notifiedProjectIds = new Set<string>();
const redirectTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function isProjectNotFoundError(error: unknown): boolean {
  if (error instanceof ApiError && error.status === 404) {
    return true;
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof (error as { message?: string })?.message === "string"
        ? (error as { message: string }).message
        : "";

  if ((error as { status?: number })?.status === 404) {
    return true;
  }

  const normalized = message.toLowerCase();
  return normalized.includes("not found") || normalized.includes("project not found");
}

/**
 * Show a single project-not-found toast per project ID and schedule one redirect.
 * Safe to call from multiple components (e.g. shell + step pages) without duplicate toasts.
 */
export function notifyProjectNotFound(
  projectId: string,
  showError: (title: string, description: string) => void,
  title: string,
  description: string,
  redirect: () => void,
  redirectDelayMs = 2000
): void {
  if (!projectId || notifiedProjectIds.has(projectId)) {
    return;
  }

  notifiedProjectIds.add(projectId);
  showError(title, description);

  const existingTimer = redirectTimers.get(projectId);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(() => {
    redirectTimers.delete(projectId);
    redirect();
  }, redirectDelayMs);

  redirectTimers.set(projectId, timer);
}
