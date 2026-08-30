import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Select a Movie",
  "Choose a source movie for your new project."
);

export default function NewProjectSourceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
