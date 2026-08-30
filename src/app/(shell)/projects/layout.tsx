import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Projects",
  "View and manage your video projects."
);

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
