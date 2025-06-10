"use client";

import { useLocale, useTranslations } from "next-intl";

import { IconChevronDown } from "@tabler/icons-react";
import { getAmenityIcon } from "@/utils/amenityIcons";
import { useState } from "react";

interface ComplexAmenitiesProps {
  amenities: Array<{
    id: string;
    amenity: {
      name: string;
      description: string | null;
      translations: Array<{
        locale: string;
        name: string;
      }>;
    };
  }>;
  title?: string;
  maxVisible?: number;
}

export function ComplexAmenities({
  amenities,
  title = "Complex amenities",
  maxVisible = 6
}: ComplexAmenitiesProps) {
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const t = useTranslations("ProjectDetails");
  const locale = useLocale();

  // Функция для получения перевода названия удобства
  const getAmenityTranslation = (name: string) => {
    const normalizedName = name.toLowerCase().replace(/\s+/g, "_");
    return t(`amenities.items.${normalizedName}`, { fallback: name });
  };

  if (!amenities?.length) {
    return null;
  }
  amenities.forEach(amenity => {
    console.log(
      amenity.amenity?.translations.length
        ? amenity.amenity?.translations.find(
            translation => translation.locale === locale
          )?.name
        : amenity.amenity?.name
    );
  });

  return (
    <div className="mt-12 hidden md:block">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-default-900">
        {t("amenities.title")}
      </h2>

      {/* Сетка иконок с названиями */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
        {amenities
          ?.slice(0, showAllAmenities ? undefined : maxVisible)
          ?.map(amenityItem => (
            <div key={amenityItem.id} className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-[#416DC6] rounded-full"></div>
                <div className="relative w-full h-full flex items-center justify-center !text-white">
                  {getAmenityIcon(amenityItem.amenity?.name, "!text-white")}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-base text-gray-600 truncate block">
                  {amenityItem.amenity?.translations.length
                    ? amenityItem.amenity?.translations.find(
                        translation => translation.locale === locale
                      )?.name
                    : amenityItem.amenity?.name}
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* Кнопка "Показать все" */}
      {amenities.length > maxVisible && (
        <button
          className="hover:text-primary/80 flex items-center gap-2 mb-8 w-full justify-center lg:justify-start lg:w-auto bg-[#F5F8FF] lg:bg-transparent text-[#3062B8] text-sm leading-5 font-semibold h-10 lg:h-auto rounded-lg lg:rounded-none"
          onClick={() => setShowAllAmenities(!showAllAmenities)}
        >
          <span>
            {showAllAmenities
              ? t("amenities.showLess")
              : t("amenities.showAll")}
          </span>
          <IconChevronDown
            size={18}
            className={`transform transition-transform ${showAllAmenities ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}
