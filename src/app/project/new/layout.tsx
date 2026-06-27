"use client";

import { NewProjectShell } from "@/components/project/new-project-shell";

/**
 * Layout for new project creation routes (/project/new/*).
 * SidebarProvider is in parent /project/layout.tsx.
 */
export default function NewProjectLayout({ children }: { children: React.ReactNode }) {
  return <NewProjectShell>{children}</NewProjectShell>;
}
