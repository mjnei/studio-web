"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, PanelLeft } from "lucide-react";
import { DrawerContent } from "@/components/shell/drawer-content";
import { useSidebar } from "@/components/shell/sidebar-context";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { CreditStatus } from "@/components/credits/CreditStatus";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useI18n } from "@/i18n";

/**
 * Shell for new project creation flow (/project/new/*).
 * Similar to ProjectShell but simplified since no project exists yet.
 */
export function NewProjectShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { collapsed, mobileOpen, setMobileOpen, toggle, isNarrow } = useSidebar();

  // Determine current step from pathname
  const currentPath = pathname.split("/").pop();
  const stepLabel =
    currentPath === "source"
      ? t("project.shell.stepSelectMovie")
      : t("project.shell.stepWriteScript");

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileOpen, setMobileOpen]);

  return (
    <div className="app-shell-height safe-area-x safe-area-top flex overflow-hidden">
      {/* Desktop sidebar */}
      {!isNarrow && (
        <aside
          className={`flex shrink-0 flex-col border-r border-border-default bg-surface-panel/80 backdrop-blur-xl transition-[width] duration-300 ease-in-out ${
            collapsed ? "w-16" : "w-64"
          }`}
        >
          <DrawerContent pathname={pathname} collapsed={collapsed} onToggle={toggle} />
        </aside>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex shrink-0 flex-col border-b border-border-default bg-surface-panel md:h-14 md:flex-row md:items-center md:gap-4 md:px-4">
          <div className="mx-auto w-full max-w-7xl flex h-14 items-center gap-2 px-3 md:shrink-0 md:px-0 md:h-full md:gap-4">
            {isNarrow && (
              <button
                onClick={toggle}
                className="rounded-md p-1.5 text-text-muted hover:bg-surface-hover hover:text-text-secondary"
                aria-label={t("project.common.openNavigation")}
              >
                <PanelLeft className="h-5 w-5" aria-hidden />
              </button>
            )}
            <Link
              href="/projects"
              className="text-text-muted hover:text-text-secondary"
              aria-label={t("common.back")}
            >
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </Link>
            <div>
              <Heading variant="label" as="h1" className="text-text-primary">
                {t("project.shell.createNewProject")}
              </Heading>
              <Text variant="caption" className="text-text-muted">
                {stepLabel}
              </Text>
            </div>
            <div className="ml-auto flex items-center gap-3 md:gap-4">
              <CreditStatus />
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="safe-area-bottom flex-1 overflow-y-auto bg-surface-base p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      {isNarrow && mobileOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] shrink-0 border-r border-border-default bg-surface-panel shadow-2xl">
            <DrawerContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
