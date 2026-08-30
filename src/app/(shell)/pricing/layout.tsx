import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Pricing",
  "Simple, transparent pricing for video generation credits."
);

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
