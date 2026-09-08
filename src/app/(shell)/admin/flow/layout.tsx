import type { Metadata } from "next";
import { createAdminMetadata } from "@/lib/metadata";

export const metadata: Metadata = createAdminMetadata(
  "Flow Video Jobs",
  "Submit and monitor multilingual Flow video jobs."
);

export default function FlowAdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
