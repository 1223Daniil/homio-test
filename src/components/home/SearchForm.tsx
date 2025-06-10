'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, Button, Select, TextInput, Tabs, Group } from '@mantine/core';
import { IconMap, IconAdjustments } from '@tabler/icons-react';

interface Option {
  value: string;
  label: string;
}

const propertyTypes: Option[] = [
  { value: 'RESIDENTIAL', label: 'Residential' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'MIXED_USE', label: 'Mixed Use' },
];

const bedroomOptions: Option[] = [
  { value: '1', label: '1 Bedroom' },
  { value: '2', label: '2 Bedrooms' },
  { value: '3', label: '3 Bedrooms' },
  { value: '4', label: '4+ Bedrooms' },
];

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `$${(price / 1000).toFixed(0)}k`;
  }
  return `$${price}`;
}

export default function SearchForm() {
  const t = useTranslations("Home");
  const router = useRouter();
  const locale = useLocale();
  const [searchType, setSearchType] = useState<string>("units");
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [bedrooms, setBedrooms] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMap, setShowMap] = useState(false);
  const [priceRanges, setPriceRanges] = useState<Option[]>([]);

  useEffect(() => {
    // Загружаем диапазон цен при монтировании компонента
    const fetchPriceRange = async () => {
      try {
        const response = await fetch('/api/units/price-range');
        const data = await response.json();
        
        if (data.min !== undefined && data.max !== undefined) {
          // Создаем 4 диапазона цен между минимальной и максимальной ценой
          const step = (data.max - data.min) / 4;
          const ranges: Option[] = [];
          
          for (let i = 0; i < 4; i++) {
            const min = Math.round(data.min + (step * i));
            const max = Math.round(data.min + (step * (i + 1)));
            ranges.push({
              value: `${min}-${max}`,
              label: `${formatPrice(min)} - ${formatPrice(max)}`
            });
          }
          
          setPriceRanges(ranges);
        }
      } catch (error) {
        console.error('Failed to fetch price range:', error);
      }
    };

    fetchPriceRange();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    params.set('type', searchType);
    
    if (propertyType) {
      params.set('propertyType', propertyType);
    }
    
    if (bedrooms) {
      params.set('bedrooms', bedrooms);
    }
    
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      params.set('priceMin', min);
      params.set('priceMax', max);
    }

    if (searchQuery) {
      params.set('q', searchQuery);
    }

    if (showMap) {
      params.set('view', 'map');
    }

    router.push(`/${locale}/search?${params.toString()}`);
  };

  const handleTabChange = (value: string | null) => {
    if (value) {
      setSearchType(value);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg">
      <Tabs defaultValue="units" value={searchType} onTabChange={handleTabChange}>
        <Tabs.List>
          <Tabs.Tab value="units">{t("searchByUnits")}</Tabs.Tab>
          <Tabs.Tab value="projects">{t("searchByProjects")}</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <div className="flex flex-wrap gap-4 mt-4">
        <Select
          className="flex-1 min-w-[200px]"
          placeholder={t("selectPropertyType")}
          data={propertyTypes}
          value={propertyType}
          onChange={setPropertyType}
          clearable
        />
        
        <Select
          className="flex-1 min-w-[200px]"
          placeholder={t("selectBedrooms")}
          data={bedroomOptions}
          value={bedrooms}
          onChange={setBedrooms}
          clearable
        />
        
        <Select
          className="flex-1 min-w-[200px]"
          placeholder={t("selectPriceRange")}
          data={priceRanges}
          value={priceRange}
          onChange={setPriceRange}
          clearable
        />

        <TextInput
          className="flex-1 min-w-[200px]"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
      </div>

      <Group position="apart" mt="md">
        <Group spacing="sm">
          <Button
            variant="light"
            onClick={() => setShowMap(!showMap)}
            leftIcon={<IconMap size={20} />}
          >
            {t("showOnMap")}
          </Button>

          <Button
            variant="light"
            leftIcon={<IconAdjustments size={20} />}
          >
            {t("allFilters")}
          </Button>
        </Group>

        <Button onClick={handleSearch} size="md">
          {t("find")}
        </Button>
      </Group>
    </Card>
  );
} 