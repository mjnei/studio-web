"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { DrawerContent } from "@/components/shell/drawer-content";
import { useSidebar } from "@/components/shell/sidebar-context";

export function LeftRail() {
  const pathname = usePathname();
  const { collapsed, mobileOpen, setMobileOpen, isNarrow, toggle } = useSidebar();

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
      {/* Desktop Sidebar */}
      {!isNarrow && (
        <aside
          className={`flex shrink-0 flex-col border-r border-border-default bg-surface-panel/80 backdrop-blur-xl transition-all duration-300 ease-in-out ${
            collapsed ? "w-16" : "w-64"
          }`}
        >
          <DrawerContent pathname={pathname} collapsed={collapsed} onToggle={toggle} />
        </aside>
      )}

      {/* Mobile Overlay & Sidebar */}
      {isNarrow && mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div
            className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] border-r border-border-default bg-surface-panel shadow-2xl animate-in slide-in-from-left duration-300"
            role="dialog"
            aria-modal="true"
          >
            <DrawerContent 
              pathname={pathname} 
              onNavigate={() => setMobileOpen(false)} 
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </>
      )}
    </>
  );
}
