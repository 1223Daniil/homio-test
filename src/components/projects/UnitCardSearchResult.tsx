import { Bookmark, MapPin, MoreHorizontal, Navigation } from "lucide-react";
import {
  DeveloperTranslation,
  Media,
  Project,
  ProjectMedia,
  ProjectTranslation,
  Unit,
  UnitFeature,
  UnitLayout
} from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";

import BlurHashImage from "@/components/media/BlurHashImage";
import { Card } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { ProjectWithRelations } from "@/app/[locale]/search/types";
import { cn } from "@/lib/utils";

export interface UnitWithRelations extends Unit {
  media: Media[];
  project: ProjectWithRelations;
  building: {
    floors: number;
    floorPlans: {
      url: string;
    }[];
  };
  features?: UnitFeature[];
  layout?: {
    id: string;
    mainImage: string | null;
    bedrooms?: number;
    type?: string;
    totalArea?: number;
    images?: string[];
  };
}

interface UnitCardSearchResultProps {
  unit: UnitWithRelations;
  unitsImages: string[];
}

export function UnitCardSearchResult({ unit }: UnitCardSearchResultProps) {
  const t = useTranslations("Units");
  const locale = useLocale();

  const mainImage =
    unit.layout?.mainImage ||
    unit.project.media?.[0]?.url ||
    "/placeholder.jpg";

  // Получаем blurhash если он есть
  const blurhash = unit.layout?.mainImage
    ? undefined // Если изображение из layout, то у нас нет blurhash
    : unit.project.media?.[0]?.blurhash || undefined;

  // Форматирование цены в миллионах бат
  const formatPrice = (price: number) => {
    const millions = price / 1000000;
    return `฿${millions.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${t("unitSearchResult.millions")}`;
  };

  // Форматирование цены за квадратный метр
  const formatPricePerSqm = (price: number, area: number) => {
    if (!price || !area) return "";
    const pricePerSqm = Math.round(price / area);
    return `฿${pricePerSqm.toLocaleString("en-US")} / ${t("unitSearchResult.area")}`;
  };

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] lg:grid-cols-[400px_1fr_320px] gap-4 md:gap-6 p-3 md:p-4">
        {/* Левая колонка - План этажа */}
        <div className="relative h-[200px] md:h-[280px] rounded-lg overflow-hidden bg-gray-100">
          {blurhash ? (
            <BlurHashImage
              src={mainImage}
              alt={`Floor plan for ${unit.number || ""}`}
              blurhash={blurhash}
              className="object-cover"
              quality={70}
              sizes="(max-width: 768px) 100vw, 400px"
              priority
            />
          ) : (
            <Image
              src={mainImage}
              alt={`Floor plan for ${unit.number || ""}`}
              className="w-full h-full object-cover"
              width={400}
              height={280}
              priority
            />
          )}
          {/* Action Buttons - Mobile only */}
          <div className="absolute top-2 right-2 flex items-center gap-2 md:hidden">
            <button className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 shadow-sm">
              <MoreHorizontal className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 shadow-sm">
              <Bookmark className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Средняя колонка - Информация о юните */}
        <div className="flex flex-col justify-between md:pr-6 lg:border-r lg:border-gray-200 py-2 md:py-4 order-2 mt-0 sm:mt-2 md:mt-0">
          <div className="space-y-4">
            {/* Заголовок, цена и кнопки для планшета */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  {unit.layout?.bedrooms
                    ? `${t(`unitSearchResult.${unit.layout.bedrooms}Bed`)} ${t(`unitSearchResult.type.${unit.layout.type || "none"}`)} • ${unit.layout?.totalArea}${t("unitSearchResult.area")} • ${unit.floor}/${unit.building.floors} ${t("unitSearchResult.floor")}`
                    : `${t(`unitSearchResult.${unit.bedrooms}Bed`)} ${t(`unitSearchResult.type.${unit.type || "none"}`)} • ${unit.area}${t("unitSearchResult.area")} • ${unit.floor}/${unit.building.floors} ${t("unitSearchResult.floor")}`}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-semibold text-blue-600">
                    {formatPrice(unit.price || 0)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatPricePerSqm(unit.price || 0, unit.area || 0)}
                  </div>
                </div>
              </div>

              {/* Action Buttons - Tablet only */}
              <div className="hidden md:flex lg:hidden items-center gap-2">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Bookmark className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Нижняя часть с информацией о проекте */}
          <div className="space-y-2 mt-auto">
            <div>
              <div className="text-base font-medium">
                {t("unitSearchResult.project")}: "{unit.project.name}"
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {unit.project.location?.district}, {unit.project.location?.city}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              {unit.project.location?.beachDistance && (
                <>
                  <Navigation className="w-4 h-4" />
                  <span className="text-sm">
                    {t("unitSearchResult.mapCard.nearestBeach")} •{" "}
                    {unit.project.location?.beachDistance}
                    {t("unitSearchResult.mapCard.meters")}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Правая колонка - Действия */}
        <div className="flex flex-col order-3">
          {/* Action Buttons - Desktop only */}
          <div className="hidden lg:flex items-center justify-end gap-2 mb-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bookmark className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Developer Info */}
          <div className="mt-auto space-y-4 md:space-y-6">
            <div className="flex items-center gap-3">
              {unit.project.developer?.logo && (
                <div className="w-12 h-12 rounded-lg border border-gray-200 relative overflow-hidden">
                  <BlurHashImage
                    src={unit.project.developer.logo}
                    alt={unit.project.developer.name || "Developer logo"}
                    className="object-cover"
                    quality={70}
                  />
                </div>
              )}
              <div>
                <div className="text-xs text-gray-500">
                  {t("unitSearchResult.developer")}
                </div>
                <div className="font-medium">
                  {unit.project.developer.translations?.[0]?.name}
                </div>
              </div>
            </div>

            <Link
              href={`/${locale}/p/${unit.project.slug}/units/${unit.slug}`}
              className={cn(
                "block w-full md:w-[320px] px-6 py-2.5 text-center rounded-lg",
                "bg-blue-600 text-white font-medium",
                "hover:bg-blue-700 transition-colors"
              )}
            >
              {t("unitSearchResult.viewDetails")}
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
