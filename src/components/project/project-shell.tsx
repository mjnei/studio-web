"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, PanelLeft, Sparkles } from "lucide-react";
import { DrawerContent } from "@/components/shell/drawer-content";
import { useSidebar } from "@/components/shell/sidebar-context";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { CreditStatus } from "@/components/credits/CreditStatus";
import { useToast } from "@/components/ui/toast";
import { Heading } from "@/components/ui/heading";
import { useI18n } from "@/i18n";

export function ProjectShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { t } = useI18n();
  const segments = pathname.split("/");
  const projectId = segments[2];
  const currentStep = segments[3] || "source";
  const { collapsed, mobileOpen, setMobileOpen, toggle, isNarrow } = useSidebar();

  // Get project state from persistent storage
  const { state: projectState, isLoading, error } = useProjectState(projectId);

  // Redirect to projects list if project not found (404 error)
  useEffect(() => {
    if (!isLoading && error) {
      const apiError = error as any;
      const is404 =
        apiError.status === 404 ||
        error.message.includes("not found") ||
        error.message.includes("Project not found");

      if (is404) {
        toast.error(t("project.common.projectNotFound"), t("project.common.projectNotFoundDesc"));
        setTimeout(() => {
          router.push("/projects");
        }, 2000);
      }
    }
  }, [isLoading, error, router, toast, t]);

  // Auto-toast when resuming a session from another screen / direct link
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isResumed = urlParams.get("resumed");
      const timeAgo = urlParams.get("timeAgo");

      if (isResumed === "true" || isResumed === "1") {
        const timeString = timeAgo ? decodeURIComponent(timeAgo) : "recently";
        toast.info("Session Restored", `Restored your session from ${timeString} ago`);

        // Clean up URL query parameters without reloading
        urlParams.delete("resumed");
        urlParams.delete("timeAgo");
        const newSearch = urlParams.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "");
        window.history.replaceState({}, "", newUrl);
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, [pathname, toast]);

  const projectTitle =
    projectState?.projectName ||
    projectState?.title ||
    projectState?.movieTitle ||
    t("project.common.untitledProject");

  // Determine current phase / status for top header badge
  const isRendering = projectState?.isRendering || false;
  const isCompleted = !!projectState?.videoUrl;

  const phaseBadge = (() => {
    if (isCompleted) {
      return {
        label: t("project.shell.statusCompleted"),
        className: "bg-status-success/20 text-status-success border-status-success/30",
      };
    }
    if (isRendering) {
      return {
        label: t("project.shell.statusRendering"),
        className:
          "bg-status-processing/20 text-status-processing border-status-processing/30 animate-pulse",
      };
    }
    if (currentStep === "source" || currentStep === "script") {
      return {
        label: t("project.nav.phaseConcept"),
        className: "bg-accent-secondary/15 text-accent-secondary border-accent-secondary/30",
      };
    }
    if (currentStep === "voice" || currentStep === "details" || currentStep === "preview") {
      return {
        label: t("project.nav.phaseProduction"),
        className: "bg-accent-primary/15 text-accent-primary border-accent-primary/30",
      };
    }
    return {
      label: t("project.nav.phaseMastering"),
      className: "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30",
    };
  })();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileOpen, setMobileOpen]);

  return (
    <div className="flex h-screen overflow-hidden">
      {!isNarrow && (
        <aside
          className={`flex shrink-0 flex-col border-r border-border-default bg-surface-panel/80 backdrop-blur-xl transition-[width] duration-300 ease-in-out ${
            collapsed ? "w-16" : "w-64"
          }`}
        >
          <DrawerContent pathname={pathname} collapsed={collapsed} onToggle={toggle} />
        </aside>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 flex-col border-b border-border-default bg-surface-panel md:h-14 md:flex-row md:items-center md:gap-4 md:px-4">
          <div className="mx-auto w-full max-w-7xl flex h-14 items-center gap-2 px-3 md:shrink-0 md:px-0 md:h-full md:gap-4">
            {isNarrow && (
              <button
                onClick={toggle}
                className="rounded-md p-1.5 text-text-muted hover:bg-surface-hover hover:text-text-secondary"
                aria-label={t("project.common.openNavigation")}
              >
                <PanelLeft className="h-5 w-5" aria-hidden />
              </button>
            )}
            <Link
              href="/projects"
              className="text-text-muted hover:text-text-secondary"
              aria-label={t("common.back")}
            >
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </Link>
            <Heading
              variant="label"
              as="h1"
              className="text-text-primary truncate max-w-xs sm:max-w-md"
            >
              {projectTitle}
            </Heading>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-micro font-medium uppercase tracking-wider ${phaseBadge.className}`}
            >
              <Sparkles className="h-2.5 w-2.5" />
              {phaseBadge.label}
            </span>
            <div className="ml-auto flex items-center gap-3 md:gap-4">
              <CreditStatus />
              <NotificationBell />
            </div>
          </div>
        </header>
        <main className="relative flex-1 overflow-y-auto bg-surface-base p-4 md:p-6">
          {projectState?.moviePoster && (
            <div
              className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center filter blur-3xl opacity-5 dark:opacity-10 transition-opacity duration-700"
              style={{ backgroundImage: `url(${projectState.moviePoster})` }}
              aria-hidden
            />
          )}
          <div className="relative z-10">{children}</div>
        </main>
      </div>

      {isNarrow && mobileOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] shrink-0 border-r border-border-default bg-surface-panel shadow-2xl">
            <DrawerContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
