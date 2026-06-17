"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

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

function ProfileMenu({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center gap-3 rounded-md text-sm text-text-muted hover:bg-surface-hover hover:text-text-secondary ${
          collapsed ? "justify-center px-0 py-2" : "px-2.5 py-2"
        }`}
        title={collapsed ? "Account" : undefined}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-cyan/20 text-xs font-medium text-accent-cyan">H</span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left">Huavoi User</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted"><path d="m6 9 6 6 6-6"/></svg>
          </>
        )}
      </button>
      {open && (
        <div
          className={`z-50 rounded-md border border-border-default bg-surface-panel py-1 shadow-lg ${
            collapsed ? "absolute bottom-0 left-full ml-2 w-48" : "absolute bottom-full left-0 mb-1 w-full min-w-[200px]"
          }`}
        >
          <div className={`border-b border-border-default px-3 py-2 ${collapsed ? "" : ""}`}>
            <p className="text-sm font-medium text-text-primary">you@example.com</p>
            <p className="text-xs text-text-muted">Free plan</p>
          </div>
          <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary" onClick={() => setOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Profile
          </Link>
          <Link href="/settings" className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary" onClick={() => setOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1-1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>
            Settings
          </Link>
          <Link href="/referral" className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary" onClick={() => setOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11h-6M19 8v6"/></svg>
            Referral
          </Link>
          <div className="my-1 border-t border-border-default" />
          <Link href="/login" className="flex items-center gap-2 px-3 py-1.5 text-sm text-status-failed hover:bg-surface-hover" onClick={() => setOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign out
          </Link>
        </div>
      )}
    </div>
  );
}

function RailLink({ item, collapsed, isActive }: { item: { href: string; label: string; icon: string }; collapsed: boolean; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors ${
        collapsed ? "justify-center px-0" : ""
      } ${
        isActive
          ? "bg-accent-cyan-muted text-accent-cyan"
          : "text-text-muted hover:bg-surface-hover hover:text-text-secondary"
      }`}
      title={collapsed ? item.label : undefined}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export function LeftRail() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-border-default bg-surface-panel transition-all ${
        collapsed ? "w-[60px]" : "w-52"
      }`}
    >
      <div className="flex h-14 items-center border-b border-border-default px-3">
        {!collapsed && (
          <Link href="/dashboard" className="mr-auto flex items-center gap-2 text-base font-bold text-text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-cyan"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            Huavoi
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text-secondary ${!collapsed ? "ml-auto" : "mx-auto"}`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 3v18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <p className={`mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted ${collapsed ? "sr-only" : ""}`}>Main</p>
        <div className="space-y-0.5">
          {mainItems.map((item) => (
            <RailLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
            />
          ))}
        </div>

        <div className={`my-3 border-t border-border-default ${collapsed ? "mx-1" : "mx-2"}`} />

        <p className={`mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted ${collapsed ? "sr-only" : ""}`}>Utilities</p>
        <div className="space-y-0.5">
          {utilityItems.map((item) => (
            <RailLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-border-default px-2 py-2">
        <ProfileMenu collapsed={collapsed} />
      </div>
    </aside>
  );
}
