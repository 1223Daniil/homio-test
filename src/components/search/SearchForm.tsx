"use client";

import {
  Bath,
  Building2,
  Map,
  Ruler,
  Search,
  Timer,
  Wallet,
  X,
  Hotel,
  HomeIcon,
  Warehouse,
  Castle,
  School
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  useSearchParams as useNextSearchParams,
  useRouter
} from "next/navigation";
import dynamic from "next/dynamic";

import { ProjectType } from "@prisma/client";
import { UnitLayoutType } from "@prisma/client";
import React from "react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

const Slider = dynamic(() =>
  import("@/components/ui/Slider").then(mod => mod.Slider)
);

interface Suggestion {
  id: string;
  type: "project" | "location" | "developer";
  title: string;
  subtitle?: string;
}

export interface SearchFormProps {
  onSearch?: () => void;
  filterData: {
    bedrooms: { min: number; max: number };
    prices: { min: number; max: number };
  };
  onMapViewChange?: (showMap: boolean) => void;
  className?: string;
}

interface UnitLayoutTypeItem {
  value: UnitLayoutType;
  label: string;
  icon: React.ReactNode;
}

interface PropertyTypeItem {
  value: ProjectType;
  label: string;
  icon: React.ReactNode;
}

export function SearchForm({
  onSearch,
  filterData,
  onMapViewChange
}: SearchFormProps): JSX.Element {
  const t = useTranslations("Search");
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useNextSearchParams();

  // Move DEFAULT_VALUES inside component to access filterData
  const DEFAULT_VALUES = useMemo(
    () => ({
      searchType: "units" as const,
      propertyType: "",
      bedrooms: "",
      bathrooms: "",
      priceRange: [
        filterData.prices.min || 0,
        filterData.prices.max || 100000000
      ] as [number, number],
      area: [0, 1000] as [number, number],
      searchQuery: "",
      completion: "",
      features: new Set<string>(),
      amenities: new Set<string>(),
      showMap: false
    }),
    [filterData]
  );

  const { bedrooms: bedroomsData, prices: pricesRange } = filterData;
  const bedroomsRange = Array.from(
    { length: bedroomsData.max - bedroomsData.min + 1 },
    (_, i) => {
      const bedroomNumber = i + bedroomsData.min;
      if (i === 0) {
        return { value: "", label: t("allBedrooms") };
      } else {
        return { value: bedroomNumber.toString(), label: t("bedrooms.0Bed") };
      }
    }
  );

  // Initialize states with URL params or defaults
  const [searchType, setSearchType] = useState<"units" | "projects">(
    (searchParams.get("type") as "units" | "projects") ||
      DEFAULT_VALUES.searchType
  );
  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || DEFAULT_VALUES.propertyType
  );
  const [bedrooms, setBedrooms] = useState(
    searchParams.get("bedrooms") || DEFAULT_VALUES.bedrooms
  );
  const [bathrooms, setBathrooms] = useState(
    searchParams.get("bathrooms") || DEFAULT_VALUES.bathrooms
  );

  // Initialize price range with URL params or filterData values
  const initialPriceMin =
    Number(searchParams.get("priceMin")) || filterData.prices.min || 0;
  const initialPriceMax =
    Number(searchParams.get("priceMax")) || filterData.prices.max || 100000000;

  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialPriceMin,
    initialPriceMax
  ]);

  // Add effect to update price range when filterData changes
  useEffect(() => {
    if (
      filterData.prices.min !== undefined &&
      filterData.prices.max !== undefined
    ) {
      const urlPriceMin = searchParams.get("priceMin");
      const urlPriceMax = searchParams.get("priceMax");

      if (!urlPriceMin && !urlPriceMax) {
        setPriceRange([filterData.prices.min, filterData.prices.max]);
      }
    }
  }, [filterData.prices, searchParams]);

  const [area, setArea] = useState<[number, number]>([
    Number(searchParams.get("areaMin")) || DEFAULT_VALUES.area[0],
    Number(searchParams.get("areaMax")) || DEFAULT_VALUES.area[1]
  ]);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("q") || DEFAULT_VALUES.searchQuery
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(searchParams.get("view") === "map");
  const [completion, setCompletion] = useState(
    searchParams.get("completion") || DEFAULT_VALUES.completion
  );
  const [features, setFeatures] = useState<Set<string>>(
    new Set(searchParams.get("features")?.split(",") || [])
  );
  const [amenities, setAmenities] = useState<Set<string>>(
    new Set(searchParams.get("amenities")?.split(",") || [])
  );
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [showPropertyTypes, setShowPropertyTypes] = useState(false);
  const [showBedrooms, setShowBedrooms] = useState(false);
  const [priceRangeData, setPriceRangeData] = useState<{
    min: number;
    max: number;
  }>({ min: 0, max: 0 });
  const propertyTypesRef = useRef<HTMLDivElement>(null);
  const bedroomsRef = useRef<HTMLDivElement>(null);

  // Reset functions for each filter
  const resetPropertyType = () => setPropertyType(DEFAULT_VALUES.propertyType);
  const resetBedrooms = () => setBedrooms(DEFAULT_VALUES.bedrooms);
  const resetBathrooms = () => setBathrooms(DEFAULT_VALUES.bathrooms);
  const resetPriceRange = () =>
    setPriceRange([filterData.prices.min, filterData.prices.max]);
  const resetArea = () => setArea(DEFAULT_VALUES.area);
  const resetSearchQuery = () => setSearchQuery(DEFAULT_VALUES.searchQuery);
  const resetCompletion = () => setCompletion(DEFAULT_VALUES.completion);
  const resetFeatures = () => setFeatures(DEFAULT_VALUES.features);
  const resetAmenities = () => setAmenities(DEFAULT_VALUES.amenities);

  // Reset all filters
  const resetAllFilters = () => {
    setSearchType(DEFAULT_VALUES.searchType);
    resetPropertyType();
    resetBedrooms();
    resetBathrooms();
    resetPriceRange();
    resetArea();
    resetSearchQuery();
    resetCompletion();
    resetFeatures();
    resetAmenities();
    handleSearch();
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearchQuery) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(debouncedSearchQuery)}`
        );
        if (!response.ok) throw new Error("Failed to fetch suggestions");
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);

    // Build search params based on suggestion type
    const params = new URLSearchParams();
    params.set("type", searchType);

    // Clear any previous search query when selecting a specific item
    params.delete("q");

    switch (suggestion.type) {
      case "project":
        params.set("projectId", suggestion.id);
        break;
      case "developer":
        params.set("developerId", suggestion.id);
        break;
      case "location":
        params.set("locationId", suggestion.id);
        break;
    }

    // Add other active filters
    if (propertyType) params.set("propertyType", propertyType);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (bathrooms) params.set("bathrooms", bathrooms);
    params.set("priceMin", priceRange[0].toString());
    params.set("priceMax", priceRange[1].toString());
    params.set("areaMin", area[0].toString());
    params.set("areaMax", area[1].toString());
    if (completion) params.set("completion", completion);
    if (features.size > 0)
      params.set("features", Array.from(features).join(","));
    if (amenities.size > 0)
      params.set("amenities", Array.from(amenities).join(","));
    if (showMap) params.set("view", "map");

    router.push(`/${locale}/search?${params.toString()}`);
    onSearch?.();
  };

  const formatPrice = (value: number): string => {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(1)}M`;
    }
    return `฿${(value / 1000).toFixed(0)}K`;
  };

  const handleSearch = useCallback((): void => {
    // Add logging before search

    const params = new URLSearchParams();

    // Basic search parameters
    params.set("type", searchType);
    if (propertyType) params.set("propertyType", propertyType);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (bathrooms) params.set("bathrooms", bathrooms);

    // Always include price range parameters
    params.set("priceMin", priceRange[0].toString());
    params.set("priceMax", priceRange[1].toString());

    params.set("areaMin", area[0].toString());
    params.set("areaMax", area[1].toString());
    if (completion) params.set("completion", completion);
    if (features.size > 0)
      params.set("features", Array.from(features).join(","));
    if (amenities.size > 0)
      params.set("amenities", Array.from(amenities).join(","));
    if (searchQuery) params.set("q", searchQuery);
    if (showMap) params.set("view", "map");

    // Clear any previous ID-based filters
    const currentParams = new URLSearchParams(window.location.search);
    if (currentParams.has("projectId")) params.delete("projectId");
    if (currentParams.has("developerId")) params.delete("developerId");
    if (currentParams.has("locationId")) params.delete("locationId");

    router.push(`/${locale}/search?${params.toString()}`);
    onSearch?.();
  }, [
    searchType,
    propertyType,
    bedrooms,
    bathrooms,
    priceRange,
    area,
    searchQuery,
    completion,
    features,
    amenities,
    showMap,
    locale,
    router
  ]);

  const toggleFeature = (feature: string) => {
    const newFeatures = new Set(features);
    if (newFeatures.has(feature)) {
      newFeatures.delete(feature);
    } else {
      newFeatures.add(feature);
    }
    setFeatures(newFeatures);
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = new Set(amenities);
    if (newAmenities.has(amenity)) {
      newAmenities.delete(amenity);
    } else {
      newAmenities.add(amenity);
    }
    setAmenities(newAmenities);
  };

  const bedroomsOptions = Array.from(
    { length: bedroomsData.max - bedroomsData.min + 1 },
    (_, i) => {
      const bedroomNumber = i + bedroomsData.min;
      switch (i) {
        case 0:
          return {
            value: bedroomNumber.toString(),
            label: `${t("bedrooms.0Bed")}`
          };
        case 1:
          return {
            value: bedroomNumber.toString(),
            label: `${t("bedrooms.1Bed")}`
          };
        case 2:
          return {
            value: bedroomNumber.toString(),
            label: `${t("bedrooms.2Bed")}`
          };
        default:
          return {
            value: bedroomNumber.toString(),
            label: `${t("bedrooms.3Bed")}`
          };
      }
    }
  );
  const PropertyTypeSection = useMemo(
    () => (
      <div
        className="relative h-14 border-b sm:border-b-0 sm:border-r border-gray-200"
        ref={propertyTypesRef}
      >
        <button
          type="button"
          onClick={() => {
            setShowPropertyTypes(!showPropertyTypes);
            setShowBedrooms(false);
          }}
          className="w-full h-14 px-4 text-left bg-white text-gray-900 focus:outline-none flex items-center justify-between text-sm"
        >
          <span>
            {propertyType
              ? getPropertyTypes().find(t => t.value === propertyType)?.label
              : t("allPropertyTypes")}
          </span>
          <svg
            className={cn(
              "w-6 h-6 transition-transform",
              showPropertyTypes ? "rotate-180" : ""
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showPropertyTypes && (
          <div className="absolute left-0 top-[calc(100%+1px)] w-[calc(100vw-2rem)] sm:w-auto min-w-[400px] bg-white shadow-lg rounded-lg border border-gray-200 z-[100]">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {t("propertyType")}
              </h3>
              <button
                onClick={() => {
                  setPropertyType("");
                  setShowPropertyTypes(false);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {t("clear")}
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {getPropertyTypes().map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setPropertyType(option.value);
                    }}
                    className={cn(
                      "w-full aspect-square p-3 rounded-lg border border-gray-200 flex flex-col items-center min-h-[100px] min-w-[100px] overflow-hidden",
                      propertyType === option.value
                        ? "bg-blue-50 border-blue-200"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <div
                        className={cn(
                          "w-8 h-8 flex-shrink-0",
                          propertyType === option.value
                            ? "text-blue-600"
                            : "text-gray-600"
                        )}
                      >
                        {option.icon}
                      </div>
                    </div>
                    <div className="w-full mt-1">
                      <span
                        className={cn(
                          "text-xs font-medium text-center block whitespace-normal break-words hyphens-auto w-full px-0.5 leading-tight",
                          propertyType === option.value
                            ? "text-blue-600"
                            : "text-gray-900"
                        )}
                      >
                        {option.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex border-t p-4 gap-2">
              <button
                onClick={() => {
                  setShowPropertyTypes(false);
                }}
                className="flex-1 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => setShowPropertyTypes(false)}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                {t("select")}
              </button>
            </div>
          </div>
        )}
      </div>
    ),
    [propertyType, showPropertyTypes]
  );

  const BedroomsSection = useMemo(
    () => (
      <div
        className="relative h-14 border-b sm:border-b-0 sm:border-r border-gray-200"
        ref={bedroomsRef}
      >
        <button
          type="button"
          onClick={() => {
            setShowBedrooms(!showBedrooms);
            setShowPropertyTypes(false);
          }}
          className="w-full h-14 px-4 text-left bg-white text-gray-900 focus:outline-none flex items-center justify-between text-sm"
        >
          <span>
            {bedrooms ? t(`bedrooms.${bedrooms}Bed`) : t("allBedrooms")}
          </span>
          <svg
            className={cn(
              "w-6 h-6 transition-transform",
              showBedrooms ? "rotate-180" : ""
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showBedrooms && (
          <div className="absolute left-0 top-[calc(100%+1px)] w-[calc(100vw-2rem)] sm:w-auto min-w-[300px] bg-white shadow-lg rounded-lg border border-gray-200 z-[100]">
            <div className="flex justify-between items-center p-4">
              <h3 className="text-lg font-medium text-gray-900">
                {t("bedroomsCount")}
              </h3>
              <button
                onClick={() => {
                  setBedrooms("");
                  setShowBedrooms(false);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {t("clear")}
              </button>
            </div>
            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "0", label: t("studio") },
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                  { value: "3", label: "3" },
                  { value: "4", label: "4+" }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setBedrooms(option.value);
                    }}
                    className={cn(
                      "h-10 px-6 rounded-lg border border-gray-200 text-sm font-medium",
                      bedrooms === option.value
                        ? "bg-blue-50 border-blue-200 text-blue-600"
                        : "text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex border-t p-4 gap-2">
              <button
                onClick={() => {
                  setShowBedrooms(false);
                }}
                className="flex-1 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => setShowBedrooms(false)}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                {t("select")}
              </button>
            </div>
          </div>
        )}
      </div>
    ),
    [bedrooms, showBedrooms]
  );

  useEffect(() => {
    const fetchPriceRange = async () => {
      try {
        const response = await fetch("/api/units/price-range");
        const data = await response.json();

        if (data.min !== undefined && data.max !== undefined) {
          setPriceRangeData(data);
          // Only update price range if no URL parameters exist
          const urlPriceMin = searchParams.get("priceMin");
          const urlPriceMax = searchParams.get("priceMax");

          if (!urlPriceMin && !urlPriceMax) {
            setPriceRange([data.min, data.max]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch price range:", error);
      }
    };

    fetchPriceRange();
  }, [searchParams]);

  const getPropertyTypes = (): UnitLayoutTypeItem[] => {
    return [
      {
        value: UnitLayoutType.STUDIO,
        label: t("unitLayoutTypes.STUDIO"),
        icon: <HomeIcon className="w-8 h-8 text-blue-600" />
      },
      {
        value: UnitLayoutType.APARTMENT,
        label: t("unitLayoutTypes.APARTMENT"),
        icon: <Building2 className="w-8 h-8 text-blue-600" />
      },
      {
        value: UnitLayoutType.PENTHOUSE,
        label: t("unitLayoutTypes.PENTHOUSE"),
        icon: <Hotel className="w-8 h-8 text-blue-600" />
      },
      {
        value: UnitLayoutType.DUPLEX,
        label: t("unitLayoutTypes.DUPLEX"),
        icon: <Warehouse className="w-8 h-8 text-blue-600" />
      },
      {
        value: UnitLayoutType.TOWNHOUSE,
        label: t("unitLayoutTypes.TOWNHOUSE"),
        icon: <School className="w-8 h-8 text-blue-600" />
      },
      {
        value: UnitLayoutType.VILLA,
        label: t("unitLayoutTypes.VILLA"),
        icon: <Castle className="w-8 h-8 text-blue-600" />
      }
    ];
  };

  // Обновляем useEffect для корректной обработки кликов
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Проверяем клики вне компонента выбора типа жилья
      if (
        propertyTypesRef.current &&
        !propertyTypesRef.current.contains(event.target as Node) &&
        showPropertyTypes
      ) {
        setShowPropertyTypes(false);
      }

      // Проверяем клики вне компонента выбора количества комнат
      if (
        bedroomsRef.current &&
        !bedroomsRef.current.contains(event.target as Node) &&
        showBedrooms
      ) {
        setShowBedrooms(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPropertyTypes, showBedrooms]);

  return (
    <div className="w-full mx-auto">
      {/* <div className="w-full mx-auto px-4 sm:px-6 lg:px-8"></div> */}
      {/* Reset All Filters Button */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-end gap-4 sm:gap-0">
        <div className="flex overflow-x-auto">
          <button
            type="button"
            onClick={() => setSearchType("units")}
            className={cn(
              "h-10 px-4 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap",
              searchType === "units"
                ? "bg-white text-gray-900"
                : "text-gray-600 hover:bg-white/10"
            )}
          >
            {t("searchByUnits")}
          </button>
          <button
            type="button"
            onClick={() => setSearchType("projects")}
            className={cn(
              "h-10 px-4 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap",
              searchType === "projects"
                ? "bg-white text-gray-900"
                : "text-gray-600 hover:bg-white/10"
            )}
          >
            {t("searchByProjects")}
          </button>
        </div>
        <button
          onClick={resetAllFilters}
          className="sm:px-4 sm:py-2 py-1 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 whitespace-nowrap justify-end"
        >
          <X size={16} />
          {t("resetAllFilters")}
        </button>
      </div>

      {/* Main Search Form */}
      <div className="-mt-[1px]">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Unified inputs container */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[200px_200px_1fr_1fr] bg-white rounded-lg border border-gray-200 rounded-tl-none">
            {PropertyTypeSection}
            {BedroomsSection}

            {/* Price Range Slider */}
            <div className="relative h-14 border-b sm:border-b-0 sm:border-r border-gray-200 px-4 flex">
              <div className="w-full flex items-center pt-2">
                <Slider
                  min={filterData.prices.min}
                  max={filterData.prices.max}
                  step={50000}
                  value={priceRange}
                  onValueChange={(value: [number, number]) =>
                    setPriceRange(value)
                  }
                  formatLabel={formatPrice}
                  className="w-full"
                  aria-label="Диапазон цен"
                />
              </div>
            </div>

            {/* Search Input with Autocomplete */}
            <div className="relative h-14">
              <div className="relative h-14 flex items-center">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full h-14 px-10 border-0 focus:outline-none focus:ring-0 bg-transparent text-gray-900 placeholder:text-gray-500 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={resetSearchQuery}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full z-10"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && (searchQuery || isLoading) && (
                <div className="absolute left-0 top-[calc(100%+1px)] w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto z-[100]">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading...
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map(suggestion => (
                      <button
                        key={`${suggestion.type}-${suggestion.id}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex flex-col border-b border-gray-100 last:border-0"
                      >
                        <span className="font-medium text-gray-900">
                          {suggestion.title}
                        </span>
                        {suggestion.subtitle && (
                          <span className="text-sm text-gray-500">
                            {suggestion.subtitle}
                          </span>
                        )}
                      </button>
                    ))
                  ) : searchQuery ? (
                    <div className="p-4 text-center text-gray-500">
                      No results found
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Separated buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="h-[56px] w-[56px] rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center"
              aria-label="All filters"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleSearch}
              className="h-[56px] px-8 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              {t("find")}
            </button>
          </div>
        </div>

        {/* Extended Filters Panel */}
        {showFilters && (
          <div className="mt-2 bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Bathrooms */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Bath className="w-4 h-4" />
                  {t("bathroomsCount")}
                </label>
                <select
                  value={bathrooms === "4" ? "4+" : bathrooms}
                  onChange={e => {
                    const value =
                      e.target.value === "4+" ? "4" : e.target.value;
                    setBathrooms(value);
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t("any")}</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4+">4+</option>
                </select>
              </div>

              {/* Area Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  {t("area")}
                </label>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={area}
                  onValueChange={(value: [number, number]) => setArea(value)}
                  formatLabel={value => `${value}㎡`}
                  className="w-full"
                  aria-label="Диапазон площади"
                />
              </div>

              {/* Completion Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  {t("completion")}
                </label>
                <select
                  value={completion}
                  onChange={e => setCompletion(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t("completionAny")}</option>
                  <option value="ready">{t("completionReady")}</option>
                  <option value="under_construction">
                    {t("completionUnderConstruction")}
                  </option>
                  <option value="off_plan">{t("completionPlanned")}</option>
                </select>
              </div>

              {/* Payment Plan */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  {t("paymentPlan")}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={features.has("installment")}
                      onChange={() => toggleFeature("installment")}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                      {t("installmentAvailable")}
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={features.has("mortgage")}
                      onChange={() => toggleFeature("mortgage")}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                      {t("mortgageAvailable")}
                    </span>
                  </label>
                </div>
              </div>

              {/* Features */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("features")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    t("furnished"),
                    t("petFriendly"),
                    t("seaView"),
                    t("privatePool")
                  ].map(feature => (
                    <label key={feature} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={features.has(feature)}
                        onChange={() => toggleFeature(feature)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">
                        {feature
                          .split("_")
                          .map(
                            word => word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("amenities")}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    t("swimmingPool"),
                    t("fitnessCenter"),
                    t("security"),
                    t("kidsClub"),
                    t("beachClub"),
                    t("beachfrontPool")
                  ].map(amenity => (
                    <label key={amenity} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={amenities.has(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Show on map button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => {
            setShowMap(!showMap);
            onMapViewChange?.(!showMap);
          }}
          className={cn(
            "w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            showMap
              ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          )}
        >
          <Map className="w-4 h-4" />
          {t("showOnMap")}
        </button>
      </div>
    </div>
  );
}
