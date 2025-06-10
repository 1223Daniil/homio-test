"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { MapMarker, ProjectWithRelations } from "./types";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Container } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { LoadingOverlay } from "@mantine/core";
import { Map as MapIcon } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { ProjectCardForPage } from "@/components/projects/ProjectCardForPage";
import { ProjectCardSearchResult } from "@/components/projects/ProjectCardSearchResult";
import { SearchForm } from "@/components/search/SearchForm";
import { SearchPageMap } from "./components/SearchPageMap";
import { SearchResultsMap } from "@/components/SearchResultsMap";
import { Suspense } from "react";
import { UnitCardSearchResult } from "@/components/projects/UnitCardSearchResult";
import type { UnitWithRelations } from "@/components/projects/UnitCardSearchResult";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const PROJECTS_PER_PAGE = 3;

// Hero background image
const heroImage = {
  url: "/images/hero/banner-1.webp",
  alt: "Find your dream property",
  blurDataURL: "data:image/jpeg;base64,..."
};

interface PublicSearchPageProps {
  initialResults: ProjectWithRelations[];
  filterConfig: {
    bedrooms: { min: number; max: number };
    prices: { min: number; max: number };
  };
  pagination: { currentPage: number; totalPages: number; baseUrl: string };
}

export function PublicSearchPage({
  initialResults,
  filterConfig,
  pagination
}: PublicSearchPageProps) {
  const t = useTranslations("Search");
  const searchParams = useSearchParams();

  // Добавляем логирование при инициализации
  console.log("=== Initial Config ===", { filterConfig, initialResults });

  const [loading, setLoading] = useState(false);
  const [markersLoading, setMarkersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<"units" | "projects">(
    (searchParams.get("type") as "units" | "projects") || "projects"
  );
  const [sortBy, setSortBy] = useState<"relevance" | "price" | "completion">(
    "relevance"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [projects, setProjects] =
    useState<ProjectWithRelations[]>(initialResults);
  const [units, setUnits] = useState<UnitWithRelations[]>([]);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [totalCount, setTotalCount] = useState<number>(0);
  const [allData, setAllData] = useState<
    UnitWithRelations[] | ProjectWithRelations[]
  >([]);
  const [itemsPerPage, setItemsPerPage] = useState(PROJECTS_PER_PAGE);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [markersCache, setMarkersCache] = useState<{
    [key: string]: MapMarker[];
  }>({});

  // Мемоизируем вычисление текущей страницы
  const currentPage = useMemo(
    () => Number(searchParams.get("page")) || 1,
    [searchParams]
  );

  // Функция для генерации ключа кэша маркеров
  const getMarkersCacheKey = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("limit");
    return params.toString();
  }, [searchParams]);

  // Функция загрузки маркеров
  const loadMarkers = useCallback(async () => {
    const cacheKey = getMarkersCacheKey();

    // Проверяем кэш
    if (markersCache[cacheKey]) {
      setMapMarkers(markersCache[cacheKey]);
      return;
    }

    try {
      setMarkersLoading(true);

      const searchPayload = {
        propertyType: searchParams.get("propertyType"),
        bedrooms: searchParams.get("bedrooms"),
        bathrooms: searchParams.get("bathrooms"),
        priceMin: searchParams.get("priceMin"),
        priceMax: searchParams.get("priceMax"),
        areaMin: searchParams.get("areaMin"),
        areaMax: searchParams.get("areaMax"),
        completion: searchParams.get("completion"),
        features: searchParams.get("features")?.split(",").filter(Boolean),
        amenities: searchParams.get("amenities")?.split(",").filter(Boolean),
        query: searchParams.get("q"),
        searchType
      };

      const response = await fetch("/api/projects/map-markers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchPayload)
      });

      if (!response.ok) {
        throw new Error("Failed to load markers");
      }

      const data = await response.json();

      if (data.markers) {
        setMapMarkers(data.markers);
        // Кэшируем результат
        setMarkersCache(prev => ({ ...prev, [cacheKey]: data.markers }));
      }
    } catch (error) {
      console.error("Loading markers error:", error);
      toast.error(t("messages.markersError"));
    } finally {
      setMarkersLoading(false);
    }
  }, [searchParams, searchType, t, getMarkersCacheKey, markersCache]);

  const handleSearch = useCallback(async () => {
    try {
      console.log("=== Search Started ===", {
        currentSearchParams: searchParams.toString(),
        priceMin: searchParams.get("priceMin"),
        priceMax: searchParams.get("priceMax"),
        filterConfigPrices: filterConfig.prices
      });

      setProjects([]);
      setUnits([]);
      setError(null);
      setLoading(true);

      const currentSearchType =
        (searchParams.get("type") as "units" | "projects") || "projects";
      setSearchType(currentSearchType);

      const searchPayload = {
        propertyType: searchParams.get("propertyType"),
        bedrooms: searchParams.get("bedrooms"),
        bathrooms: searchParams.get("bathrooms"),
        priceMin:
          searchParams.get("priceMin") || filterConfig.prices.min.toString(),
        priceMax:
          searchParams.get("priceMax") || filterConfig.prices.max.toString(),
        areaMin: searchParams.get("areaMin"),
        areaMax: searchParams.get("areaMax"),
        completion: searchParams.get("completion"),
        features: searchParams.get("features")?.split(",").filter(Boolean),
        amenities: searchParams.get("amenities")?.split(",").filter(Boolean),
        query: searchParams.get("q"),
        page: currentPage,
        limit: itemsPerPage,
        searchType: currentSearchType,
        sortBy,
        sortDirection
      };

      const searchResponse = await fetch("/api/projects/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchPayload)
      });

      console.log("=== Search Response ===", { searchResponse });

      if (!searchResponse.ok) {
        throw new Error("Search request failed");
      }

      const searchData = await searchResponse.json();

      console.log("=== API Response ===", { searchData });

      if (searchData.error) {
        throw new Error(searchData.error);
      }

      // Обновляем состояние результатов поиска
      if (currentSearchType === "units") {
        setUnits(searchData.units || []);
      } else {
        setProjects(searchData.projects || []);
      }

      if (searchData.totalCount) {
        setTotalCount(searchData.totalCount);
        const newTotalPages = Math.ceil(searchData.totalCount / itemsPerPage);
        pagination.totalPages = newTotalPages;
      }

      // Если карта активна, загружаем маркеры
      if (showMap) {
        loadMarkers();
      }
    } catch (error) {
      console.error("Search error:", error);
      setError(error instanceof Error ? error.message : t("messages.error"));
      toast.error(error instanceof Error ? error.message : t("messages.error"));
    } finally {
      setLoading(false);
    }
  }, [
    searchParams,
    t,
    currentPage,
    itemsPerPage,
    sortBy,
    sortDirection,
    filterConfig,
    pagination,
    showMap,
    loadMarkers
  ]);

  const handleSortChange = useCallback(
    (newSortBy: "relevance" | "price" | "completion") => {
      const newDirection =
        sortBy === newSortBy && sortDirection === "asc" ? "desc" : "asc";
      setSortBy(newSortBy);
      setSortDirection(newDirection);
      handleSearch();
    },
    [sortBy, sortDirection, handleSearch]
  );

  // Оптимизируем зависимости useEffect
  useEffect(() => {
    if (!isInitialMount || searchParams.toString()) {
      handleSearch();
    }
  }, [handleSearch, isInitialMount, searchParams]);

  // Мемоизируем обработчик изменения количества элементов на странице
  const handleItemsPerPageChange = useCallback(
    (newValue: number) => {
      setItemsPerPage(newValue);
      const newTotalPages = Math.ceil(totalCount / newValue);
      pagination.totalPages = newTotalPages;
      handleSearch();
    },
    [totalCount, pagination, handleSearch]
  );

  // Add effect to log state changes
  useEffect(() => {
    console.log("=== State Update ===", {
      searchType,
      projectsCount: projects.length,
      unitsCount: units.length,
      markersCount: mapMarkers.length,
      showMap,
      view,
      loading,
      error: error ? "Error occurred" : null
    });
  }, [
    searchType,
    projects.length,
    units.length,
    mapMarkers.length,
    showMap,
    view,
    loading,
    error
  ]);

  // Эффект для загрузки маркеров при активации карты
  useEffect(() => {
    if (showMap) {
      loadMarkers();
    }
  }, [showMap, loadMarkers]);

  // Очистка кэша при размонтировании компонента
  useEffect(() => {
    return () => {
      setMarkersCache({});
    };
  }, []);

  console.log("=== Component Render ===", {
    searchType,
    projectsCount: projects.length,
    unitsCount: units.length,
    markersCount: mapMarkers.length,
    showMap,
    paginationState: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Search Section */}
      <div className="bg-white">
        <Container size="xl" className="px-4 py-4 pt-24 pb-6">
          {/* Search Form */}
          <div className="w-full">
            <SearchForm
              onSearch={handleSearch}
              filterData={filterConfig}
              onMapViewChange={setShowMap}
            />
          </div>
        </Container>
      </div>

      {/* Results Section */}
      <div className="bg-background min-h-screen">
        <Container size="xl" className="px-4 py-6">
          {/* Header with Map Preview */}
          {!showMap && (
            <>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    {t("catalog")} • {t("searchResult")}
                  </div>
                  <h1 className="text-2xl font-semibold">{t("resultTitle")}</h1>
                </div>

                <div className="relative w-full lg:w-auto">
                  <div className="aspect-[3/1] lg:aspect-auto lg:w-[420px] lg:h-[140px] relative">
                    <Image
                      src="/images/maps mockup.png"
                      alt="Map preview"
                      fill
                      className="rounded-lg object-cover"
                    />
                    <button
                      onClick={() => setShowMap(true)}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white shadow-md hover:bg-gray-50 text-sm transition-colors whitespace-nowrap"
                    >
                      <MapIcon className="w-4 h-4" />
                      {t("showAsMap")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Filters */}
              {/* <div className="flex flex-wrap gap-3 mb-6">
            <button className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm">
              <span className="font-medium">{'< 10 min to beach'}</span> • 10
            </button>
            <button className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm">
              <span className="font-medium">Pet-friendly</span> • 25
            </button>
            <button className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm">
              <span className="font-medium">Guaranteed income</span> • 17
            </button>
            <button className="px-4 py-2 rounded-full border border-gray-200 text-sm">
              Show more
            </button>
            <button className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              AI-consultant
            </button>
          </div> */}
            </>
          )}

          {/* Results Controls - always visible */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {loading ? (
                  <span className="animate-pulse">{t("searching")}</span>
                ) : (
                  <span>
                    {totalCount}{" "}
                    {searchType === "units" ? t("units") : t("projects")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => handleSortChange("relevance")}
                  className={cn(
                    sortBy === "relevance"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-gray-900",
                    "flex items-center gap-1",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={loading}
                >
                  {t("sort.relevance")}
                  {sortBy === "relevance" && (
                    <span className="text-xs">
                      {loading ? (
                        <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin ml-1"></span>
                      ) : sortDirection === "asc" ? (
                        "↑"
                      ) : (
                        "↓"
                      )}
                    </span>
                  )}
                </button>
                <span className="text-gray-300">•</span>
                <button
                  onClick={() => handleSortChange("price")}
                  className={cn(
                    sortBy === "price"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-gray-900",
                    "flex items-center gap-1",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={loading}
                >
                  {t("sort.price")}
                  {sortBy === "price" && (
                    <span className="text-xs">
                      {loading ? (
                        <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin ml-1"></span>
                      ) : sortDirection === "asc" ? (
                        "↑"
                      ) : (
                        "↓"
                      )}
                    </span>
                  )}
                </button>
                <span className="text-gray-300">•</span>
                <button
                  onClick={() => handleSortChange("completion")}
                  className={cn(
                    sortBy === "completion"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-gray-900",
                    "flex items-center gap-1",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={loading}
                >
                  {t("sort.completion")}
                  {sortBy === "completion" && (
                    <span className="text-xs">
                      {loading ? (
                        <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin ml-1"></span>
                      ) : sortDirection === "asc" ? (
                        "↑"
                      ) : (
                        "↓"
                      )}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {showMap && (
              <button
                onClick={() => setShowMap(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-600"
              >
                {t("showAsList")}
                <MapIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results Display */}
          {showMap ? (
            <div className="h-[calc(100vh-200px)] w-full rounded-lg overflow-hidden relative">
              {loading || markersLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <div className="text-sm text-gray-600">
                      {loading ? t("loadingResults") : t("loadingMarkers")}
                    </div>
                  </div>
                </div>
              ) : mapMarkers.length > 0 ? (
                <SearchPageMap
                  markers={mapMarkers}
                  searchType={searchType}
                  loading={loading || markersLoading}
                  defaultCenter={[7.8804, 98.3923]}
                  onMarkerClick={id => {
                    console.log("Clicked marker:", id);
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">
                      {t("noLocationsToDisplayOnMap")}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t("tryAdjustingSearchFilters")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Results Grid */}
              <div className="grid gap-6 relative min-h-[200px]">
                {loading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <div className="text-sm text-gray-600">
                        {t("loadingResults")}
                      </div>
                    </div>
                  </div>
                )}
                <AnimatePresence mode="wait">
                  {error ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="col-span-full p-4 bg-red-50 text-red-600 rounded-lg"
                    >
                      {error}
                    </motion.div>
                  ) : (searchType === "units" ? units : projects).length ===
                      0 && !loading ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="col-span-full p-8 text-center"
                    >
                      <div className="max-w-md mx-auto">
                        <h3 className="text-xl font-semibold mb-2">
                          {t("nothingToShow")}
                        </h3>
                        <p className="text-gray-600">
                          {t("tryAdjustingFilter")}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      {searchType === "units"
                        ? // Отображаем карточки юнитов
                          units.map(unit => (
                            <motion.div
                              key={unit.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              <UnitCardSearchResult
                                unit={unit}
                                unitsImages={unit.media || []}
                              />
                            </motion.div>
                          ))
                        : // Отображаем карточки проектов
                          projects.map(project => (
                            <motion.div
                              key={project.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ProjectCardSearchResult project={project} />
                            </motion.div>
                          ))}
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          {/* Pagination - показываем только в режиме списка и если есть результаты */}
          {!showMap && totalCount > 0 && (
            <div className="flex items-center justify-between mt-8">
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 hidden md:inline">
                  {t("itemsPerPage")}:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={e =>
                    handleItemsPerPageChange(parseInt(e.target.value))
                  }
                  className="h-9 rounded-md border border-gray-200 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={t("itemsPerPage")}
                >
                  <option value="3">3</option>
                  <option value="6">6</option>
                  <option value="9">9</option>
                  <option value="12">12</option>
                </select>
              </div>
              <Suspense>
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  baseUrl={pagination.baseUrl}
                />
              </Suspense>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}
