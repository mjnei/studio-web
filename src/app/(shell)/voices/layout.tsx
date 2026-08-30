import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Voices",
  "Browse, record, and manage voice profiles."
);

export default function VoicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
