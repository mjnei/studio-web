import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Help & Documentation",
  "Learn how to use Huavoi Studio from start to finish."
);

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
