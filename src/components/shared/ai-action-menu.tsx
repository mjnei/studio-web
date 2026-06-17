"use client";

export function AiActionMenu() {
  const actions = ["Regenerate", "Make it shorter", "Change tone"];

  return (
    <div className="rounded-md border border-border-default bg-surface-panel py-1 shadow-lg">
      {actions.map((action) => (
        <button
          key={action}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-gradient-solid">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
          </svg>
          {action}
        </button>
      ))}
    </div>
  );
}
