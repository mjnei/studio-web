"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-base">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border-default bg-surface-panel px-4">
        <Link href="/projects" className="text-text-muted hover:text-text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 className="text-base font-semibold">Untitled Project</h1>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${statusColors["Draft"]}`}>
          Draft
        </span>
        <nav className="ml-6 flex items-center gap-0.5">
          {stages.map((stage, i) => {
            const isActive = stage.step === currentStep;
            const isCompleted = i < activeIndex;
            return (
              <div key={stage.step} className="flex items-center">
                {i > 0 && <div className={`h-px w-6 ${i <= activeIndex ? "bg-accent-cyan" : "bg-border-default"}`} />}
                <Link
                  href={`/project/${projectId}/${stage.step}`}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm ${
                    isActive
                      ? "bg-accent-cyan-muted text-accent-cyan font-medium"
                      : isCompleted
                      ? "text-accent-cyan"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {isCompleted && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  )}
                  {stage.label}
                </Link>
              </div>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {(currentStep === "compose") && (
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
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
