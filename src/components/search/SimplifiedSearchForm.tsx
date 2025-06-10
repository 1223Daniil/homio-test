'use client';

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { formatPrice } from "@/lib/formatters";
import { Button } from "@heroui/react";

// Типы для формы поиска
export interface SimplifiedSearchFormProps {
  filterData: {
    bedrooms: {
      min: number;
      max: number;
    };
    prices: {
      min: number;
      max: number;
    };
  };
  onFilterToggle?: (show: boolean) => void;
  developerId?: string;
  isSingleDeveloper?: boolean;
}

export function SimplifiedSearchForm({
  filterData,
  onFilterToggle,
  developerId,
  isSingleDeveloper = false
}: SimplifiedSearchFormProps) {
  const t = useTranslations("Developers.search.filters");
  const router = useRouter();
  const locale = useLocale();

  // Default values
  const DEFAULT_VALUES = {
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    priceRange: [filterData.prices.min || 0, filterData.prices.max || 100000000] as [number, number]
  };

  const { bedrooms: bedroomsData, prices: pricesRange } = filterData;
  
  // Bedrooms options
  const bedroomsRange = [
    { value: "", label: t("allBedrooms") },
    { value: "st", label: t("bedrooms.stBed") || "Студия" },
    ...Array.from(
      { length: (bedroomsData.max -1) - Math.max(bedroomsData.min, 1) + 1 },
      (_, i) => {
        const bedroomNumber = i + Math.max(bedroomsData.min, 1);
        return {
          value: bedroomNumber.toString(),
          label: `${bedroomNumber} ${t("bedrooms.1Bed")}`
        };
      }
    )
  ];

  // Initialize form states
  const [propertyType, setPropertyType] = useState(DEFAULT_VALUES.propertyType);
  const [bedrooms, setBedrooms] = useState(DEFAULT_VALUES.bedrooms);
  const [bathrooms, setBathrooms] = useState(DEFAULT_VALUES.bathrooms);
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_VALUES.priceRange);
  const [isLoading, setIsLoading] = useState(false);
  const [isPriceRangeModified, setIsPriceRangeModified] = useState(false);
  
  const [showPropertyTypes, setShowPropertyTypes] = useState(false);
  const [showBedrooms, setShowBedrooms] = useState(false);
  const [showBathrooms, setShowBathrooms] = useState(false);
  
  // Refs for dropdowns
  const propertyTypesRef = useRef<HTMLDivElement>(null);
  const bedroomsRef = useRef<HTMLDivElement>(null);
  const bathroomsRef = useRef<HTMLDivElement>(null);

  // Helper functions for property types
  const getPropertyTypes = () => [
    { value: "", label: t("allPropertyTypes") },
    { value: "APARTMENT", label: t("propertyTypes.apartment") },
    { value: "VILLA", label: t("propertyTypes.villa") },
    { value: "TOWNHOUSE", label: t("propertyTypes.townhouse") },
    { value: "PENTHOUSE", label: t("propertyTypes.penthouse") }
  ];

  // Helper function for bathrooms
  const getBathroomsOptions = () => [
    { value: "", label: t("allBathrooms") },
    { value: "1", label: t("bathrooms.1") },
    { value: "2", label: t("bathrooms.2") },
    { value: "3", label: t("bathrooms.3") },
    { value: "4", label: t("bathrooms.4") }
  ];

  // Reset functions
  const resetPropertyType = () => setPropertyType(DEFAULT_VALUES.propertyType);
  const resetBedrooms = () => setBedrooms(DEFAULT_VALUES.bedrooms);
  const resetBathrooms = () => setBathrooms(DEFAULT_VALUES.bathrooms);
  const resetPriceRange = () => {
    setPriceRange([filterData.prices.min, filterData.prices.max]);
    setIsPriceRangeModified(false);
  };

  // Reset all filters
  const resetAllFilters = () => {
    resetPropertyType();
    resetBedrooms();
    resetBathrooms();
    resetPriceRange();
  };

  // Handle search submission
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();

    // Add search params
    if (propertyType) params.set("propertyType", propertyType);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (bathrooms) params.set("bathrooms", bathrooms);
    
    // Добавляем ценовой диапазон только если он был изменен
    if (isPriceRangeModified) {
      params.set("priceMin", priceRange[0].toString());
      params.set("priceMax", priceRange[1].toString());
    }

    // Add developer ID if provided and not in single developer mode
    if (developerId && !isSingleDeveloper) {
      params.set("developerId", developerId);
    }

    // Navigate to current page with new params, сохраняя позицию прокрутки
    router.push(`/${locale}/developers/${developerId}?${params.toString()}`, { scroll: false });
  }, [
    propertyType,
    bedrooms,
    bathrooms,
    priceRange,
    isPriceRangeModified,
    router,
    locale,
    developerId,
    isSingleDeveloper
  ]);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        propertyTypesRef.current && 
        !propertyTypesRef.current.contains(event.target as Node)
      ) {
        setShowPropertyTypes(false);
      }
      
      if (
        bedroomsRef.current && 
        !bedroomsRef.current.contains(event.target as Node)
      ) {
        setShowBedrooms(false);
      }
      
      if (
        bathroomsRef.current && 
        !bathroomsRef.current.contains(event.target as Node)
      ) {
        setShowBathrooms(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{t("filterProjects")}</h3>
        <button
          onClick={resetAllFilters}
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
        >
          <X size={14} />
          {t("resetAllFilters")}
        </button>
      </div>

      {/* Filter Form */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Property Type Select */}
        <div className="relative border border-gray-200 rounded-lg" ref={propertyTypesRef}>
          <button
            type="button"
            onClick={() => {
              setShowPropertyTypes(!showPropertyTypes);
              setShowBedrooms(false);
              setShowBathrooms(false);
            }}
            className="w-full h-10 px-3 text-left bg-white text-gray-900 rounded-lg focus:outline-none flex items-center justify-between text-sm"
          >
            <span>{propertyType ? getPropertyTypes().find(t => t.value === propertyType)?.label : t("allPropertyTypes")}</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform", showPropertyTypes ? "rotate-180" : "")} />
          </button>

          {showPropertyTypes && (
            <div className="absolute left-0 top-[calc(100%+4px)] w-full bg-white shadow-lg rounded-lg border border-gray-200 z-[100]">
              <div className="p-2">
                {getPropertyTypes().map(type => (
                  <div
                    key={type.value}
                    className={cn(
                      "px-3 py-2 rounded-md cursor-pointer text-sm",
                      propertyType === type.value
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-gray-50"
                    )}
                    onClick={() => {
                      setPropertyType(type.value);
                      setShowPropertyTypes(false);
                    }}
                  >
                    {type.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bedrooms Select */}
        <div className="relative border border-gray-200 rounded-lg" ref={bedroomsRef}>
          <button
            type="button"
            onClick={() => {
              setShowBedrooms(!showBedrooms);
              setShowPropertyTypes(false);
              setShowBathrooms(false);
            }}
            className="w-full h-10 px-3 text-left bg-white text-gray-900 rounded-lg focus:outline-none flex items-center justify-between text-sm"
          >
            <span>{bedrooms ? `${t(`bedrooms.${bedrooms}Bed`)}` : t("allBedrooms")}</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform", showBedrooms ? "rotate-180" : "")} />
          </button>

          {showBedrooms && (
            <div className="absolute left-0 top-[calc(100%+4px)] w-full bg-white shadow-lg rounded-lg border border-gray-200 z-[100]">
              <div className="p-2">
                {bedroomsRange.map(option => (
                  <div
                    key={option.value}
                    className={cn(
                      "px-3 py-2 rounded-md cursor-pointer text-sm",
                      bedrooms === option.value
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-gray-50"
                    )}
                    onClick={() => {
                      setBedrooms(option.value);
                      setShowBedrooms(false);
                    }}
                  >
                    {option.value ? `${t(`bedrooms.${option.value}Bed`)}` : option.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bathrooms Select */}
        <div className="relative border border-gray-200 rounded-lg" ref={bathroomsRef}>
          <button
            type="button"
            onClick={() => {
              setShowBathrooms(!showBathrooms);
              setShowPropertyTypes(false);
              setShowBedrooms(false);
            }}
            className="w-full h-10 px-3 text-left bg-white text-gray-900 rounded-lg focus:outline-none flex items-center justify-between text-sm"
          >
            <span>{bathrooms ? `${t(`bathrooms.${bathrooms}`)}` : t("allBathrooms")}</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform", showBathrooms ? "rotate-180" : "")} />
          </button>

          {showBathrooms && (
            <div className="absolute left-0 top-[calc(100%+4px)] w-full bg-white shadow-lg rounded-lg border border-gray-200 z-[100]">
              <div className="p-2">
                {getBathroomsOptions().map(option => (
                  <div
                    key={option.value}
                    className={cn(
                      "px-3 py-2 rounded-md cursor-pointer text-sm",
                      bathrooms === option.value
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-gray-50"
                    )}
                    onClick={() => {
                      setBathrooms(option.value);
                      setShowBathrooms(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">{t("priceRange")}</h4>
          {/* <button 
            onClick={resetPriceRange}
            className="text-xs text-primary hover:underline"
          >
            Reset
          </button> */}
        </div>
        
        <div className="px-2">
          <Slider
            defaultValue={[priceRange[0], priceRange[1]]}
            value={[priceRange[0], priceRange[1]]}
            min={filterData.prices.min}
            max={filterData.prices.max}
            step={(filterData.prices.max - filterData.prices.min) / 100}
            onValueChange={(value) => {
              setPriceRange([value[0], value[1]]);
              // Помечаем что ценовой диапазон был изменен пользователем
              if (value[0] !== filterData.prices.min || value[1] !== filterData.prices.max) {
                setIsPriceRangeModified(true);
              } else {
                setIsPriceRangeModified(false);
              }
            }}
            className="my-6"
          />
        </div>
        
        <div className="flex items-center justify-between mb-2 text-sm">
          <div>{formatPrice(priceRange[0])}</div>
          <div>{formatPrice(priceRange[1])}</div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex justify-end">
        <Button 
          color="primary"
          onClick={handleSearch}
          isLoading={isLoading}
        >
          {t("applyFilters")}
        </Button>
      </div>
    </div>
  );
} 