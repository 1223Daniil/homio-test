import { BreadcrumbItem, Breadcrumbs } from "@heroui/react";
import { DocumentCategory, MediaCategory } from "@prisma/client";
import {
  DomainProject,
  ProjectTranslation as DomainProjectTranslation
} from "@/types/domain";

// Импортируем компоненты для разделения частей страницы
import AboutProject from "./AboutProject/AboutProject";
import BelowFold from "./BelowFold";
import Head from "next/head";
import Hero from "@/widgets/ProjectDetails/Hero";
import HeroSimple from "@/widgets/ProjectDetails/Hero/HeroSimple";
import { Link } from "@/config/i18n";
import ProjectAdaptiveSlider from "@/shared/components/ProjectAdaptiveSlider/ProjectAdaptiveSlider";
import RightColumn from "./RightColumn";
import { formatNumberType } from "@/utils/formatPrice";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

// Удаляем неиспользуемые импорты и компоненты
function AdaptiveContainer({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${className}`}
    >
      {children}
    </div>
  );
}

interface HeroData {
  developer: {
    id: string;
    name: string;
    image: string;
  };
  project: {
    images: {
      name: string;
      url: string;
      type: "video" | "image";
      blurhash?: string;
    }[];
    name: string;
    price: string;
    location: string;
    beach: {
      name: string;
      distance: string;
    };
  };
}

interface BottomBarData {
  offDate: string;
  deliveryStage: string;
  totalArea: number;
  infrastructureArea: number;
  buildings: number;
  units: number;
  class: string;
}

interface PriceRangeData {
  minPrice: number;
  maxPrice: number;
  currencyCode: string;
}

interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  validUntil: string | null;
  icon: string;
}

interface ProjectDeveloper {
  id: string;
  name: string;
  rating?: number;
  completedProjects?: number;
  translations: Array<{
    language: string;
    name: string;
    description?: string;
  }>;
  logo?: string;
  establishedYear?: number;
  deliveryRate?: number;
  ongoingProjects?: number;
}

export default function ProjectPagePublic({
  project,
  developer,
  currentTranslation,
  amenities,
  masterPlanPoints,
  projectBuildingsData: serverProjectBuildingsData,
  locale,
  slug,
  priceRangeData,
  specialOffers,
  projectSlider
}: {
  project: DomainProject;
  developer: ProjectDeveloper;
  currentTranslation: DomainProjectTranslation;
  amenities: any;
  masterPlanPoints: any;
  projectBuildingsData?: any[];
  locale: string;
  slug: string;
  priceRangeData: PriceRangeData | null;
  specialOffers: SpecialOffer[];
  projectSlider: "hide" | "show" | "replace";
}) {
  const t = useTranslations("ProjectDetails");
  const amountsT = useTranslations("Amounts");
  const developerT = useTranslations("Developers");
  const currenciesT = useTranslations("projects.currency.symbols");
  const unitT = useTranslations("UnitDetail");

  // Получаем URL главного изображения для предзагрузки
  const mainImageUrl = useMemo(() => {
    // Фильтруем изображения, исключая видео
    const images = project.media.filter(
      media => media.type !== "video" && media.url
    );

    // Находим обложку (если есть)
    const coverImage = images.find(media => (media as any).isCover);

    // Возвращаем обложку или первое доступное изображение
    return coverImage?.url || images[0]?.url || "";
  }, [project.media]);

  // Проверяем, является ли URL действительным изображением, а не видео
  const isValidImage = useMemo(() => {
    const videoExtensions = [".mp4", ".webm", ".m3u8"];
    const isVideo = videoExtensions.some(ext =>
      mainImageUrl.toLowerCase().includes(ext)
    );
    return mainImageUrl && !isVideo;
  }, [mainImageUrl]);

  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return "TBA";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      if (isNaN(d.getTime())) return "TBA";
      const month = d.toLocaleString("en-US", { month: "long" });
      const monthIndex = d.getMonth();
      return `${monthIndex + 1}/${d.getFullYear()}`;
    } catch (e) {
      return "TBA";
    }
  };

  const getPriceRange = () => {
    if (!priceRangeData) return null;

    const { minPrice, maxPrice, currencyCode } = priceRangeData;

    const formattedMin = formatNumberType(minPrice);
    const formattedMax = formatNumberType(maxPrice);

    try {
      const currencySymbol = currenciesT(project.currency as any);

      const minPrice = amountsT(formattedMin.type as any);
      const maxPrice = amountsT(formattedMax.type as any);

      return t("slider.price-range", {
        min: `${currencySymbol}${formattedMin.number}${minPrice}`,
        max: `${currencySymbol}${formattedMax.number}${maxPrice}`
      });
    } catch (error) {
      console.error("Error formatting price range:", error);
      return `${currencyCode}${minPrice} - ${currencyCode}${maxPrice}`;
    }
  };

  const priceRange = getPriceRange();

  const developerName =
    developer?.translations?.find(t => t.language === locale)?.name ||
    (developer?.translations?.[0]?.name // Added optional chaining for [0] and .name
      ? developer.translations[0].name
      : "");

  // Фильтруем медиа для категории AMENITIES один раз
  const amenitiesMedia = project?.media
    ? project.media.filter(media => media.category === MediaCategory.AMENITIES)
    : [];

  // Фильтруем документы с категорией GENERAL один раз
  const generalDocuments = project?.documents
    ? project.documents.filter(doc => doc.category === DocumentCategory.GENERAL)
    : [];

  // Преобразуем данные для Hero компонента
  const heroData: HeroData = {
    developer: {
      id: developer?.id || "",
      name:
        developerName && developerName.length > 15
          ? developerName.slice(0, 15) + "..."
          : developerName || "",
      image: developer?.logo || ""
    },
    project: {
      images: project.media.map(media => ({
        name: media.title || "",
        url: media.url,
        type: media.type === "video" ? "video" : "image",
        blurhash: (media as any).blurhash || undefined
      })),
      name: currentTranslation.name,
      price: priceRange || t("units.priceOnRequest"), // Используем пересчитанный priceRange
      location: `${project.location?.district || ""}, ${project.location?.city || ""}, ${project.location?.country || ""}`,
      beach: {
        name: project.location?.beachDistance
          ? String(project.location?.beachDistance)
          : "",
        distance: project.location?.beachDistance
          ? unitT("developer-widget.beach", {
              distance: project.location?.beachDistance
            })
          : unitT("developer-widget.beachDistanceNotSpecified")
      }
    }
  };

  const heroBottomBarData: BottomBarData = {
    offDate: project.completionDate || "TBA",
    deliveryStage: String(project.phase || ""),
    totalArea: project.totalLandArea || 0,
    infrastructureArea: project.infrastructureArea || 0,
    buildings: project?.buildings?.length || 0,
    units: project.units?.length || 0,
    class: project?.class || ""
  };

  const formatProjectsText = (count: number, locale: string) => {
    if (locale === "ru") {
      if (count === 1) return "проект";
      if (count >= 2 && count <= 4) return "проекта";
      return "проектов";
    }
    return "projects";
  };

  return (
    <>
      {isValidImage && (
        <Head>
          <link
            rel="preload"
            as="image"
            href={mainImageUrl}
            fetchPriority="high"
          />
        </Head>
      )}

      <div className="min-h-screen overflow-x-hidden pb-12 mt-[6rem]">
        <AdaptiveContainer>
          <Breadcrumbs className="mb-4 hidden lg:block">
            <BreadcrumbItem>
              <Link href="/search">{t("breadcrumbs.projects")}</Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Link href={`/p/${slug}`}>{currentTranslation.name || ""}</Link>
            </BreadcrumbItem>
          </Breadcrumbs>

          {projectSlider === "show" && (
            <Hero data={heroData} bottomBar={heroBottomBarData} />
          )}
          {projectSlider === "replace" && (
            <HeroSimple data={heroData} bottomBar={heroBottomBarData} />
          )}

          <ProjectAdaptiveSlider
            media={(project?.media || [])
              .filter(m => m.category !== null && m.category !== undefined)
              .map(m => ({
                id: m.id || "",
                projectId: m.projectId || "",
                url: m.url,
                type: m.type,
                category: m.category as MediaCategory, // Теперь можно безопасно привести тип
                title: m.title || null,
                description: m.description || null,
                order: m.order || 0,
                createdAt: m.createdAt || new Date(),
                updatedAt: m.updatedAt || new Date(),
                // Provide all required fields with defaults
                metadata: (m as any).metadata || null,
                thumbnailUrl: (m as any).thumbnailUrl || m.url, // Use main url as fallback thumbnail?
                isCover: (m as any).isCover || false,
                isMainVideo: (m as any).isMainVideo || false,
                blurhash: (m as any).blurhash || null
              }))}
          />
        </AdaptiveContainer>

        {/* Основной контент */}
        <AdaptiveContainer className="mt-4 lg:mt-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* Левая колонка */}
            <div className="w-full lg:w-[calc(100%-280px-2rem)]">
              {/* О проекте - критическая информация (выше сгиба) */}
              <AboutProject
                currentTranslation={{
                  ...currentTranslation,
                  locale: locale
                }}
                project={project}
                developer={developer}
                priceRange={priceRange || ""}
              />

              {/* Все что ниже - некритическая часть, выносим в отдельный компонент */}
              <BelowFold
                project={project}
                developer={developer}
                currentTranslation={currentTranslation}
                amenities={amenities}
                masterPlanPoints={masterPlanPoints}
                projectBuildingsData={serverProjectBuildingsData || []}
                locale={locale}
                specialOffers={specialOffers}
                generalDocuments={generalDocuments}
                amenitiesMedia={amenitiesMedia}
                priceRange={priceRange || ""}
                formatDate={formatDate}
                formatProjectsText={formatProjectsText}
                t={t}
                developerT={developerT}
              />
            </div>

            {/* Правая колонка */}
            <RightColumn
              project={project}
              currentTranslation={currentTranslation}
              priceRange={priceRange || ""}
              t={t}
            />
          </div>
        </AdaptiveContainer>
      </div>
    </>
  );
}
