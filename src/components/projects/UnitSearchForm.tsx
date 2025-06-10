import { useTranslations } from "next-intl";
import { Paper, TextInput, Select, Group, Button } from "@mantine/core";
import { useState, useCallback } from "react";

export interface UnitSearchFormProps {
  onSearch: () => void;
  onFiltersChange: (filters: UnitSearchFilters) => void;
}

export interface UnitSearchFilters {
  bedrooms: string[];
  priceRange: { min: number; max: number; currency: string } | null;
  location: string[];
  type: string[];
}

export default function UnitSearchForm({ onSearch, onFiltersChange }: UnitSearchFormProps) {
  const t = useTranslations("Search");
  const [filters, setFilters] = useState<UnitSearchFilters>({
    bedrooms: [],
    priceRange: null,
    location: [],
    type: []
  });

  const handleFilterChange = useCallback((key: keyof UnitSearchFilters, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const handleTypeChange = useCallback((value: string | null) => {
    handleFilterChange("type", value ? [value] : []);
  }, [handleFilterChange]);

  const handleBedroomsChange = useCallback((value: string | null) => {
    handleFilterChange("bedrooms", value ? [value] : []);
  }, [handleFilterChange]);

  const handleLocationChange = useCallback((value: string) => {
    handleFilterChange("location", [value]);
  }, [handleFilterChange]);

  const handlePriceChange = useCallback((min: number | null, max: number | null, currency: string = "USD") => {
    if (min === null && max === null) {
      handleFilterChange("priceRange", null);
    } else {
      handleFilterChange("priceRange", {
        min: min ?? 0,
        max: max ?? Infinity,
        currency
      });
    }
  }, [handleFilterChange]);

  const handleCurrencyChange = useCallback((value: string | null) => {
    if (!value) return;
    if (filters.priceRange) {
      handleFilterChange("priceRange", {
        ...filters.priceRange,
        currency: value
      });
    } else {
      handleFilterChange("priceRange", {
        min: 0,
        max: Infinity,
        currency: value
      });
    }
  }, [filters.priceRange, handleFilterChange]);

  return (
    <Paper p="md">
      <Group spacing="md">
        <Select
          label={t("filters.type.label")}
          placeholder={t("filters.type.placeholder")}
          data={[
            { value: "STUDIO", label: "Studio" },
            { value: "APARTMENT", label: "Apartment" },
            { value: "PENTHOUSE", label: "Penthouse" }
          ]}
          onChange={handleTypeChange}
          clearable
        />

        <Select
          label={t("filters.bedrooms.label")}
          placeholder={t("filters.bedrooms.placeholder")}
          data={[
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4+", label: "4+" }
          ]}
          onChange={handleBedroomsChange}
          clearable
        />

        <TextInput
          label={t("filters.location.label")}
          placeholder={t("filters.location.placeholder")}
          onChange={(e) => handleLocationChange(e.target.value)}
        />

        <Group grow>
          <TextInput
            type="number"
            label={t("filters.price.min")}
            placeholder={t("filters.price.min")}
            onChange={(e) => {
              const value = e.target.value ? parseFloat(e.target.value) : null;
              handlePriceChange(
                value, 
                filters.priceRange?.max ?? null, 
                filters.priceRange?.currency ?? "USD"
              );
            }}
          />
          <TextInput
            type="number"
            label={t("filters.price.max")}
            placeholder={t("filters.price.max")}
            onChange={(e) => {
              const value = e.target.value ? parseFloat(e.target.value) : null;
              handlePriceChange(
                filters.priceRange?.min ?? null, 
                value,
                filters.priceRange?.currency ?? "USD"
              );
            }}
          />
          <Select
            label={t("filters.price.currency.label")}
            placeholder={t("filters.price.currency.placeholder")}
            data={[
              { value: "USD", label: t("currencies.USD") },
              { value: "EUR", label: t("currencies.EUR") },
              { value: "RUB", label: t("currencies.RUB") },
              { value: "AED", label: t("currencies.AED") }
            ]}
            value={filters.priceRange?.currency ?? "USD"}
            onChange={handleCurrencyChange}
          />
        </Group>

        <Button onClick={onSearch} mt="xl">
          {t("common.search")}
        </Button>
      </Group>
    </Paper>
  );
} 