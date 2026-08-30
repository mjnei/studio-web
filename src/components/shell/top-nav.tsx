"use client";

import { PanelLeft, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/shell/sidebar-context";
import { CreditStatus } from "@/components/credits/CreditStatus";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/i18n";

export function TopNav() {
  const { toggle, isNarrow } = useSidebar();
  const { t } = useI18n();
  const pathname = usePathname();

  // Extract root section from pathname for context breadcrumb
  const rootSegment = pathname.split("/").filter(Boolean)[0] || "dashboard";

  return (
    <header className="glass-chrome sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border-default/60 px-3 backdrop-blur-md transition-all duration-200 md:px-4">
      {/* Left: Mobile Toggle & Page Context */}
      <div className="flex items-center gap-2.5">
        {isNarrow && (
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-all hover:bg-surface-hover hover:text-text-primary active:scale-95 focus-ring"
            aria-label={t("shell.openNavMenu")}
            title={t("shell.openNavMenu")}
          >
            <PanelLeft className="h-4 w-4" aria-hidden />
          </button>
        )}

        <div className="hidden items-center gap-1.5 text-caption sm:flex">
          <span className="font-medium text-text-muted capitalize">Huavoi</span>
          <span className="text-text-muted/50">/</span>
          <span className="font-semibold text-text-primary capitalize">
            {t(`shell.${rootSegment}` as any) || rootSegment}
          </span>
        </div>
      </div>

      {/* Center: Command Palette / Search Trigger */}
      <div className="flex max-w-sm flex-1 items-center px-2 md:px-4">
        <button
          type="button"
          className="group flex h-8 w-full max-w-xs items-center justify-between rounded-lg border border-border-default/70 bg-surface-panel/40 px-2.5 text-caption text-text-muted shadow-xs backdrop-blur-xs transition-all hover:border-accent-primary/40 hover:bg-surface-hover hover:text-text-secondary focus-ring"
          aria-label={t("common.search")}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Icon
              icon={Search}
              size="xs"
              className="text-text-muted transition-colors group-hover:text-accent-primary"
            />
            <span className="truncate">{t("common.searchEllipsis") || "Search..."}</span>
          </div>
          <kbd className="hidden items-center gap-0.5 rounded border border-border-default bg-surface-elevated px-1.5 py-0.5 text-micro font-medium text-text-muted shadow-xs group-hover:border-accent-primary/30 group-hover:text-text-secondary sm:inline-flex">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 md:gap-2">
        <CreditStatus />
        <div className="hidden h-4 w-px bg-border-default/60 sm:block" />
        <LanguageSwitcher compactOnSmallScreens />
        <NotificationBell />
      </div>
    </header>
  );
}
