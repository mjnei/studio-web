import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Project Details",
  "Configure project title, thumbnail, and metadata."
);

export default function ProjectDetailsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
