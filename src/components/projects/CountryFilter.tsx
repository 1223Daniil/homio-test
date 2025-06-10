"use client";

import { Select, SelectItem, Spinner } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useProjectCountries } from "@/hooks/useProjectCountries";

interface CountryFilterProps {
  selectedCountry?: string | null;
  onCountryChange: (country: string | null) => void;
  countries?: string[]; // Опциональный пропс со списком стран
}

export function CountryFilter({
  selectedCountry,
  onCountryChange,
  countries: countriesProp
}: CountryFilterProps) {
  const t = useTranslations("Projects");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Используем хук только если страны не переданы через пропсы
  const { countries: countriesFromHook, isLoading, error } = useProjectCountries({
    // Отключаем запрос, если страны переданы через пропсы
    enabled: !countriesProp
  });
  
  // Используем страны из пропсов, если они переданы
  const countries = countriesProp || countriesFromHook;
  
  const handleCountryChange = (value: string) => {
    if (value === "all") {
      onCountryChange(null);
      
      // Обновляем URL, удаляя параметр country если он есть
      const params = new URLSearchParams(searchParams.toString());
      params.delete("country");
      router.push(`${pathname}?${params.toString()}`);
    } else {
      onCountryChange(value);
      
      // Обновляем URL, добавляя параметр country
      const params = new URLSearchParams(searchParams.toString());
      params.set("country", value);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  // Формируем список стран для селекта
  const countryOptions = countries?.map(country => ({
    id: country.toLowerCase(),
    name: t(country.toLowerCase()) || country
  })) || [];
  
  // Показываем спиннер только если страны не переданы через пропсы и загружаются
  if (!countriesProp && isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Spinner size="sm" />
      </div>
    );
  }

  if (error && !countriesProp) {
    console.error("Error loading countries:", error);
  }

  return (
    <Select
      label={t("filterByCountry")}
      placeholder={t("allCountries")}
      className="max-w-xs"
      selectedKeys={selectedCountry ? [selectedCountry] : ["all"]}
      onChange={(e) => handleCountryChange(e.target.value)}
    >
      {/* @ts-ignore - Игнорируем ошибки типов для SelectItem - это известная проблема с @heroui/react */}
      <SelectItem key="all" value="all">
        {t("allCountries")}
      </SelectItem>
      
      {countryOptions.map((country) => (
        <SelectItem key={country.id} value={country.id}>
          {country.name}
        </SelectItem>
      ))}
    </Select>
  );
} 