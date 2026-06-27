"use client";

import { SidebarProvider } from "@/components/shell/sidebar-context";

/**
 * Unified layout for all project routes (both new and existing projects).
 * Provides sidebar context for consistent navigation and spacing.
 */
export default function ProjectRootLayout({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
