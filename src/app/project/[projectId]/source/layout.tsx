import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Source Movie",
  "Choose a source movie for your project."
);

export default function ProjectSourceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
