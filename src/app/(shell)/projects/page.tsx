"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Folder, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listProjects, tmdbImageUrl, type ProjectResponse } from "@/lib/project-client";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listProjects(true)
      .then((data) => {
        if (!cancelled) {
          setProjects(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load projects");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4 fade-in">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Projects</h1>
          <p className="text-text-secondary">Create and manage your projects</p>
        </div>
        <Link href="/project/new">
          <Button variant="primary" size="md" icon={<Plus className="h-4 w-4" />}>
            New Project
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card variant="elevated" padding="lg" className="fade-in">
          <CardContent>
            <div className="py-12 text-center text-text-secondary">Loading projects...</div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card variant="elevated" padding="lg" className="fade-in">
          <CardContent>
            <div className="py-12 text-center text-status-failed">{error}</div>
          </CardContent>
        </Card>
      ) : projects.length === 0 ? (
        <Card variant="elevated" padding="lg" className="fade-in">
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-secondary to-accent-tertiary shadow-lg">
                <Folder className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">No projects yet</h2>
              <p className="text-text-secondary mb-8 max-w-md">
                Get started by creating your first project.
              </p>
              <Link href="/project/new">
                <Button variant="primary" size="lg">
                  Create Your First Project
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/project/${project.id}/${project.last_step}`}>
              <Card variant="elevated" padding="none" interactive className="overflow-hidden">
                <div className="aspect-video bg-surface-raised">
                  {project.movie?.backdrop_path || project.movie?.poster_path ? (
                    <img
                      src={tmdbImageUrl(project.movie.backdrop_path ?? project.movie.poster_path, "w780")}
                      alt={project.movie?.title ?? "Project movie"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Folder className="h-10 w-10 text-text-muted" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-text-primary">
                        {project.movie?.title ?? "Untitled project"}
                      </h2>
                      <p className="mt-1 text-xs text-text-muted">
                        Step: {project.last_step} • Status: {project.status}
                      </p>
                    </div>
                    <span className="rounded-full bg-surface-raised px-2 py-1 text-xs text-text-secondary">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
