"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n";

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

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-cyan border-r-transparent" />
        <p className="text-text-secondary">{t("common.loading")}</p>
      </div>
    </div>
  );
}
