"use client";

import { PanelLeft, Search } from "lucide-react";
import { useSidebar } from "@/components/shell/sidebar-context";
import { CreditStatus } from "@/components/credits/CreditStatus";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n";

export function TopNav() {
  const { toggle, isNarrow } = useSidebar();
  const { t } = useI18n();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border-default bg-surface-panel/80 backdrop-blur-xl px-3 md:px-4 sticky top-0 z-40 transition-all duration-200">
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
        <div className="hidden lg:block">
          <Input
            type="search"
            placeholder={t("common.searchEllipsis")}
            icon={<Search className="h-4 w-4" aria-hidden />}
            wrapperClassName="w-64"
            aria-label={t("common.searchEllipsis")}
          />
        </div>

        <CreditStatus />
        <LanguageSwitcher />
        <NotificationBell />
      </div>
    </header>
  );
}
