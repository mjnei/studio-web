import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Export Project",
  "Export and download your finished video."
);

export default function ProjectExportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
