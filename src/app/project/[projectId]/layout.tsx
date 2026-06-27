"use client";

import { ProjectShell } from "@/components/project/project-shell";

/**
 * Layout for existing project routes (/project/[projectId]/*).
 * SidebarProvider is now in parent /project/layout.tsx.
 */
export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return <ProjectShell>{children}</ProjectShell>;
}
