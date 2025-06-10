import { useCallback, useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bath,
  BedDouble,
  Building2,
  Home,
  Map,
  Ruler,
  Search,
  Timer,
  Wallet,
  X,
  Building,
  Hotel,
  HomeIcon,
  Warehouse,
  Castle,
  House,
  LandPlot,
  School
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/Slider";
import { useDebounce } from "@/hooks/useDebounce";
import type { SearchFormProps } from "./SearchForm";
import { ProjectType, UnitLayoutType } from "@prisma/client";

interface Suggestion {
  id: string;
  type: "project" | "location" | "developer";
  title: string;
  subtitle?: string;
}

export function MobileSearchForm({
  onSearch,
  filterData,
  onMapViewChange,
  className
}: SearchFormProps) {
  const t = useTranslations("Search");
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const propertyTypesRef = useRef<HTMLDivElement>(null);
  const bedroomsRef = useRef<HTMLDivElement>(null);

  // Move DEFAULT_VALUES inside component to access filterData
  const DEFAULT_VALUES = {
    searchType: "units" as const,
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    priceRange: [filterData.prices.min || 0, filterData.prices.max || 100000000] as [number, number],
    area: [0, 1000] as [number, number],
    searchQuery: "",
    completion: "",
    features: new Set<string>(),
    amenities: new Set<string>(),
    showMap: false
  };

  // Initialize states with URL params or defaults
  const [searchType, setSearchType] = useState<"units" | "projects">(
    (searchParams.get("type") as "units" | "projects") || DEFAULT_VALUES.searchType
  );
  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || DEFAULT_VALUES.propertyType
  );
  const [showPropertyTypes, setShowPropertyTypes] = useState(false);
  const [showBedrooms, setShowBedrooms] = useState(false);
  const [bedrooms, setBedrooms] = useState(
    searchParams.get("bedrooms") || DEFAULT_VALUES.bedrooms
  );
  const initialPriceMin = Number(searchParams.get("priceMin")) || filterData.prices.min || 0;
  const initialPriceMax = Number(searchParams.get("priceMax")) || filterData.prices.max || 100000000;

  // Add logging for debugging
  console.log('=== MobileSearchForm Price Range Debug ===', {
    filterDataPrices: filterData.prices,
    initialPriceMin,
    initialPriceMax,
    searchParamPriceMin: searchParams.get("priceMin"),
    searchParamPriceMax: searchParams.get("priceMax")
  });

  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialPriceMin,
    initialPriceMax
  ]);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("q") || DEFAULT_VALUES.searchQuery
  );
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (propertyTypesRef.current && 
          !propertyTypesRef.current.contains(event.target as Node) && 
          showPropertyTypes) {
        setShowPropertyTypes(false);
      }

      if (bedroomsRef.current && 
          !bedroomsRef.current.contains(event.target as Node) && 
          showBedrooms) {
        setShowBedrooms(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPropertyTypes, showBedrooms]);

  const formatPrice = (value: number): string => {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(1)}M`;
    }
    return `฿${(value / 1000).toFixed(0)}K`;
  };

  // Fetch suggestions when search query changes
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

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    params.set("type", searchType);
    if (propertyType) params.set("propertyType", propertyType);
    if (bedrooms) params.set("bedrooms", bedrooms);
    params.set("priceMin", priceRange[0].toString());
    params.set("priceMax", priceRange[1].toString());
    if (searchQuery) params.set("q", searchQuery);

    router.push(`/${locale}/search?${params.toString()}`);
    onSearch?.();
  }, [searchType, propertyType, bedrooms, priceRange, searchQuery, router, locale, onSearch]);

  const getPropertyTypes = (): { value: UnitLayoutType; label: string; icon: React.ReactNode }[] => {
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

  // Add effect to update price range when filterData changes
  useEffect(() => {
    if (filterData.prices.min !== undefined && filterData.prices.max !== undefined) {
      const urlPriceMin = searchParams.get("priceMin");
      const urlPriceMax = searchParams.get("priceMax");
      
      if (!urlPriceMin && !urlPriceMax) {
        setPriceRange([filterData.prices.min, filterData.prices.max]);
      }
    }
  }, [filterData.prices, searchParams]);

  return (
    <div className={cn("w-full bg-white rounded-xl", className)}>
      {/* Search Type Toggle */}
      <div className="flex gap-2 p-4">
        <button
          onClick={() => setSearchType("units")}
          className={cn(
            "flex-1 py-2 px-4 rounded-lg text-sm font-medium",
            searchType === "units"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600"
          )}
        >
          {t("searchByUnits")}
        </button>
        <button
          onClick={() => setSearchType("projects")}
          className={cn(
            "flex-1 py-2 px-4 rounded-lg text-sm font-medium",
            searchType === "projects"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600"
          )}
        >
          {t("searchByProjects")}
        </button>
      </div>

      {/* Property Type */}
      <div className="relative px-4" ref={propertyTypesRef}>
        <button
          type="button"
          onClick={() => {
            setShowPropertyTypes(!showPropertyTypes);
            setShowBedrooms(false);
          }}
          className="w-full h-12 px-4 text-left bg-white text-gray-900 focus:outline-none flex items-center justify-between text-sm border border-gray-200 rounded-lg"
        >
          <span>{propertyType ? getPropertyTypes().find(t => t.value === propertyType)?.label : t("allPropertyTypes")}</span>
          <svg
            className={cn(
              "w-5 h-5 transition-transform",
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
          <>
            <div className="fixed inset-0 bg-black/40 z-[99]" />
            <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-xl shadow-lg z-[100] max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
                <h3 className="text-lg font-medium text-gray-900">{t("propertyType")}</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setPropertyType("");
                      setShowPropertyTypes(false);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {t("clear")}
                  </button>
                  <button
                    onClick={() => setShowPropertyTypes(false)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  {getPropertyTypes().map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setPropertyType(option.value);
                        setShowPropertyTypes(false);
                      }}
                      className={cn(
                        "flex flex-col justify-between items-center h-[100px] p-3 rounded-lg border",
                        propertyType === option.value 
                          ? "bg-blue-50 border-blue-200" 
                          : "border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center flex-1",
                        propertyType === option.value ? "text-blue-600" : "text-gray-600"
                      )}>
                        <div className="w-8 h-8">
                          {option.icon}
                        </div>
                      </div>
                      <span className={cn(
                        "text-xs font-medium text-center w-full line-clamp-2",
                        propertyType === option.value ? "text-blue-600" : "text-gray-900"
                      )}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t sticky bottom-0 bg-white">
                <button
                  onClick={() => setShowPropertyTypes(false)}
                  className="w-full h-12 bg-blue-600 text-white rounded-lg font-medium"
                >
                  {t("select")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bedrooms */}
      <div className="relative px-4 mt-3" ref={bedroomsRef}>
        <button
          type="button"
          onClick={() => {
            setShowBedrooms(!showBedrooms);
            setShowPropertyTypes(false);
          }}
          className="w-full h-12 px-4 text-left bg-white text-gray-900 focus:outline-none flex items-center justify-between text-sm border border-gray-200 rounded-lg"
        >
          <span>{bedrooms ? t(`bedrooms.${bedrooms}Bed`) : t("allBedrooms")}</span>
          <svg
            className={cn(
              "w-5 h-5 transition-transform",
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
          <>
            <div className="fixed inset-0 bg-black/40 z-[99]" />
            <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-xl shadow-lg z-[100]">
              <div className="flex justify-between items-center p-4">
                <h3 className="text-lg font-medium text-gray-900">{t("bedroomsCount")}</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setBedrooms("");
                      setShowBedrooms(false);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {t("clear")}
                  </button>
                  <button
                    onClick={() => setShowBedrooms(false)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-5 gap-2">
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
                        setShowBedrooms(false);
                      }}
                      className={cn(
                        "h-12 rounded-lg border text-sm font-medium",
                        bedrooms === option.value 
                          ? "bg-blue-50 border-blue-200 text-blue-600" 
                          : "border-gray-200 text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t">
                <button
                  onClick={() => setShowBedrooms(false)}
                  className="w-full h-12 bg-blue-600 text-white rounded-lg font-medium"
                >
                  {t("select")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Price Range */}
      <div className="px-4 py-6">
        <span className="text-sm text-gray-900">{t("priceRange")}</span>
        <Slider
          min={filterData.prices.min}
          max={filterData.prices.max}
          step={50000}
          value={priceRange}
          onValueChange={(value: [number, number]) => setPriceRange(value)}
          formatLabel={formatPrice}
          className="w-full"
          aria-label="Price range"
        />
        {/* <div className="mt-2 flex justify-between text-sm text-gray-600">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div> */}
      </div>

      {/* Search Button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleSearch}
          className="w-full h-12 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {t("find")}
        </button>
      </div>
    </div>
  );
} 