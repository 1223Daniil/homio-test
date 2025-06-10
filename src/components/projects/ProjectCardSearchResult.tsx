import {
  Amenity,
  Building,
  Developer,
  DeveloperTranslation,
  Location,
  Project,
  ProjectAmenity,
  ProjectMedia,
  ProjectTranslation,
  Unit
} from "@prisma/client";
import {
  Bookmark,
  ImageIcon,
  MapPin,
  MoreHorizontal,
  Navigation
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import BlurHashImage from "@/components/media/BlurHashImage";
import { Card } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export interface ProjectWithRelations extends Project {
  translations: ProjectTranslation[];
  location: Location | null;
  media: ProjectMedia[];
  buildings: Building[];
  developer: Developer & {
    translations: DeveloperTranslation[];
    logo?: string;
  };
  amenities: (ProjectAmenity & {
    amenity: Amenity;
  })[];
  units: Unit[];
}

interface ProjectCardSearchResultProps {
  project: ProjectWithRelations;
}

// Добавляем константы для изображений
const DEFAULT_PROJECT_IMAGE = "/images/placeholder-project.jpg";
const THUMBNAIL_COUNT = 6;

export function ProjectCardSearchResult({
  project
}: ProjectCardSearchResultProps) {
  const t = useTranslations("Projects");
  const locale = useLocale();

  // Оптимизируем работу с изображениями
  const projectImages = useMemo(() => {
    const media = project.media || [];
    const validMedia = media.filter(m => m.url && m.url.trim() !== "");
    const mainImage = validMedia[0]?.url || DEFAULT_PROJECT_IMAGE;
    const mainBlurhash = validMedia[0]?.blurhash || undefined;
    const thumbnails = validMedia.slice(1, THUMBNAIL_COUNT + 1).map(m => ({
      url: m.url,
      blurhash: m.blurhash || undefined
    }));

    // Дополняем thumbnails плейсхолдерами если их меньше THUMBNAIL_COUNT
    while (thumbnails.length < THUMBNAIL_COUNT) {
      thumbnails.push({ url: DEFAULT_PROJECT_IMAGE, blurhash: undefined });
    }

    return { mainImage, mainBlurhash, thumbnails };
  }, [project.media]);

  const getQuarterAndYear = (date: Date) => {
    const month = date.getMonth();
    const quarter = Math.floor(month / 3) + 1;
    const year = date.getFullYear();
    return `${quarter}${t("searchResult.quarter")}${year}`;
  };

  const translation =
    project.translations?.find(t => t.language === locale) ||
    project.translations?.[0];
  const location = project.location;
  const developerTranslation =
    project.developer?.translations?.find(t => t.language === locale) ||
    project.developer?.translations?.[0];

  // Group units by number of bedrooms
  const unitsByType = (project.units || []).reduce(
    (acc, unit) => {
      const key = unit.bedrooms === 0 ? "studio" : `${unit.bedrooms}-bed`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(unit);
      return acc;
    },
    {} as Record<string, Unit[]>
  );

  // Format price range for each unit type
  const getPriceRange = (units: Unit[] = []) => {
    const prices = units.map(u => u.price).filter(Boolean) as number[];
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return `฿${(min / 1000000).toFixed(1)}M${min !== max ? ` – ฿${(max / 1000000).toFixed(1)}M` : ""}`;
  };

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] lg:grid-cols-[400px_1fr_320px] gap-4 md:gap-6 p-3 md:p-4">
        {/* Left Column - Photos */}
        <div className="space-y-1 mb-6 sm:mb-8 md:mb-0">
          {/* Main Photo */}
          <div className="relative h-[200px] md:h-[280px] rounded-lg overflow-hidden bg-gray-100">
            {projectImages.mainImage === DEFAULT_PROJECT_IMAGE ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
            ) : (
              <BlurHashImage
                src={projectImages.mainImage}
                alt={translation?.name || "Project image"}
                blurhash={projectImages.mainBlurhash}
                className="object-cover"
                quality={70}
                sizes="(max-width: 768px) 100vw, 400px"
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

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-6 gap-1 h-[40px] md:h-[60px]">
            {projectImages.thumbnails.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-md overflow-hidden bg-gray-100"
              >
                {image.url === DEFAULT_PROJECT_IMAGE ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                  </div>
                ) : (
                  <BlurHashImage
                    src={image.url}
                    alt={`Project image ${index + 2}`}
                    blurhash={image.blurhash}
                    className="object-cover"
                    quality={50}
                    sizes="(max-width: 768px) 60px, 100px"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Middle Column - Project Info */}
        <div className="flex flex-col md:pr-6 lg:border-r lg:border-gray-200 order-2 mt-0 sm:mt-2 md:mt-0">
          <div className="flex justify-between items-start mb-4">
            {/* Project Header */}
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-semibold mb-2">
                {translation?.name || t("untitled")}
              </h3>

              <div className="flex items-center gap-1 text-gray-600 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  {location
                    ? `${location.district}, ${location.city}, ${location.country}`
                    : t("untitled")}
                </span>
              </div>

              {location?.beachDistance && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Navigation className="w-4 h-4" />
                  <span>
                    {t("searchResult.mapCard.nearestBeach")} •{" "}
                    {location.beachDistance}
                    {t("searchResult.mapCard.meters")}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons - Tablet and Desktop */}
            <div className="hidden md:flex lg:hidden items-center gap-2">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bookmark className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Unit Types Grid */}
          <div className="mb-4 md:mb-6">
            <div className="flex gap-6">
              <div className="">
                <div>
                  {getPriceRange(unitsByType["studio"]) && (
                    <>
                      <div className="text-sm text-gray-500">
                        {t("searchResult.studio")}
                      </div>
                      <div className="text-sm font-medium whitespace-nowrap">
                        {getPriceRange(unitsByType["studio"])}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {getPriceRange(unitsByType["1-bed"]) && (
                    <>
                      <div className="text-sm text-gray-500">
                        {t("searchResult.oneBed")}
                      </div>
                      <div className="text-sm font-medium whitespace-nowrap">
                        {getPriceRange(unitsByType["1-bed"])}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {getPriceRange(unitsByType["2-bed"]) && (
                    <>
                      <div className="text-sm text-gray-500">
                        {t("searchResult.twoBed")}
                      </div>
                      <div className="text-sm font-medium whitespace-nowrap">
                        {getPriceRange(unitsByType["2-bed"])}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  {getPriceRange(unitsByType["3-bed"]) && (
                    <>
                      <div className="text-sm text-gray-500">
                        {t("searchResult.threeBed")}
                      </div>
                      <div className="text-sm font-medium whitespace-nowrap">
                        {getPriceRange(unitsByType["3-bed"])}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {getPriceRange(unitsByType["4-bed"]) && (
                    <>
                      <div className="text-sm text-gray-500">
                        {t("searchResult.fourBed")}
                      </div>
                      <div className="text-sm font-medium whitespace-nowrap">
                        {getPriceRange(unitsByType["4-bed"])}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {getPriceRange(unitsByType["5-bed"]) && (
                    <>
                      <div className="text-sm text-gray-500">
                        {t("searchResult.fiveBed")}
                      </div>
                      <div className="text-sm font-medium whitespace-nowrap">
                        {getPriceRange(unitsByType["5-bed"])}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Project Stats */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="flex gap-6 text-sm">
              <div className="flex-shrink-0">
                <div className="text-gray-500">{t("searchResult.offDate")}</div>
                <div className="font-medium">
                  {project.completionDate
                    ? getQuarterAndYear(new Date(project.completionDate))
                    : `4${t("searchResult.quarter")}2028`}
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="text-gray-500">
                  {t("searchResult.buildings")}
                </div>
                <div className="font-medium">
                  {project.buildings?.length || 0}
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="text-gray-500">{t("searchResult.units")}</div>
                <div className="font-medium">
                  {project.units.filter(unit => unit.status === "AVAILABLE")
                    .length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Actions and Developer Info */}
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
              {project.developer?.logo && (
                <div className="w-12 h-12 rounded-lg border border-gray-200 relative overflow-hidden">
                  <BlurHashImage
                    src={project.developer.logo}
                    alt={developerTranslation?.name || "Developer logo"}
                    className="object-cover"
                    quality={70}
                  />
                </div>
              )}
              <div>
                <div className="text-xs text-gray-500">
                  {t("searchResult.developer")}
                </div>
                <div className="font-medium">{developerTranslation?.name}</div>
              </div>
            </div>

            <Link
              href={`/${locale}/p/${project.slug}`}
              className={cn(
                "block w-full md:w-[320px] px-6 py-2.5 text-center rounded-lg",
                "bg-blue-600 text-white font-medium",
                "hover:bg-blue-700 transition-colors"
              )}
            >
              {t("searchResult.viewDetails")}
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
