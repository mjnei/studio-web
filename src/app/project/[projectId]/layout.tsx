"use client";

import { ProjectShell } from "@/components/project/project-shell";
import { AuthGuard } from "@/lib/auth-context";

/**
 * Layout for existing project routes (/project/[projectId]/*).
 * SidebarProvider is now in parent /project/layout.tsx.
 */
export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <ProjectShell>{children}</ProjectShell>
    </AuthGuard>
  );
}
