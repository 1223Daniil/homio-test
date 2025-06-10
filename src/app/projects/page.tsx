"use client";

import React from "react";
import { Suspense } from "react";
import { ProjectList } from "@/components/projects/ProjectList";
import Loading from "./loading";
import { useProjects } from "@/hooks/useProjects";

export default function ProjectsPage() {
  const { projects, isLoading, error } = useProjects();

  if (error) {
    return <div>Error loading projects</div>;
  }

  return (
    <div className="py-4">
      <h1 className="text-2xl font-bold mb-4">All Projects</h1>

      <Suspense fallback={<Loading />}>
        {isLoading || !projects ? (
          <Loading />
        ) : (
          <ProjectList projects={projects} />
        )}
      </Suspense>
    </div>
  );
}
