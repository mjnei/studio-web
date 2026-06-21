"use client";

import { useAuth } from "@/lib/auth-context";

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === "admin";
}

export function useRequireAdmin(): void {
  const isAdmin = useIsAdmin();
  if (!isAdmin) {
    throw new Error("Admin access required");
  }
}
