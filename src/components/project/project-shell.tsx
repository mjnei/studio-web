"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

const mainItems = [
  { href: "/dashboard", label: "Dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { href: "/projects", label: "Projects", icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" },
  { href: "/movies", label: "Movies", icon: "m22 8-6 4 6 4V8Zm-2 12H2a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2ZM10 10l5 2-5 2V10Z" },
  { href: "/voices", label: "Voices", icon: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM5 10v2a7 7 0 0 0 14 0v-2M12 19v4M8 23h8" },
  { href: "/jobs", label: "Jobs", icon: "M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" },
];

const utilityItems = [
  { href: "/referral", label: "Referral", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 11h-6M19 8v6" },
  { href: "/help", label: "Help", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.36 4h.01" },
  { href: "/settings", label: "Settings", icon: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1-1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
];

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

function DrawerContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b border-border-default px-4">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2 text-base font-bold text-text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-cyan"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          Huavoi
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Main</p>
        <div className="space-y-0.5">
          {mainItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent-cyan-muted text-accent-cyan"
                    : "text-text-muted hover:bg-surface-hover hover:text-text-secondary"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="my-3 border-t border-border-default mx-1" />

        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Utilities</p>
        <div className="space-y-0.5">
          {utilityItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent-cyan-muted text-accent-cyan"
                    : "text-text-muted hover:bg-surface-hover hover:text-text-secondary"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border-default p-3">
        <Link
          href="/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-text-muted hover:bg-surface-hover hover:text-text-secondary"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-cyan/20 text-xs font-medium text-accent-cyan">H</span>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm text-text-primary">Huavoi User</p>
            <p className="truncate text-xs text-text-muted">you@example.com</p>
          </div>
        </Link>
        <div className="mt-2 px-2.5">
          <select className="w-full rounded-md border border-border-default bg-surface-raised px-2 py-1.5 text-xs text-text-secondary focus:border-accent-cyan focus:outline-none">
            <option>English</option>
            <option>中文</option>
            <option>Español</option>
            <option>Français</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export function ProjectShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const projectId = pathname.split("/")[2];
  const currentStep = pathname.split("/")[3] || "source";
  const activeIndex = stages.findIndex((s) => s.step === currentStep);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [drawerOpen, closeDrawer]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-base">
      <header className="flex shrink-0 flex-col border-b border-border-default bg-surface-panel md:h-14 md:flex-row md:items-center md:gap-4 md:px-4">
        <div className="flex h-14 items-center gap-2 px-3 md:shrink-0 md:px-0">
          <button
            onClick={() => setDrawerOpen(true)}
            className="hide-desktop rounded-md p-1.5 text-text-muted hover:bg-surface-hover hover:text-text-secondary"
            aria-label="Open navigation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
          </button>
          <Link href="/projects" className="text-text-muted hover:text-text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <h1 className="text-base font-semibold">Untitled Project</h1>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${statusColors["Draft"]}`}>
            Draft
          </span>
          <div className="ml-auto flex items-center gap-2 md:hidden">
            {(currentStep === "compose") && (
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
                {i > 0 && <div className={`h-px w-4 md:w-6 ${i <= activeIndex ? "bg-accent-cyan" : "bg-border-default"}`} />}
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  )}
                  {stage.label}
                </Link>
              </div>
            );
          })}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
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
      <main className="flex-1 overflow-y-auto p-3 md:p-6">{children}</main>

      {drawerOpen && (
        <div
          className="hide-desktop fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeDrawer}
          />
          <div className="relative w-72 shrink-0 border-r border-border-default bg-surface-panel shadow-xl">
            <DrawerContent pathname={pathname} onNavigate={closeDrawer} />
          </div>
        </div>
      )}
    </div>
  );
}
