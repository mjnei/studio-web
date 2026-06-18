import Link from "next/link";

const mainItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  },
  {
    href: "/projects",
    label: "Projects",
    icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  },
  {
    href: "/movies",
    label: "Movies",
    icon: "m22 8-6 4 6 4V8Zm-2 12H2a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2ZM10 10l5 2-5 2V10Z",
  },
  {
    href: "/voices",
    label: "Voices",
    icon: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM5 10v2a7 7 0 0 0 14 0v-2M12 19v4M8 23h8",
  },
  {
    href: "/jobs",
    label: "Jobs",
    icon: "M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83",
  },
];

const utilityItems = [
  {
    href: "/referral",
    label: "Referral",
    icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 11h-6M19 8v6",
  },
  {
    href: "/help",
    label: "Help",
    icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.36 4h.01",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1-1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function RailLink({
  item,
  isActive: active,
  onClick,
  collapsed,
}: {
  item: { href: string; label: string; icon: string };
  isActive: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 rounded-md transition-colors ${
        collapsed ? "justify-center px-0 py-2" : "px-2.5 py-2 text-base"
      } ${
        active
          ? "bg-accent-cyan-muted text-accent-cyan"
          : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
      }`}
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
        className="shrink-0"
      >
        <path d={item.icon} />
      </svg>
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

function LogoMark({ collapsed }: { collapsed?: boolean }) {
  if (collapsed) return null;
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2 text-lg font-bold text-text-primary"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-accent-cyan"
      >
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
      <span>Huavoi</span>
    </Link>
  );
}

function UserSection({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  return (
    <div
      className={`border-t border-border-default p-3 ${collapsed ? "flex flex-col items-center gap-2" : ""}`}
    >
      <Link
        href="/profile"
        onClick={onNavigate}
        className={`flex items-center gap-3 rounded-md text-base text-text-secondary hover:bg-surface-hover hover:text-text-primary ${
          collapsed ? "justify-center p-0" : "px-2.5 py-2"
        }`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-cyan/20 text-xs font-medium text-accent-cyan">
          H
        </span>
        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-base text-text-primary">Huavoi User</p>
            <p className="truncate text-sm text-text-secondary">you@example.com</p>
          </div>
        )}
      </Link>
      {!collapsed && (
        <div className="mt-2 px-2.5">
          <select className="w-full rounded-md border border-border-default bg-surface-raised px-2 py-1.5 text-sm text-text-secondary focus:border-accent-cyan focus:outline-none">
            <option>English</option>
          </select>
        </div>
      )}
    </div>
  );
}

export function DrawerContent({
  pathname,
  onNavigate,
  collapsed,
  onToggle,
}: {
  pathname: string;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div
        className={`flex h-14 items-center border-b border-border-default shrink-0 ${
          collapsed ? "justify-center" : "px-4"
        }`}
      >
        <LogoMark collapsed={collapsed} />
        <button
          onClick={onToggle}
          className={`rounded-md p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary ${
            collapsed ? "" : "ml-auto"
          }`}
          aria-label="Toggle sidebar"
        >
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
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 3v18" />
          </svg>
        </button>
      </div>

      <div className={`flex-1 overflow-y-auto ${collapsed ? "px-2 py-3" : "px-3 py-3"}`}>
        {!collapsed && (
          <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            Main
          </p>
        )}
        <div className={`space-y-0.5 ${collapsed ? "" : ""}`}>
          {mainItems.map((item) => (
            <RailLink
              key={item.href}
              item={item}
              isActive={isActive(pathname, item.href)}
              onClick={onNavigate}
              collapsed={collapsed}
            />
          ))}
        </div>

        <div className={`my-3 border-t border-border-default ${collapsed ? "mx-0" : "mx-1"}`} />

        {!collapsed && (
          <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            Utilities
          </p>
        )}
        <div className="space-y-0.5">
          {utilityItems.map((item) => (
            <RailLink
              key={item.href}
              item={item}
              isActive={isActive(pathname, item.href)}
              onClick={onNavigate}
              collapsed={collapsed}
            />
          ))}
        </div>
      </div>

      <UserSection collapsed={collapsed} onNavigate={onNavigate} />
    </div>
  );
}
