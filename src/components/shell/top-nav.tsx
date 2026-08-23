"use client";

import { PanelLeft, Search } from "lucide-react";
import { useSidebar } from "@/components/shell/sidebar-context";
import { CreditStatus } from "@/components/credits/CreditStatus";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useI18n } from "@/i18n";

export function TopNav() {
  const { toggle, isNarrow } = useSidebar();
  const { t } = useI18n();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border-default bg-surface-panel/80 backdrop-blur-xl px-3 md:px-4 sticky top-0 z-40 transition-all duration-200">
      {/* Mobile Hamburger Menu - Only on mobile */}
      {isNarrow && (
        <button
          onClick={toggle}
          className="rounded-lg p-1.5 text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-all active:scale-95 focus-ring"
          aria-label={t("shell.openNavMenu")}
          title={t("shell.openNavMenu")}
        >
          <PanelLeft className="h-[22px] w-[22px]" aria-hidden />
        </button>
      )}

      <div className="ml-auto flex items-center gap-1.5 md:gap-2">
        {/* Search Bar */}
        <div className="hidden lg:block relative">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
            <Search className="h-4 w-4" aria-hidden />
          </div>
          <input
            type="text"
            placeholder={t("common.searchEllipsis")}
            className="w-64 rounded-lg border border-border-default bg-surface-raised pl-9 pr-3 py-1.5 text-sm text-text-primary placeholder-text-muted focus:border-accent-primary focus-ring transition-all hover:border-border-strong"
          />
        </div>

        {/* Credit Status */}
        <CreditStatus />

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notifications */}
        <NotificationBell />
      </div>
    </header>
  );
}
