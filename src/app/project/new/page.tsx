import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "New Project",
  "Start a new video project in Huavoi Studio."
);

/**
 * Entry point for new project creation.
 * Redirects immediately to movie selection — no project exists yet.
 */
export default function NewProjectPage() {
  redirect("/project/new/source");
}
