import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Billing & Video Credits",
  "Manage your plan, credits, and billing history."
);

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
