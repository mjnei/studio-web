"use client";

export function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border-default bg-surface-panel px-3 md:px-4 md:gap-4">
      <button
        onClick={onMenuClick}
        className="hide-desktop rounded-md p-1.5 text-text-muted hover:bg-surface-hover hover:text-text-secondary"
        aria-label="Open navigation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
      </button>
      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <input
          type="text"
          placeholder="Search..."
          className="hidden w-48 rounded-md border border-border-default bg-surface-raised px-3 py-1.5 text-sm text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none lg:block"
        />
        <a
          href="/projects"
          className="rounded-md bg-accent-gradient-solid px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          <span className="hide-mobile">New Project</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hide-desktop inline"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </a>
        <button className="relative rounded-md p-1.5 text-text-secondary hover:bg-surface-hover">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </button>
      </div>
    </header>
  );
}
