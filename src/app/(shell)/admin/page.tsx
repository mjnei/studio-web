import type { Metadata } from "next";
import { createAdminMetadata } from "@/lib/metadata";
import AdminDashboard from "./admin-dashboard";

export const metadata: Metadata = createAdminMetadata(
  "Dashboard",
  "Platform administration overview"
);

export default function AdminPage() {
  return <AdminDashboard />;
}
