"use client";

import useSWR from "swr";
import { DomainProject } from "@/types/domain";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Ошибка загрузки проектов");
  }
  return res.json();
};

export function useProjects(options = {}) {
  const {
    data: projects,
    error,
    mutate,
    isLoading
  } = useSWR<DomainProject[]>("/api/projects", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 10000,
    ...options
  });

  return {
    projects,
    isLoading,
    error,
    mutate
  };
}
