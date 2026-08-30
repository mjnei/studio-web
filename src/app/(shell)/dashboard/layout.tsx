import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Dashboard",
  "Welcome back! Here's your overview."
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
