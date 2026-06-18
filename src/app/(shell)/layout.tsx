"use client";

import { useState, useCallback } from "react";
import { TopNav } from "@/components/shell/top-nav";
import { LeftRail } from "@/components/shell/left-rail";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden">
      <LeftRail open={drawerOpen} onClose={closeDrawer} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-surface-base p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
