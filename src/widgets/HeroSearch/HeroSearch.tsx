"use client";

import { Select, SelectItem } from "@heroui/select";

import { ProjectType } from "@prisma/client";
import { Slider } from "@/components/ui/Slider";
import styles from "./HeroSearch.module.css";
import { useForm } from "react-hook-form";
import { useState } from "react";

interface Props {
  bedroomsRange: {
    min: number;
    max: number;
  };
  pricesRange?: {
    min: number;
    max: number;
  };
}

interface PropertyTypeItem {
  label: ProjectType;
  value: ProjectType;
}

interface BedroomItem {
  label: string;
  value: string;
}

const HeroSearch = ({ bedroomsRange, pricesRange }: Props) => {
  const { register, setValue, watch } = useForm();

  const bedroomsList: BedroomItem[] = Array.from(
    { length: bedroomsRange.max - bedroomsRange.min + 1 },
    (_, i) => ({
      label: `${bedroomsRange.min + i}`,
      value: `${bedroomsRange.min + i}`
    })
  );

  const defaultBedrooms =
    bedroomsList.length > 0 && bedroomsList[0]
      ? [bedroomsList[0].value]
      : ["1"];

  const defaultPriceRange = pricesRange
    ? [pricesRange.min, pricesRange.max]
    : [0, 1000000];
  const [priceValue, setPriceValue] = useState<number[]>(defaultPriceRange);

  const handlePriceChange = (values: number[]) => {
    setPriceValue(values);
    setValue("priceMin", values[0]);
    setValue("priceMax", values[1]);
  };

  const propertyList = getPropertyTypes();
  const defaultPropertyType: ProjectType[] =
    propertyList.length > 0 && propertyList[0]
      ? [propertyList[0].value]
      : ["RESIDENTIAL" as ProjectType];

  return (
    <div className={``}>
      <h1 className={`${styles.title}`}>
        Next-gen real estate hub for developers and agents
      </h1>
      <div className={`${styles.searchForm}`}>
        <div className={`${styles.tabs}`}>
          <div className={`${styles.tab}`}>
            <p>Search by units</p>
          </div>
          <div className={`${styles.tab}`}>
            <p>Search by projects</p>
          </div>
        </div>

        <div className={`${styles.searchInput}`}>
          <Select
            {...register("propertyType")}
            defaultSelectedKeys={defaultPropertyType}
            items={propertyList}
            className={`${styles.select}`}
            radius={"none"}
          >
            {(item: PropertyTypeItem) => (
              <SelectItem key={item.value}>{item.label}</SelectItem>
            )}
          </Select>

          <Select
            {...register("bedrooms")}
            defaultSelectedKeys={defaultBedrooms}
            items={bedroomsList}
            className={`${styles.select}`}
            radius={"none"}
          >
            {(item: BedroomItem) => (
              <SelectItem key={item.value}>{item.label}</SelectItem>
            )}
          </Select>

          {/* Ползунок для выбора диапазона цен */}
          {pricesRange && (
            <div className={`${styles.rangeContainer}`}>
              <label className="block text-sm font-medium mb-1">
                Цена: {priceValue[0]} - {priceValue[1]}
              </label>
              <Slider
                value={priceValue}
                min={pricesRange.min}
                max={pricesRange.max}
                step={1000}
                aria-label="Диапазон цен"
                onValueChange={handlePriceChange}
                formatLabel={value => String(value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getPropertyTypes = (): PropertyTypeItem[] => {
  return Object.values(ProjectType).map(type => ({
    label: type,
    value: type
  }));
};

export default HeroSearch;
