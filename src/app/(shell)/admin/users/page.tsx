"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Users } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/toast";
import {
  deleteAdminUser,
  getAdminUser,
  getAdminUserStats,
  getAdminUsers,
  removeAdminUserPicture,
  resetAdminUserPassword,
  setAdminUserPassword,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "@/lib/api/admin-users-client";
import type { AdminUser, AdminUserFilter, AdminUserRole, AdminUserStats } from "@/types/admin";
import { UserDetailModal } from "./components/UserDetailModal";
import { UserFilters } from "./components/UserFilters";
import { UserStatsCard } from "./components/UserStatsCard";
import { UsersTable } from "./components/UsersTable";

export default function AdminUsersPage() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filters, setFilters] = useState<AdminUserFilter>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsData, listData] = await Promise.all([
        getAdminUserStats(),
        getAdminUsers(pagination.page, pagination.pageSize, filters),
      ]);
      setStats(statsData);
      setUsers(listData.users);
      setPagination((prev) => ({ ...prev, total: listData.total }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to load users", message);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize, toast]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getAdminUserStats(), getAdminUsers(pagination.page, pagination.pageSize, filters)])
      .then(([statsData, listData]) => {
        if (cancelled) return;
        setStats(statsData);
        setUsers(listData.users);
        setPagination((prev) => ({ ...prev, total: listData.total }));
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "An error occurred";
        toast.error("Failed to load users", message);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filters, pagination.page, pagination.pageSize, toast]);

  function handleRefresh() {
    setIsLoading(true);
    void loadData();
  }

  function handleFilterChange(next: AdminUserFilter) {
    setFilters(next);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function handleClearFilters() {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  async function handleRoleChange(userId: number, role: AdminUserRole) {
    try {
      const updated = await updateAdminUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
      setSelected(updated);
      toast.success("Role updated", `User #${userId} is now ${role}`);
      const statsData = await getAdminUserStats();
      setStats(statsData);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to update role", message);
      throw error;
    }
  }

  async function handleStatusChange(userId: number, isActive: boolean) {
    try {
      const updated = await updateAdminUserStatus(userId, isActive);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
      setSelected(updated);
      toast.success(isActive ? "Account reactivated" : "Account suspended", `User #${userId}`);
      const statsData = await getAdminUserStats();
      setStats(statsData);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to update status", message);
      throw error;
    }
  }

  async function handleSetPassword(userId: number, password: string): Promise<void> {
    try {
      const updated = await setAdminUserPassword(userId, password);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
      setSelected(updated);
      toast.success(updated.has_password ? "Password updated" : "Password set", `User #${userId}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to set password", message);
      throw error;
    }
  }

  async function handleClearPassword(userId: number): Promise<void> {
    try {
      await resetAdminUserPassword(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, has_password: false } : u)));
      setSelected((prev) => (prev?.id === userId ? { ...prev, has_password: false } : prev));
      toast.success("Password cleared", `User #${userId} must set a new password`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to clear password", message);
      throw error;
    }
  }

  async function handleRemovePicture(userId: number): Promise<void> {
    try {
      const updated = await removeAdminUserPicture(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, picture_url: null } : u)));
      setSelected((prev) => (prev?.id === userId ? { ...prev, picture_url: null } : prev));
      toast.success("Picture removed", updated.message);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to remove picture", message);
      throw error;
    }
  }

  async function handleViewUser(user: AdminUser) {
    try {
      const detail = await getAdminUser(user.id, user.is_deleted);
      setSelected(detail);
      setModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to load user", message);
    }
  }

  async function handleDelete(user: AdminUser) {
    try {
      const result = await deleteAdminUser(user.id);
      toast.success(
        "User deleted",
        `Removed ${result.projects_deleted} projects and ${result.voices_deleted} voices`
      );
      setModalOpen(false);
      setSelected(null);
      await loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to delete user", message);
      throw error;
    }
  }

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="mb-3 inline-flex items-center gap-1.5 text-body text-text-muted hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <Heading variant="page" as="h1" className="text-text-primary">
                Users
              </Heading>
              <p className="text-body text-text-secondary">
                Manage accounts, roles, and access across the platform
              </p>
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={handleRefresh}
          leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />}
        >
          Refresh
        </Button>
      </div>

      {stats ? <UserStatsCard stats={stats} /> : <LoadingSpinner />}

      <UserFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <UsersTable
        users={users}
        isLoading={isLoading && users.length === 0}
        onView={handleViewUser}
      />

      {pagination.total > 0 && (
        <div className="flex items-center justify-between text-body text-text-secondary">
          <span>
            Page {pagination.page} of {totalPages} · {pagination.total} users
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pagination.page >= totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <UserDetailModal
        user={selected}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        onSetPassword={handleSetPassword}
        onClearPassword={handleClearPassword}
        onRemovePicture={handleRemovePicture}
        onDelete={handleDelete}
      />
    </div>
  );
}
