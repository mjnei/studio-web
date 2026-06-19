"use client";

import { SidebarProvider } from "@/components/shell/sidebar-context";
import { TopNav } from "@/components/shell/top-nav";
import { LeftRail } from "@/components/shell/left-rail";
import { AuthGuard } from "@/lib/auth-context";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden">
          <LeftRail />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopNav />
            <main className="flex-1 overflow-y-auto bg-surface-base p-4 md:p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
