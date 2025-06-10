"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import { debug } from "@/utils/debug";
import { DomainProject } from "@/types/domain";

export function useProject(projectId: string) {
  const [project, setProject] = useState<DomainProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const locale = pathname.split("/")[1];

  const fetchProject = async () => {
    if (!projectId) {
      setProject(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      debug.log("Fetching project", {
        component: "useProject",
        action: "fetch",
        data: { locale, projectId }
      });

      const response = await fetch(
        `/api/projects/${projectId}?locale=${locale}`,
        {
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache"
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        debug.error(
          new Error(errorData.error || "Failed to fetch project"),
          "useProject"
        );
        throw new Error(errorData.error || "Failed to fetch project");
      }

      const data = await response.json();
      debug.log("Project fetched successfully", {
        component: "useProject",
        action: "success",
        data
      });

      setProject(data);
      setError(null);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch project");
      debug.error(error, "useProject");
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [locale, projectId]);

  return { project, loading, error, refetch: fetchProject };
}
