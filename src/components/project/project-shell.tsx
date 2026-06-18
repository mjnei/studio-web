"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { DrawerContent } from "@/components/shell/drawer-content";
import { useSidebar } from "@/components/shell/sidebar-context";

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

export function ProjectShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const projectId = pathname.split("/")[2];
  const currentStep = pathname.split("/")[3] || "source";
  const activeIndex = stages.findIndex((s) => s.step === currentStep);
  const { collapsed, mobileOpen, setMobileOpen, toggle, isNarrow } = useSidebar();

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
          className={`flex shrink-0 flex-col border-r border-border-default bg-surface-panel transition-[width] duration-200 ease-in-out ${
            collapsed ? "w-14" : "w-52"
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </button>
            <Link href="/projects" className="text-text-muted hover:text-text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
            <h1 className="text-base font-semibold">Untitled Project</h1>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${statusColors["Draft"]}`}
            >
              Draft
            </span>
            <div className="ml-auto flex items-center gap-2 md:hidden">
              {currentStep === "compose" && (
                <button className="rounded-md bg-accent-gradient-solid px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">
                  Export
                </button>
              )}
            </div>
          </div>
          <nav className="flex items-center gap-0.5 overflow-x-auto px-3 pb-2 md:ml-6 md:flex md:pb-0">
            {stages.map((stage, i) => {
              const isActive = stage.step === currentStep;
              const isCompleted = i < activeIndex;
              return (
                <div key={stage.step} className="flex shrink-0 items-center">
                  {i > 0 && (
                    <div
                      className={`h-px w-4 md:w-6 ${i <= activeIndex ? "bg-accent-cyan" : "bg-border-default"}`}
                    />
                  )}
                  <Link
                    href={`/project/${projectId}/${stage.step}`}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-sm ${
                      isActive
                        ? "bg-accent-cyan-muted text-accent-cyan font-medium"
                        : isCompleted
                          ? "text-accent-cyan"
                          : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {isCompleted && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
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
                <button className="rounded-md bg-accent-gradient-solid px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">
                  Export
                </button>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-3 md:p-6">{children}</main>
      </div>

      {isNarrow && mobileOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 shrink-0 border-r border-border-default bg-surface-panel shadow-xl">
            <DrawerContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
