import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Script",
  "Generate and edit your project script."
);

export default function ProjectScriptLayout({ children }: { children: React.ReactNode }) {
  return children;
}
