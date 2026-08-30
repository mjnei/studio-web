import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Compose Video",
  "Arrange tracks and compose your final video."
);

export default function ProjectComposeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
