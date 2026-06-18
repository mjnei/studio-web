"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { DrawerContent } from "@/components/shell/drawer-content";
import { useSidebar } from "@/components/shell/sidebar-context";

export function LeftRail() {
  const pathname = usePathname();
  const { collapsed, mobileOpen, setMobileOpen, isNarrow } = useSidebar();

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
    <>
      {!isNarrow && (
        <aside
          className={`flex shrink-0 flex-col border-r border-border-default bg-surface-panel transition-[width] duration-200 ease-in-out ${
            collapsed ? "w-14" : "w-52"
          }`}
        >
          <DrawerContent pathname={pathname} collapsed={collapsed} />
        </aside>
      )}

      {isNarrow && mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 shrink-0 border-r border-border-default bg-surface-panel shadow-xl">
            <DrawerContent
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
