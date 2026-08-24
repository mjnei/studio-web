"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, PanelLeft } from "lucide-react";
import { DrawerContent } from "@/components/shell/drawer-content";
import { useSidebar } from "@/components/shell/sidebar-context";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { CreditStatus } from "@/components/credits/CreditStatus";
import { useToast } from "@/components/ui/toast";
import { Heading } from "@/components/ui/heading";
import { useI18n } from "@/i18n";

type Status = "Voice Ready" | "Composing" | "Rendering" | "Completed";

const statusColors: Record<Status, string> = {
  "Voice Ready": "bg-accent-cyan",
  Composing: "bg-status-processing",
  Rendering: "bg-status-processing animate-pulse",
  Completed: "bg-status-completed",
};

const statusI18nKeys: Record<Status, string> = {
  "Voice Ready": "project.shell.statusVoiceReady",
  Composing: "project.shell.statusComposing",
  Rendering: "project.shell.statusRendering",
  Completed: "project.shell.statusCompleted",
};

// Determine project status based on completed steps
function getProjectStatus(hasVoice: boolean, hasVideo: boolean, isRendering: boolean): Status {
  if (hasVideo) return "Completed";
  if (isRendering) return "Rendering";
  if (hasVoice) return "Voice Ready";
  return "Voice Ready"; // New projects start at voice step
}

export function ProjectShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { t } = useI18n();
  const projectId = pathname.split("/")[2];
  const { collapsed, mobileOpen, setMobileOpen, toggle, isNarrow } = useSidebar();

  // Get project state from persistent storage
  const { state: projectState, isLoading, error } = useProjectState(projectId);

  // Redirect to projects list if project not found (404 error)
  useEffect(() => {
    if (!isLoading && error) {
      // Check if it's an ApiError with status 404
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

  // Determine which steps are completed based on project state
  const completedSteps = {
    voice: !!projectState?.audioUrl,
    compose: !!projectState?.videoUrl,
  };

  const projectStatus = getProjectStatus(
    completedSteps.voice,
    completedSteps.compose,
    projectState?.isRendering || false
  );

  const projectTitle =
    projectState?.projectName ||
    projectState?.title ||
    projectState?.movieTitle ||
    t("project.common.untitledProject");

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
            <Heading variant="label" as="h1" className="text-text-primary">
              {projectTitle}
            </Heading>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-caption leading-caption font-medium text-white ${statusColors[projectStatus]}`}
            >
              {t(statusI18nKeys[projectStatus])}
            </span>
            <div className="ml-auto flex items-center gap-2 md:hidden">
              {/* Export button removed */}
            </div>
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
