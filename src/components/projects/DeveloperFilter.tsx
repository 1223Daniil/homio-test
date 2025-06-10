"use client";

import { Select, SelectItem } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Developer {
  id: string;
  translations: {
    language: string;
    name: string;
    description?: string | null;
  }[];
}

interface DeveloperFilterProps {
  developers: Developer[];
  selectedDeveloperId?: string | null;
  onDeveloperChange: (developerId: string | null) => void;
}

export function DeveloperFilter({
  developers,
  selectedDeveloperId,
  onDeveloperChange
}: DeveloperFilterProps) {
  const t = useTranslations("Projects");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const handleDeveloperChange = (value: string) => {
    if (value === "all") {
      onDeveloperChange(null);
      
      // Обновляем URL, удаляя параметр developerId если он есть
      const params = new URLSearchParams(searchParams);
      params.delete("developerId");
      router.push(`${pathname}?${params.toString()}`);
    } else {
      onDeveloperChange(value);
      
      // Обновляем URL, добавляя параметр developerId
      const params = new URLSearchParams(searchParams);
      params.set("developerId", value);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <Select
      label={t("filterByDeveloper")}
      placeholder={t("allDevelopers")}
      className="max-w-xs"
      selectedKeys={selectedDeveloperId ? [selectedDeveloperId] : ["all"]}
      onChange={(e) => handleDeveloperChange(e.target.value)}
    >
      <SelectItem key="all" value="all">
        {t("allDevelopers")}
      </SelectItem>
      
      {developers.map((developer) => (
        <SelectItem key={developer.id} value={developer.id}>
          {developer.translations[0]?.name || t("unnamed")}
        </SelectItem>
      ))}
    </Select>
  );
} 