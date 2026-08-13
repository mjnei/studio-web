"use client";

import Link from "next/link";
import { PanelLeft, Search } from "lucide-react";
import { useSidebar } from "@/components/shell/sidebar-context";
import { Button } from "@/components/ui/button";
import { CreditStatus } from "@/components/credits/CreditStatus";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useI18n } from "@/i18n";

export function TopNav() {
  const { toggle, isNarrow } = useSidebar();
  const { t } = useI18n();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border-default bg-surface-panel/80 backdrop-blur-xl px-4 md:px-6 sticky top-0 z-40 transition-all duration-200">
        {/* Mobile Hamburger Menu - Only on mobile */}
        {isNarrow && (
          <button
            onClick={toggle}
            className="rounded-lg p-2 text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-all active:scale-95 focus-ring"
            aria-label="Open navigation menu"
            title="Open navigation menu"
          >
            <PanelLeft size={24} />
          </button>
        )}

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          {/* Credit Status */}
          <CreditStatus />

          {/* Search Bar */}
          <div className="hidden lg:block relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder={t("common.search") + "..."}
              className="w-64 rounded-lg border border-border-default bg-surface-raised pl-10 pr-4 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 focus:outline-none transition-all hover:border-border-strong"
            />
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Notifications */}
          <NotificationBell />
        </div>
      </header>
    </>
  );
}
