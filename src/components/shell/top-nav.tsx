"use client";

import { useSidebar } from "@/components/shell/sidebar-context";
import { Button } from "@/components/ui/button";

export function TopNav() {
  const { toggle, isNarrow } = useSidebar();

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border-default bg-surface-panel/80 backdrop-blur-xl px-4 md:px-6 sticky top-0 z-40">
      <button
        onClick={toggle}
        className="rounded-lg p-2 text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-all active:scale-95"
        aria-label={isNarrow ? "Open navigation" : "Toggle sidebar"}
        title={isNarrow ? "Open navigation" : "Toggle sidebar"}
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

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {/* Search Bar */}
        <div className="hidden lg:block relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            className="w-64 rounded-lg border border-border-default bg-surface-raised pl-10 pr-4 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 focus:outline-none transition-all"
          />
        </div>

        {/* New Project Button */}
        <Button
          variant="primary"
          size="md"
          className="group"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:rotate-90"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          <a href="/projects" className="hidden sm:inline">
            New Project
          </a>
        </Button>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all">
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
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-status-failed" />
        </button>
      </div>
    </header>
  );
}
