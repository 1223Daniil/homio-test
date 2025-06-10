'use client';

import { Button } from "@heroui/react";
import { IconFilter } from "@tabler/icons-react";
import { useState } from "react";
import { PriceRangeSelector } from "./PriceRangeSelector";
import { BedroomsSelector } from "./BedroomsSelector";
import { PropertyTypeSelector } from "./PropertyTypeSelector";
import { LocationSelector } from "./LocationSelector";

interface ProjectSearchFormProps {
  onFiltersChange: (filterType: string, value: Set<string> | { min: number; max: number } | null) => void;
  onSearch: () => void;
}

export interface SearchFilters {
  propertyType: Set<string>;
  bedrooms: Set<string>;
  priceRange: { min: number; max: number } | null;
  location: Set<string>;
}

export function ProjectSearchForm({ onFiltersChange, onSearch }: ProjectSearchFormProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    propertyType: new Set([]),
    bedrooms: new Set([]),
    priceRange: null,
    location: new Set([]),
  });

  const handleValueChange = (type: keyof SearchFilters, newValue: any) => {
    setFilters(prev => ({ ...prev, [type]: newValue }));
    onFiltersChange(type, newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form 
      role="search" 
      onSubmit={handleSubmit}
      className="space-y-6"
      aria-label="Project search form"
    >
      <div className="flex items-end gap-2">
        <div className="flex-1" role="group" aria-label="Property type filter">
          <PropertyTypeSelector 
            onPropertyTypeChange={(types) => handleValueChange('propertyType', types)} 
          />
        </div>

        <div className="flex-1" role="group" aria-label="Bedrooms filter">
          <BedroomsSelector 
            onBedroomsChange={(bedrooms) => handleValueChange('bedrooms', bedrooms)} 
          />
        </div>

        <div className="flex-1" role="group" aria-label="Price range filter">
          <PriceRangeSelector 
            onPriceRangeChange={(range) => handleValueChange('priceRange', range)} 
          />
        </div>

        <div className="flex-1" role="group" aria-label="Location filter">
          <LocationSelector 
            selectedKeys={filters.location}
            onSelectionChange={(keys) => handleValueChange('location', keys)} 
          />
        </div>

        <Button 
          variant="bordered"
          startContent={<IconFilter size={18} />}
          className="h-14 px-8"
          aria-label="Show all filters"
          type="button"
        >
          All filters
        </Button>

        <Button 
          color="primary"
          className="h-14 px-8"
          type="submit"
          aria-label="Search projects"
        >
          Find
        </Button>
      </div>
    </form>
  );
} 