"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { ProjectCardForPage } from "@/components/projects/ProjectCardForPage";
import { LoadingOverlay } from "@mantine/core";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectWithRelations } from "@/app/[locale]/search/types";

// Динамический импорт карты, без SSR
const SearchResultsMap = dynamic(
  () =>
    import("@/components/SearchResultsMap").then(mod => mod.SearchResultsMap),
  {
    ssr: false,
    loading: () => <div className="h-full bg-gray-100 animate-pulse" />
  }
);

interface SearchResultsProps {
  loading: boolean;
  error: string | null;
  projects: ProjectWithRelations[];
  mapMarkers: any[];
  showMap: boolean;
  view: "grid" | "list";
  onClose: () => void;
  onToggleMap: () => void;
  onToggleView: (view: "grid" | "list") => void;
}

export function SearchResults({
  loading,
  error,
  projects,
  mapMarkers,
  showMap,
  view,
  onClose,
  onToggleMap,
  onToggleView
}: SearchResultsProps) {
  const t = useTranslations("Search");

  // Для плавного появления компонента без framer-motion
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // монтируемся на клиенте и запускаем анимацию через CSS
    setMounted(true);
  }, []);

  // Мемозируем маркеры, если нужна дополнительная логика
  const memoMarkers = useMemo(() => mapMarkers, [mapMarkers]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 top-[72px] bg-background z-50 transition-all duration-300 ease-out",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      )}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="bg-background rounded-xl shadow-xl p-6">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                {projects.length} {t("resultsFound")}
              </h2>
              <div className="h-6 w-px bg-divider" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleView("grid")}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    view === "grid"
                      ? "bg-primary/10 text-primary"
                      : "text-default-600 hover:bg-default-100"
                  )}
                >
                  {/* SVG-grid icon */}
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                </button>
                <button
                  onClick={() => onToggleView("list")}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    view === "list"
                      ? "bg-primary/10 text-primary"
                      : "text-default-600 hover:bg-default-100"
                  )}
                >
                  {/* SVG-list icon */}
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={onToggleMap}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-divider hover:bg-default-100 transition-colors"
              >
                {showMap ? t("hideMap") : t("showMap")}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-default-100 transition-colors"
                aria-label="Close search results"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <LoadingOverlay visible={loading} />

          <div
            className={cn(
              "grid gap-6",
              showMap ? "grid-cols-[1fr_400px]" : "grid-cols-1"
            )}
          >
            {/* Results List */}
            <div
              className={cn(
                "grid gap-6",
                showMap
                  ? "grid-cols-1"
                  : view === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
              )}
            >
              {error ? (
                <div className="col-span-full p-4 bg-danger-50 text-danger rounded-lg">
                  {error}
                </div>
              ) : projects.length === 0 ? (
                <div className="col-span-full p-8 bg-default-50 text-center rounded-lg">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-semibold mb-2">
                      {t("noResults")}
                    </h3>
                    <p className="text-default-600">
                      {t("tryAdjustingFilters")}
                    </p>
                  </div>
                </div>
              ) : (
                // При большом количестве элементов заменить на виртуализацию.
                projects.map(project => (
                  <div
                    key={project.id}
                    className="transition-opacity duration-300 ease-out"
                  >
                    <ProjectCardForPage project={project} />
                  </div>
                ))
              )}
            </div>

            {/* Map */}
            {showMap && (
              <div className="sticky top-6 h-[calc(100vh-12rem)] rounded-xl overflow-hidden">
                <SearchResultsMap markers={memoMarkers} activeType="project" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
