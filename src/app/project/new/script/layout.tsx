import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Generate Script",
  "Create the script for your new project."
);

export default function NewProjectScriptLayout({ children }: { children: React.ReactNode }) {
  return children;
}
