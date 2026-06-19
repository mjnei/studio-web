import Link from "next/link";
import { Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between fade-in">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Projects</h1>
          <p className="text-text-secondary">Create and manage your projects</p>
        </div>
        <Button variant="primary" size="lg">
          <Link href="/project/new">Create New Project</Link>
        </Button>
      </div>

      {/* Empty State */}
      <Card variant="elevated" padding="lg" className="fade-in">
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-secondary to-accent-tertiary shadow-lg">
              <Folder className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              No projects yet
            </h2>
            <p className="text-text-secondary mb-8 max-w-md">
              Get started by creating your first project. You can manage all your projects and renders from here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="primary" size="lg">
                <Link href="/project/new">Create Your First Project</Link>
              </Button>
              <Button variant="secondary" size="lg">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card variant="glass" padding="md" className="mt-6 border-border-subtle fade-in">
        <CardHeader>
          <CardTitle className="text-sm">💡 Pro Tip</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary">
            Projects help you organize your voice recordings, renders, and media. Each project can have multiple renders with different settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
