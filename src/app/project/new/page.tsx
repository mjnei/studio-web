"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * This page redirects to the first step of the new project workflow.
 * The actual workflow is now integrated into the project shell at:
 * /project/[projectId]/source (Step 1: Movie Selection)
 * /project/[projectId]/script (Step 2: Script Generation)
 * /project/[projectId]/voice (Step 3: Voice Generation)
 * /project/[projectId]/compose (Step 4: Video Composition)
 */
export default function NewProjectPage() {
  const router = useRouter();

  useEffect(() => {
    // Create a new draft project and redirect to the source step
    const createDraftProject = async () => {
      // In a real implementation, this would call an API to create a draft project
      // For now, we'll use a temporary ID
      const draftId = `draft-${Date.now()}`;
      router.replace(`/project/${draftId}/source`);
    };

    createDraftProject();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-cyan border-r-transparent" />
        <p className="text-text-secondary">Creating your project...</p>
      </div>
    </div>
  );
}
