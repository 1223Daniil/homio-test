import { Chip, Select, SelectItem, Slider } from "@heroui/react";

import { Building } from "@prisma/client";
import { useTranslations } from "next-intl";

interface FloorPlanFiltersProps {
  buildings: Building[];
  selectedBuilding: string | null;
  onBuildingChange: (buildingId: string) => void;
  filters: {
    availability: string[];
    bedrooms: number[];
    priceRange: [number, number];
    areaRange: [number, number];
    windowView: string[];
  };
  onFilterChange: (key: string, value: any) => void;
  currency: string;
}

export function FloorPlanFilters({
  buildings,
  selectedBuilding,
  onBuildingChange,
  filters,
  onFilterChange,
  currency
}: FloorPlanFiltersProps) {
  const t = useTranslations();
  const currenciesT = useTranslations("projects.currency.symbols");

  const availabilityOptions = [
    {
      value: "AVAILABLE",
      label: t("ProjectDetails.tabs.unitsGrid.status.available")
    },
    {
      value: "RESERVED",
      label: t("ProjectDetails.tabs.unitsGrid.status.reserved")
    },
    { value: "SOLD", label: t("ProjectDetails.tabs.unitsGrid.status.sold") }
  ];

  const bedroomOptions = [
    { value: "0", label: "Studio" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4+" }
  ];

  const windowViewOptions = [
    { value: "SEA", label: t("ProjectDetails.filters.windowView.sea") },
    {
      value: "MOUNTAIN",
      label: t("ProjectDetails.filters.windowView.mountain")
    },
    { value: "CITY", label: t("ProjectDetails.filters.windowView.city") },
    { value: "GARDEN", label: t("ProjectDetails.filters.windowView.garden") }
  ];

  console.log(filters);

  return (
    <div className="bg-default-50 dark:bg-default-100 p-4 rounded-lg space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Building Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("ProjectDetails.filters.building")}
          </label>
          <Select
            size="sm"
            selectedKeys={selectedBuilding ? [selectedBuilding] : []}
            onChange={e => onBuildingChange(e.target.value)}
            className="min-w-fit"
          >
            {buildings.map(building => (
              <SelectItem
                key={building.id}
                textValue={building.name || "Unnamed"}
              >
                {building.name || "Unnamed"}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Availability Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("ProjectDetails.filters.availability")}
          </label>
          <Select
            size="sm"
            selectedKeys={filters.availability}
            onChange={e => {
              const value = e.target.value;
              if (value === "all") {
                onFilterChange("availability", []);
              } else {
                onFilterChange("availability", [value]);
              }
            }}
            className="w-full"
          >
            <SelectItem key="all" textValue={t("ProjectDetails.filters.all")}>
              {t("ProjectDetails.filters.all")}
            </SelectItem>
            {availabilityOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Bedrooms Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("ProjectDetails.filters.bedrooms")}
          </label>
          <div className="flex flex-wrap gap-2">
            {bedroomOptions.map(option => (
              <Chip
                key={option.value}
                variant="flat"
                color={
                  filters.bedrooms.includes(Number(option.value))
                    ? "primary"
                    : "default"
                }
                className="cursor-pointer"
                onClick={() => {
                  const newBedrooms = filters.bedrooms.includes(
                    Number(option.value)
                  )
                    ? filters.bedrooms.filter(b => b !== Number(option.value))
                    : [...filters.bedrooms, Number(option.value)];
                  onFilterChange("bedrooms", newBedrooms);
                }}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("ProjectDetails.filters.price")} (
            {currenciesT(currency as keyof typeof currenciesT) || currency})
          </label>
          <div className="px-2">
            <Slider
              size="sm"
              step={100000}
              minValue={0}
              maxValue={10000000}
              value={filters.priceRange}
              onChange={value => onFilterChange("priceRange", value)}
              formatOptions={{
                style: "currency",
                currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }}
              aria-label="Диапазон цен"
            />
          </div>
        </div>

        {/* Area Range Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("ProjectDetails.filters.area")} (m²)
          </label>
          <div className="px-2">
            <Slider
              size="sm"
              step={5}
              minValue={0}
              maxValue={500}
              value={filters.areaRange}
              onChange={value => onFilterChange("areaRange", value)}
              formatOptions={{
                style: "decimal",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }}
              aria-label="Диапазон площади"
            />
          </div>
        </div>

        {/* Window View Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("ProjectDetails.filters.windowViewTitle")}
          </label>
          <div className="flex flex-wrap gap-2">
            {windowViewOptions.map(option => (
              <Chip
                key={option.value}
                variant="flat"
                color={
                  filters.windowView.includes(option.value)
                    ? "primary"
                    : "default"
                }
                className="cursor-pointer"
                onClick={() => {
                  const newViews = filters.windowView.includes(option.value)
                    ? filters.windowView.filter(v => v !== option.value)
                    : [...filters.windowView, option.value];
                  onFilterChange("windowView", newViews);
                }}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
