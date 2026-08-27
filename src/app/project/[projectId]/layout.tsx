"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProjectShell } from "@/components/project/project-shell";
import { AuthGuard } from "@/lib/auth-context";

/** Static segments under /project that must not be treated as numeric project IDs. */
const RESERVED_PROJECT_IDS = new Set(["new"]);

/**
 * Layout for existing project routes (/project/[projectId]/*).
 * SidebarProvider is now in parent /project/layout.tsx.
 */
export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const isReserved = RESERVED_PROJECT_IDS.has(projectId);

  useEffect(() => {
    if (!isReserved) return;
    if (projectId === "new") {
      router.replace("/project/new/source");
    }
  }, [isReserved, projectId, router]);

  if (isReserved) {
    return null;
  }

  return (
    <AuthGuard>
      <ProjectShell>{children}</ProjectShell>
    </AuthGuard>
  );
}
