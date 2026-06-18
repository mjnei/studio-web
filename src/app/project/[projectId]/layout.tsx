"use client";

import { SidebarProvider } from "@/components/shell/sidebar-context";
import { ProjectShell } from "@/components/project/project-shell";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ProjectShell>{children}</ProjectShell>
    </SidebarProvider>
  );
}
