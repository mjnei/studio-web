"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { DrawerContent } from "@/components/shell/drawer-content";
import { useSidebar } from "@/components/shell/sidebar-context";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { CreditStatus } from "@/components/credits/CreditStatus";
import { useToast } from "@/components/ui/toast";

type Status = "Voice Ready" | "Composing" | "Rendering" | "Completed";

const statusColors: Record<Status, string> = {
  "Voice Ready": "bg-accent-cyan",
  Composing: "bg-status-processing",
  Rendering: "bg-status-processing animate-pulse",
  Completed: "bg-status-completed",
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
        toast.error(
          "Project not found",
          "This project may have been deleted. Redirecting to projects list..."
        );
        setTimeout(() => {
          router.push("/projects");
        }, 2000);
      }
    }
  }, [isLoading, error, router, toast]);

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
    "Untitled Project";

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
            <Link href="/projects" className="text-text-muted hover:text-text-secondary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-base font-semibold">{projectTitle}</h1>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${statusColors[projectStatus]}`}
            >
              {projectStatus}
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
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
