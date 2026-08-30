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
  Search,
  CreditCard,
  Activity,
  Crown,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useIsAdmin } from "@/lib/hooks/use-admin";
import { useI18n } from "@/i18n";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getAdminDrawerNavItems, isAdminNavActive } from "@/lib/admin-nav";

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

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
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
};

/** Drawer section headers — caption (12px) per typography minimum readable size */
const sectionLabelClass =
  "mb-2 px-3 text-caption font-semibold uppercase tracking-wider text-text-muted/80 lg:mb-1.5 lg:px-2.5";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className={sectionLabelClass}>{children}</p>;
}

function CreateProjectButton({
  collapsed,
  onClick,
}: {
  collapsed?: boolean;
  onClick?: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className={`mb-3 ${collapsed ? "px-1" : "px-0"}`}>
      <Link
        href="/project/new"
        onClick={onClick}
        title={collapsed ? t("project.newProject") || "New Project" : undefined}
        className={`group relative flex items-center justify-center rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary p-px font-medium text-white shadow-sm shadow-accent-primary/20 transition-all duration-200 hover:shadow-md hover:shadow-accent-primary/30 active:scale-[0.98] ${
          collapsed ? "mx-auto h-9 w-9" : "h-9 w-full px-3"
        }`}
      >
        <div className="flex h-full w-full items-center justify-center gap-2 rounded-[11px] bg-accent-primary/90 transition-colors group-hover:bg-transparent">
          <Sparkles className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:rotate-12" />
          {!collapsed && (
            <span className="truncate text-caption font-semibold">
              {t("project.newProject") || "New Project"}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}

function RailLink({
  item,
  isActive: active,
  onClick,
  collapsed,
  label,
  icon,
}: {
  item: { href: string; labelKey: string };
  isActive: boolean;
  onClick?: () => void;
  collapsed?: boolean;
  label: string;
  icon?: LucideIcon;
}) {
  const NavIcon = icon ?? iconMap[item.href] ?? Search;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`group relative flex items-center rounded-lg transition-all duration-200 focus-ring ${
        collapsed ? "mx-auto h-9 w-9 justify-center" : "h-9 px-3 text-body font-medium lg:px-2.5"
      } ${
        active
          ? "bg-accent-primary/10 text-accent-primary font-semibold shadow-xs"
          : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
      }`}
    >
      {/* Active Glowing Notch */}
      {active && !collapsed && (
        <span className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-accent-primary shadow-[0_0_8px_var(--color-accent-primary)]" />
      )}
      <Icon
        icon={NavIcon}
        size="md"
        className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
          active ? "text-accent-primary" : "text-text-muted group-hover:text-text-primary"
        } ${!collapsed ? "mr-2.5" : ""}`}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

function LogoMark({ collapsed }: { collapsed?: boolean }) {
  if (collapsed) return null;
  return (
    <Link
      href="/dashboard"
      className="group flex items-center gap-2.5 rounded-lg text-page font-bold focus-ring"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-secondary via-accent-primary to-accent-tertiary shadow-md transition-all group-hover:scale-105 group-hover:shadow-lg">
        <Icon icon={Activity} size="sm" className="text-white" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text tracking-tight text-transparent">
          Huavoi
        </span>
        <span className="rounded bg-accent-primary/10 px-1.5 py-0.5 text-micro font-semibold uppercase tracking-wider text-accent-primary">
          Studio
        </span>
      </div>
    </Link>
  );
}

function UserSection({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const displayName = user?.name || t("common.unknown");
  const displayEmail = user?.email || "";
  const membershipTier = user?.membership_tier || "free";
  const tierLabel = t(`profile.membershipBilling.tiers.${membershipTier}`);
  const isPaidTier = membershipTier !== "free";
  const tierBadgeVariant = isPaidTier ? "success" : "default";

  return (
    <div
      className={`border-t border-border-default/60 p-3 lg:p-2.5 ${
        collapsed ? "flex flex-col items-center gap-2" : ""
      }`}
    >
      <Link
        href="/profile"
        onClick={onNavigate}
        title={collapsed ? `${displayName} (${tierLabel})` : undefined}
        className={`flex items-center gap-2.5 rounded-xl text-body transition-all focus-ring ${
          collapsed
            ? "justify-center p-0"
            : "border border-transparent p-2 hover:border-border-default/60 hover:bg-surface-hover"
        }`}
      >
        <div className="relative shrink-0">
          <UserAvatar
            seed={user?.id ?? "guest"}
            name={displayName}
            email={displayEmail}
            pictureUrl={user?.picture_url}
            width={36}
            height={36}
            initialsLength={1}
            ringWidth={2}
            className="h-9 w-9 rounded-full text-body shadow-md"
            imageClassName="h-9 w-9 rounded-full object-cover ring-2 ring-accent-primary/20"
          />
          {collapsed && (
            <span
              className={`absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full shadow-sm ${
                isPaidTier
                  ? "bg-accent-cyan text-white"
                  : "border border-border-default bg-surface-elevated text-text-muted"
              }`}
              aria-hidden
            >
              <Crown className="h-2 w-2" />
            </span>
          )}
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-caption font-semibold leading-tight text-text-primary">
              {displayName}
            </p>
            <Badge variant={tierBadgeVariant} size="sm" className="mt-0.5 px-1.5 py-0 text-micro">
              <Crown className="mr-0.5 h-2.5 w-2.5" />
              {tierLabel}
            </Badge>
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
        className={`flex h-14 shrink-0 items-center border-b border-border-default/60 ${
          collapsed ? "justify-center px-2 lg:px-1.5" : "px-4 lg:px-3"
        }`}
      >
        <LogoMark collapsed={collapsed} />
        {onToggle && (
          <button
            onClick={onToggle}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-all hover:bg-surface-hover hover:text-text-primary active:scale-95 focus-ring ${
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
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-all hover:bg-surface-hover hover:text-text-primary active:scale-95 focus-ring"
            aria-label={t("shell.closeMenu")}
            title={t("shell.closeMenu")}
          >
            <Icon icon={X} size="sm" />
          </button>
        )}
      </div>

      <div
        className={`flex-1 overflow-y-auto ${
          collapsed ? "px-2 py-3 lg:px-1.5" : "px-3 py-3 lg:px-2.5"
        }`}
      >
        <CreateProjectButton collapsed={collapsed} onClick={onNavigate} />

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
          className={`my-3 border-t border-border-default/60 ${collapsed ? "mx-0" : "mx-2 lg:mx-1.5"}`}
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
              className={`my-3 border-t border-border-default/60 ${
                collapsed ? "mx-0" : "mx-2 lg:mx-1.5"
              }`}
            />
            {!collapsed && <SectionLabel>{t("shell.admin")}</SectionLabel>}
            <div className="space-y-1 lg:space-y-0.5">
              {getAdminDrawerNavItems().map((item) => (
                <RailLink
                  key={item.href}
                  item={item}
                  icon={item.icon}
                  isActive={isAdminNavActive(pathname, item.href)}
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
