import { redirect } from "next/navigation";

/**
 * Entry point for new project creation.
 * Redirects immediately to movie selection — no project exists yet.
 */
export default function NewProjectPage() {
  redirect("/project/new/source");
}
