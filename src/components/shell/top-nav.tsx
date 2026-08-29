"use client";

import { PanelLeft } from "lucide-react";
import { useSidebar } from "@/components/shell/sidebar-context";
import { CreditStatus } from "@/components/credits/CreditStatus";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

import { useI18n } from "@/i18n";

export function TopNav() {
  const { toggle, isNarrow } = useSidebar();
  const { t } = useI18n();

  return (
    <header className="glass-chrome flex h-14 shrink-0 items-center gap-2 border-b border-border-default px-3 md:px-4 sticky top-0 z-40 transition-all duration-200">
      {isNarrow && (
        <button
          onClick={toggle}
          className="h-9 w-9 rounded-md text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-all active:scale-95 focus-ring flex items-center justify-center"
          aria-label={t("shell.openNavMenu")}
          title={t("shell.openNavMenu")}
        >
          <PanelLeft className="h-4 w-4" aria-hidden />
        </button>
      )}

      <div className="ml-auto flex items-center gap-1.5 md:gap-2">
        <CreditStatus />
        <LanguageSwitcher />
        <NotificationBell />
      </div>
    </header>
  );
}
