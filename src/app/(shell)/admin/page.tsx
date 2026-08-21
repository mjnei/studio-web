"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Film, Mic, ShieldCheck, Database, Users, Settings, BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Heading } from "@/components/ui/heading";
import { getAdminStats, type AdminStatsResponse } from "@/lib/api/admin";

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        const message = err instanceof Error ? err.message : "Failed to fetch statistics";
        setError(message);
        // Set default values on error
        setStats({
          total_movies: 0,
          active_voices: 0,
          total_users: 0,
          projects_created: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsDisplay = [
    {
      label: "Total Movies",
      value: stats ? stats.total_movies.toLocaleString() : "-",
      icon: Film,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Active Voices",
      value: stats ? stats.active_voices.toLocaleString() : "-",
      icon: Mic,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Total Users",
      value: stats ? stats.total_users.toLocaleString() : "-",
      icon: Users,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Projects Created",
      value: stats ? stats.projects_created.toLocaleString() : "-",
      icon: BarChart3,
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Admin Dashboard"
        description="Manage movies and voices catalog for the Huavoi platform"
      />

      {error && (
        <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsDisplay.map((stat) => {
          const Icon = stat.icon;
          // Map stats to navigation links
          let href = "/admin";
          if (stat.label === "Total Movies") href = "/admin/movies";
          else if (stat.label === "Active Voices") href = "/admin/voices";
          else if (stat.label === "Total Users") href = "/admin/users";
          else if (stat.label === "Projects Created") href = "/admin/stats";

          return (
            <Link key={stat.label} href={href}>
              <Card
                variant="elevated"
                padding="md"
                className="group hover:border-accent-primary/40 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted mb-1">{stat.label}</p>
                    <Heading variant="metric" className="text-text-primary">{stat.value}</Heading>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Admin Features */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>Admin Features</CardTitle>
              <CardDescription>Available management capabilities</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center flex-shrink-0">
                <Film className="w-4 h-4 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">Movie Management</p>
                <p className="text-xs text-text-secondary">
                  Full TMDB integration with cast, crew, genres, and multi-language support
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center flex-shrink-0">
                <Mic className="w-4 h-4 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">Voice Catalog</p>
                <p className="text-xs text-text-secondary">
                  Manage stock voices, toggle availability, and configure voice settings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center flex-shrink-0">
                <Database className="w-4 h-4 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">Bulk Operations</p>
                <p className="text-xs text-text-secondary">
                  Import multiple movies or voices at once with batch processing
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center flex-shrink-0">
                <Settings className="w-4 h-4 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">Audit Logs</p>
                <p className="text-xs text-text-secondary">
                  All operations are logged for compliance and audit trail
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
