import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import ProjectResumePage from "./project-resume";

export const metadata: Metadata = createPageMetadata(
  "Project",
  "Resume your project workflow."
);

export default function ProjectPage() {
  return <ProjectResumePage />;
}
