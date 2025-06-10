import { useTranslations } from "next-intl";
import { Paper, TextInput, Select, Group, Button } from "@mantine/core";
import { ProjectStatus } from "@prisma/client";
import { useState, useCallback } from "react";

export interface ProjectSearchFormProps {
  onSearch: () => void;
  onFiltersChange: (filters: ProjectSearchFilters) => void;
}

export interface ProjectSearchFilters {
  status: ProjectStatus[];
  priceRange: { min: number; max: number; currency: string } | null;
  location: string[];
}

export default function ProjectSearchForm({ onSearch, onFiltersChange }: ProjectSearchFormProps) {
  const t = useTranslations("Search");
  const [filters, setFilters] = useState<ProjectSearchFilters>({
    status: [],
    priceRange: null,
    location: []
  });

  const handleFilterChange = useCallback((key: keyof ProjectSearchFilters, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const handleStatusChange = useCallback((value: string | null) => {
    handleFilterChange("status", value ? [value as ProjectStatus] : []);
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
          label={t("filters.status.label")}
          placeholder={t("filters.status.placeholder")}
          data={[
            { value: "ACTIVE", label: t("status.active") },
            { value: "INACTIVE", label: t("status.inactive") }
          ]}
          onChange={handleStatusChange}
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