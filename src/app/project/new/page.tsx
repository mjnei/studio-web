"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";

/**
 * This page redirects to the movie selection step.
 * No project is created - the user just browses and selects a movie.
 * Project creation happens when the first script is generated.
 */
export default function NewProjectPage() {
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    // Redirect to standalone movie selection page
    router.replace("/project/new/source");
  }, [router]);

  return <PageLoadingSkeleton message={t("common.loading")} />;
}
