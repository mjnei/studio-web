import Link from "next/link";
import { Folder, Activity, Mic, Plus, Upload, Settings, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const stats = [
    {
      title: "Recent Projects",
      value: "0",
      description: "Active projects",
      icon: <Folder className="w-6 h-6" />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Active Renders",
      value: "0",
      description: "In progress",
      icon: <Activity className="w-6 h-6" />,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "My Voices",
      value: "0",
      description: "Voice profiles",
      icon: <Mic className="w-6 h-6" />,
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
          <p className="text-text-secondary">Welcome back! Here's your overview.</p>
        </div>
        <Button variant="primary" size="lg" icon={<Plus className="w-5 h-5" />}>
          <Link href="/projects">New Project</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            variant="elevated"
            padding="md"
            interactive
            className="group fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardHeader className="mb-3 p-0">
                  <CardDescription className="mb-1">{stat.title}</CardDescription>
                  <CardTitle className="text-4xl font-bold text-text-primary">
                    {stat.value}
                  </CardTitle>
                </CardHeader>
                <p className="text-xs text-text-muted">{stat.description}</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-md transition-all duration-300 ease-smooth group-hover:scale-110 group-hover:shadow-lg`}
              >
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card variant="elevated" padding="lg" className="mb-8 fade-in">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with these common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="secondary"
              fullWidth
              className="justify-start hover:bg-surface-hover transition-all"
            >
              <Plus className="w-5 h-5" />
              New Project
            </Button>
            <Button
              variant="secondary"
              fullWidth
              className="justify-start hover:bg-surface-hover transition-all"
            >
              <Upload className="w-5 h-5" />
              Upload Media
            </Button>
            <Button
              variant="secondary"
              fullWidth
              className="justify-start hover:bg-surface-hover transition-all"
            >
              <Mic className="w-5 h-5" />
              Add Voice
            </Button>
            <Button
              variant="secondary"
              fullWidth
              className="justify-start hover:bg-surface-hover transition-all"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card variant="elevated" padding="lg" className="fade-in">
        <CardHeader className="mb-6">
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest projects and renders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-hover border border-border-default">
              <Inbox className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-lg font-medium text-text-primary mb-2">No recent activity yet</p>
            <p className="text-text-secondary mb-6 max-w-md">
              Start by creating a new project to see your activity here.
            </p>
            <Button variant="primary">
              <Link href="/projects">Create Your First Project</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
