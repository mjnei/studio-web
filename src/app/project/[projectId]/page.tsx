"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { formatRelativeTimeAgo } from "@/lib/utils/time-format";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useI18n } from "@/i18n";

const STEP_ORDER = ["source", "script", "voice", "details", "preview", "compose", "export"];

export default function ProjectResumePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, isLoading } = useProjectState(projectId);
  const { t } = useI18n();

  useEffect(() => {
    if (isLoading || !state) return;

    // Determine target step: use last_step if valid or calculate furthest completed
    let targetStep = state.lastStep || "source";
    if (!STEP_ORDER.includes(targetStep)) {
      targetStep = "source";
    }

    const timeAgo = formatRelativeTimeAgo(state.updatedAt || state.createdAt);
    const targetUrl = `/project/${projectId}/${targetStep}?resumed=true&timeAgo=${encodeURIComponent(timeAgo)}`;

    router.replace(targetUrl);
  }, [isLoading, state, projectId, router]);

  return <PageLoadingSkeleton message={t("project.common.loadingProject")} />;
}
