"use client";

import { Select, SelectItem, Button } from "@heroui/react";
import { IconFilter } from "@tabler/icons-react";
import { useState } from "react";
import { PriceRangeSelector } from "./PriceRangeSelector";
import { BedroomsSelector } from "./BedroomsSelector";
import { PropertyTypeSelector } from "./PropertyTypeSelector";

interface UnitSearchFormProps {
  onFiltersChange: (
    filterType: string,
    value: Set<string> | { min: number; max: number } | null
  ) => void;
  onSearch: () => void;
}

export function UnitSearchForm({
  onFiltersChange,
  onSearch
}: UnitSearchFormProps) {
  const [values, setValues] = useState({
    location: new Set([])
  });

  const handleValueChange = (type: string, newValue: any) => {
    const valueAsSet = new Set(
      typeof newValue === "string" ? [newValue] : Array.from(newValue)
    ) as Set<string>;
    setValues(prev => ({ ...prev, [type]: valueAsSet }));
    onFiltersChange(type, valueAsSet);
  };

  const handlePriceRangeChange = (
    range: { min: number; max: number } | null
  ) => {
    onFiltersChange("priceRange", range);
  };

  const handleBedroomsChange = (bedrooms: Set<string>) => {
    onFiltersChange("bedrooms", bedrooms);
  };

  const handlePropertyTypeChange = (types: Set<string>) => {
    onFiltersChange("prototype", types);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <PropertyTypeSelector
            onPropertyTypeChange={handlePropertyTypeChange}
          />
        </div>

        <div className="flex-1">
          <BedroomsSelector onBedroomsChange={handleBedroomsChange} />
        </div>

        <div className="flex-1">
          <PriceRangeSelector onPriceRangeChange={handlePriceRangeChange} />
        </div>

        <Select
          label="Location"
          placeholder="Select location"
          className="flex-1"
          classNames={{
            trigger: "h-14"
          }}
          selectedKeys={values.location}
          onSelectionChange={keys => handleValueChange("location", keys)}
        >
          <SelectItem key="phuket" textValue="Phuket">Phuket</SelectItem>
          <SelectItem key="bangkok" textValue="Bangkok">Bangkok</SelectItem>
          <SelectItem key="pattaya" textValue="Pattaya">Pattaya</SelectItem>
        </Select>

        <Button
          variant="bordered"
          startContent={<IconFilter size={18} />}
          className="h-14 px-8"
        >
          All filters
        </Button>

        <Button color="secondary" className="h-14 px-8" onClick={onSearch}>
          Show results
        </Button>
      </div>
    </div>
  );
}
