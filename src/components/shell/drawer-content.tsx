"use client";

import {
  Settings,
  HelpCircle,
  Home,
  Folder,
  Film,
  Mic,
  Briefcase,
  Gift,
  PanelLeft,
  X,
  Activity,
  Search,
  ShieldCheck,
  CreditCard,
  Layers,
  Zap,
  Play,
  Gamepad2,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useIsAdmin } from "@/lib/hooks/use-admin";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/ui/icon";

const mainItems = [
  {
    href: "/dashboard",
    labelKey: "shell.dashboard",
  },
  {
    href: "/projects",
    labelKey: "shell.projects",
  },
  {
    href: "/movies",
    labelKey: "shell.movies",
  },
  {
    href: "/voices",
    labelKey: "shell.voices",
  },
  {
    href: "/jobs",
    labelKey: "shell.jobs",
  },
];

const utilityItems = [
  {
    href: "/billing",
    labelKey: "shell.billing",
  },
  {
    href: "/referral",
    labelKey: "shell.referral",
  },
  {
    href: "/settings",
    labelKey: "shell.settings",
  },
  {
    href: "/help",
    labelKey: "shell.help",
  },
];

const adminItems = [
  {
    href: "/admin",
    labelKey: "shell.admin",
  },
  {
    href: "/admin/movies",
    labelKey: "shell.movies",
  },
  {
    href: "/admin/projects",
    labelKey: "shell.adminProjects",
  },
  {
    href: "/admin/voices",
    labelKey: "shell.voices",
  },
  {
    href: "/admin/queues",
    labelKey: "shell.queues",
  },
  {
    href: "/admin/studio-tts-jobs",
    labelKey: "shell.studioTTSJobs",
  },
  {
    href: "/admin/playground-tts-jobs",
    labelKey: "shell.playgroundTTSJobs",
  },
  {
    href: "/admin/playground",
    labelKey: "shell.playgroundTTS",
  },
  {
    href: "/admin/audit-logs",
    labelKey: "shell.auditLogs",
  },
];

function isActive(pathname: string, href: string) {
  // Exact match for /admin dashboard to avoid highlighting when on /admin/movies or /admin/voices
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(href + "/");
}

const iconMap: Record<string, LucideIcon> = {
  "/dashboard": Home,
  "/projects": Folder,
  "/movies": Film,
  "/voices": Mic,
  "/jobs": Briefcase,
  "/billing": CreditCard,
  "/referral": Gift,
  "/help": HelpCircle,
  "/settings": Settings,
  "/admin": ShieldCheck,
  "/admin/movies": Film,
  "/admin/voices": Mic,
  "/admin/queues": Layers,
  "/admin/studio-tts-jobs": Zap,
  "/admin/playground-tts-jobs": Gamepad2,
  "/admin/playground": Play,
  "/admin/audit-logs": Activity,
  "/admin/projects": BarChart3,
};

/** Drawer section headers — caption (12px) per typography minimum readable size */
const sectionLabelClass =
  "mb-2 px-3 text-caption font-bold uppercase tracking-wider text-text-muted lg:mb-1.5 lg:px-2.5";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className={sectionLabelClass}>{children}</p>;
}

function RailLink({
  item,
  isActive: active,
  onClick,
  collapsed,
  label,
}: {
  item: { href: string; labelKey: string };
  isActive: boolean;
  onClick?: () => void;
  collapsed?: boolean;
  label: string;
}) {
  const NavIcon = iconMap[item.href] ?? Search;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 lg:gap-2.5 rounded-lg transition-all duration-200 focus-ring ${
        collapsed
          ? "justify-center px-0 py-2.5 lg:py-2"
          : "px-3 py-2.5 text-body font-medium lg:px-2.5 lg:py-2"
      } ${
        active
          ? "bg-gradient-to-r from-accent-secondary/20 via-accent-primary/20 to-accent-tertiary/20 text-accent-primary shadow-sm border border-accent-primary/30"
          : "text-text-secondary hover:bg-surface-hover hover:text-text-primary hover:border hover:border-border-default"
      }`}
    >
      <Icon icon={NavIcon} size="md" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

function LogoMark({ collapsed }: { collapsed?: boolean }) {
  if (collapsed) return null;
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2 text-page font-bold group focus-ring rounded-lg"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent-secondary via-accent-primary to-accent-tertiary shadow-md group-hover:shadow-lg transition-all">
        <Icon icon={Activity} size="sm" className="text-white" />
      </div>
      <span className="bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
        Huavoi
      </span>
    </Link>
  );
}

function UserSection({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const initials = user ? (user.name?.[0] || user.email[0]).toUpperCase() : "U";
  const displayName = user?.name || t("common.unknown");
  const displayEmail = user?.email || "";

  return (
    <div
      className={`border-t border-border-default p-4 lg:p-3 bg-surface-raised/50 ${
        collapsed ? "flex flex-col items-center gap-2 lg:gap-1.5" : ""
      }`}
    >
      <Link
        href="/profile"
        onClick={onNavigate}
        className={`flex items-center gap-3 lg:gap-2.5 rounded-lg text-body transition-all focus-ring ${
          collapsed
            ? "justify-center p-0"
            : "px-3 py-2.5 hover:bg-surface-hover border border-transparent hover:border-border-default lg:px-2.5 lg:py-2"
        }`}
      >
        {user?.picture_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URLs use dynamic hosts
          <img
            src={user.picture_url}
            alt={displayName}
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-accent-primary/20"
            width={40}
            height={40}
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-secondary to-accent-primary text-body font-bold text-white shadow-lg">
            {initials}
          </span>
        )}
        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-body font-medium text-text-primary">{displayName}</p>
            <p className="truncate text-caption text-text-secondary">{displayEmail}</p>
          </div>
        )}
      </Link>
    </div>
  );
}

export function DrawerContent({
  pathname,
  onNavigate,
  collapsed,
  onToggle,
  onClose,
}: {
  pathname: string;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}) {
  const isAdmin = useIsAdmin();
  const { t } = useI18n();

  return (
    <div className="flex h-full flex-col">
      <div
        className={`flex h-14 items-center border-b border-border-default shrink-0 ${
          collapsed ? "justify-center px-2 lg:px-1.5" : "px-4 lg:px-3"
        }`}
      >
        <LogoMark collapsed={collapsed} />
        {onToggle && (
          <button
            onClick={onToggle}
            className={`h-9 w-9 rounded-md text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all active:scale-95 focus-ring flex items-center justify-center ${
              collapsed ? "" : "ml-auto"
            }`}
            aria-label={collapsed ? t("shell.expandSidebar") : t("shell.collapseSidebar")}
            title={collapsed ? t("shell.expandSidebar") : t("shell.collapseSidebar")}
          >
            <PanelLeft className="h-4 w-4" aria-hidden />
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto h-9 w-9 rounded-md text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all active:scale-95 focus-ring flex items-center justify-center"
            aria-label={t("shell.closeMenu")}
            title={t("shell.closeMenu")}
          >
            <Icon icon={X} size="sm" />
          </button>
        )}
      </div>

      <div
        className={`flex-1 overflow-y-auto ${
          collapsed ? "px-2 py-4 lg:px-1.5 lg:py-3" : "px-3 py-4 lg:px-2.5 lg:py-3"
        }`}
      >
        {!collapsed && <SectionLabel>{t("shell.main")}</SectionLabel>}
        <div className="space-y-1 lg:space-y-0.5">
          {mainItems.map((item) => (
            <RailLink
              key={item.href}
              item={item}
              isActive={isActive(pathname, item.href)}
              onClick={onNavigate}
              collapsed={collapsed}
              label={t(item.labelKey)}
            />
          ))}
        </div>

        <div
          className={`my-4 border-t border-border-default lg:my-3 ${collapsed ? "mx-0" : "mx-2 lg:mx-1.5"}`}
        />

        {!collapsed && <SectionLabel>{t("shell.utilities")}</SectionLabel>}
        <div className="space-y-1 lg:space-y-0.5">
          {utilityItems.map((item) => (
            <RailLink
              key={item.href}
              item={item}
              isActive={isActive(pathname, item.href)}
              onClick={onNavigate}
              collapsed={collapsed}
              label={t(item.labelKey)}
            />
          ))}
        </div>

        {/* Admin Section - Only for Admin Users */}
        {isAdmin && (
          <>
            <div
              className={`my-4 border-t border-border-default lg:my-3 ${
                collapsed ? "mx-0" : "mx-2 lg:mx-1.5"
              }`}
            />
            {!collapsed && <SectionLabel>{t("shell.admin")}</SectionLabel>}
            <div className="space-y-1 lg:space-y-0.5">
              {adminItems.map((item) => (
                <RailLink
                  key={item.href}
                  item={item}
                  isActive={isActive(pathname, item.href)}
                  onClick={onNavigate}
                  collapsed={collapsed}
                  label={t(item.labelKey)}
                />
              ))}
            </div>
            {!collapsed && (
              <Link
                href="/debug-sse"
                onClick={onNavigate}
                className="mt-2 block px-3 text-caption text-text-muted hover:text-accent-primary hover:underline lg:px-2.5"
              >
                /debug-sse
              </Link>
            )}
          </>
        )}
      </div>

      <UserSection collapsed={collapsed} onNavigate={onNavigate} />
    </div>
  );
}
