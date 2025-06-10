"use client";

import { useCallback, useEffect, useState } from "react";

import { UserRole } from "@prisma/client";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";

interface DeveloperTranslation {
  language: string;
  name: string;
  description?: string | null;
}

interface Developer {
  id: string;
  translations: DeveloperTranslation[];
  logo?: string | null;
  website?: string | null;
}

export function useDevelopers() {
  const locale = useLocale();
  const { data: session, status } = useSession();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevelopers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/developers?locale=${locale}`);

      if (!response.ok) {
        throw new Error("Failed to fetch developers");
      }

      const data = await response.json();

      // Если пользователь имеет роль DEVELOPER и developerId,
      // логируем информацию для отладки
      if (
        session?.user?.role === UserRole.DEVELOPER &&
        session.user.developerId
      ) {
        console.log("Developer session:", {
          role: session.user.role,
          developerId: session.user.developerId,
          receivedDevelopers: data.length,
          developerIds: data.map((d: Developer) => d.id)
        });
      }

      setDevelopers(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching developers:", error);
      setError("Failed to fetch developers");
    } finally {
      setIsLoading(false);
    }
  }, [locale, session]);

  useEffect(() => {
    if (status !== "loading") {
      fetchDevelopers();
    }
  }, [fetchDevelopers, status]);

  const refreshDevelopers = useCallback(() => {
    return fetchDevelopers();
  }, [fetchDevelopers]);

  return {
    developers,
    isLoading: isLoading || status === "loading",
    error,
    refreshDevelopers,
    isDeveloperUser: session?.user?.role === UserRole.DEVELOPER
  };
}
