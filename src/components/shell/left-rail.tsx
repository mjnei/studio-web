"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { DrawerContent } from "@/components/shell/drawer-content";

export function LeftRail({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      <aside className="hide-mobile flex shrink-0 flex-col border-r border-border-default bg-surface-panel w-52">
        <DrawerContent pathname={pathname} />
      </aside>

      {open && (
        <div
          className="hide-desktop fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <div
            ref={drawerRef}
            className="relative w-72 shrink-0 border-r border-border-default bg-surface-panel shadow-xl"
          >
            <DrawerContent pathname={pathname} onNavigate={onClose} />
          </div>
        </div>
      )}
    </>
  );
}
