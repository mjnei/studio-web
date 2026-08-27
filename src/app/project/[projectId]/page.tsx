"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { formatRelativeTimeAgo, formatSessionResumeMessage } from "@/lib/utils/time-format";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useI18n } from "@/i18n";
import { useToast } from "@/components/ui/toast";

const STEP_ORDER = ["source", "script", "voice", "details", "preview", "compose", "export"];

export default function ProjectResumePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, isLoading } = useProjectState(projectId);
  const { t } = useI18n();
  const toast = useToast();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (isLoading || !state || didRedirect.current) return;
    didRedirect.current = true;

    let targetStep = state.lastStep || "source";
    if (!STEP_ORDER.includes(targetStep)) {
      targetStep = "source";
    }

    const timeAgo = formatRelativeTimeAgo(state.updatedAt || state.createdAt);
    toast.info(t("project.shell.sessionRestoredTitle"), formatSessionResumeMessage(timeAgo, t));
    router.replace(`/project/${projectId}/${targetStep}`);
  }, [isLoading, state, projectId, router, toast, t]);

  return <PageLoadingSkeleton message={t("project.common.loadingProject")} />;
}
