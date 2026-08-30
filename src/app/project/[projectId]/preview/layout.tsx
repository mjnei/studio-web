import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Voice Preview",
  "Preview generated voice audio before rendering."
);

export default function ProjectPreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
