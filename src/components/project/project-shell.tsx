"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PanelLeft, ArrowLeft, Check } from "lucide-react";
import { DrawerContent } from "@/components/shell/drawer-content";
import { useSidebar } from "@/components/shell/sidebar-context";
import { Button } from "@/components/ui/button";
import { useProjectState } from "@/lib/hooks/use-project-state";

const stages = [
  { step: "source", label: "Source" },
  { step: "script", label: "Script" },
  { step: "voice", label: "Voice" },
  { step: "compose", label: "Compose" },
];

type Status = "Draft" | "Script Ready" | "Voice Ready" | "Composing" | "Rendering" | "Completed";

const statusColors: Record<Status, string> = {
  Draft: "bg-text-muted",
  "Script Ready": "bg-accent-cyan",
  "Voice Ready": "bg-accent-cyan",
  Composing: "bg-status-processing",
  Rendering: "bg-status-processing animate-pulse",
  Completed: "bg-status-completed",
};

// Determine project status based on completed steps
function getProjectStatus(
  hasMovie: boolean,
  hasScript: boolean,
  hasVoice: boolean,
  hasVideo: boolean,
  isRendering: boolean
): Status {
  if (hasVideo) return "Completed";
  if (isRendering) return "Rendering";
  if (hasVoice) return "Voice Ready";
  if (hasScript) return "Script Ready";
  return "Draft";
}

export function ProjectShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const projectId = pathname.split("/")[2];
  const currentStep = pathname.split("/")[3] || "source";
  const activeIndex = stages.findIndex((s) => s.step === currentStep);
  const { collapsed, mobileOpen, setMobileOpen, toggle, isNarrow } = useSidebar();

  // Get project state from persistent storage
  const { state: projectState, isLoading } = useProjectState(projectId);
  
  // Determine which steps are completed based on project state
  const completedSteps = {
    source: !!projectState?.movieId,
    script: !!projectState?.scripts && projectState.scripts.length > 0,
    voice: !!projectState?.audioUrl,
    compose: !!projectState?.videoUrl,
  };

  const projectStatus = getProjectStatus(
    completedSteps.source,
    completedSteps.script,
    completedSteps.voice,
    completedSteps.compose,
    projectState?.isRendering || false
  );

  const projectTitle = projectState?.title || projectState?.movieTitle || "Untitled Project";

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
          <div className="flex h-14 items-center gap-2 px-3 md:shrink-0 md:px-0">
            <button
              onClick={toggle}
              className="rounded-md p-1.5 text-text-muted hover:bg-surface-hover hover:text-text-secondary"
              aria-label={isNarrow ? "Open navigation" : "Toggle sidebar"}
            >
              <PanelLeft size={20} />
            </button>
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
              {currentStep === "compose" && (
                <Button variant="primary" size="sm">
                  Export
                </Button>
              )}
            </div>
          </div>
          <nav className="flex items-center gap-0.5 overflow-x-auto px-3 pb-2 md:ml-6 md:flex md:pb-0">
            {stages.map((stage, i) => {
              const isActive = stage.step === currentStep;
              const isCompleted = completedSteps[stage.step as keyof typeof completedSteps];
              const isAccessible = i === 0 || completedSteps[stages[i - 1].step as keyof typeof completedSteps];
              
              return (
                <div key={stage.step} className="flex shrink-0 items-center">
                  {i > 0 && (
                    <div
                      className={`h-px w-4 md:w-6 ${isCompleted ? "bg-accent-cyan" : "bg-border-default"}`}
                    />
                  )}
                  <Link
                    href={isAccessible ? `/project/${projectId}/${stage.step}` : "#"}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-sm ${
                      isActive
                        ? "bg-accent-cyan-muted text-accent-cyan font-medium"
                        : isCompleted
                          ? "text-accent-cyan hover:bg-accent-cyan-muted/50"
                          : isAccessible
                            ? "text-text-muted hover:text-text-secondary"
                            : "text-text-disabled cursor-not-allowed"
                    }`}
                    onClick={(e) => {
                      if (!isAccessible) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {isCompleted && <Check size={14} strokeWidth={3} />}
                    {stage.label}
                  </Link>
                </div>
              );
            })}
          </nav>
          <div className="ml-auto hidden items-center gap-2 md:flex">
            {currentStep === "compose" && (
              <>
                <select className="rounded-md border border-border-default bg-surface-raised px-2 py-1 text-xs text-text-secondary">
                  <option>1080p / 30fps</option>
                  <option>720p / 30fps</option>
                  <option>4K / 60fps</option>
                </select>
                <Button variant="primary" size="sm">
                  Export
                </Button>
              </>
            )}
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
