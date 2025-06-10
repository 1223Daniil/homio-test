"use client";

import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { FloorPlan, Prisma, UserRole } from "@prisma/client";
import { Link, useRouter } from "@/config/i18n";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import AboutUnit from "@/widgets/AboutUnit";
import { Alert } from "@mantine/core";
import { ComplexAmenities } from "@/components/amenities/ComplexAmenities";
import DeveloperMiniCard from "@/widgets/DeveloperMiniCard";
import { IconEdit } from "@tabler/icons-react";
import InfrastructureMap from "@/components/infrastructure/InfrastructureMap";
import MediaFilters from "@/shared/components/MediaFilters";
import MediaGalleyModal from "@/widgets/modals/MediaGalleyModal";
import MediaSlider from "@/widgets/MediaSlider";
import { Button as NextButton } from "@heroui/react";
import PersonalBroker from "@/widgets/PersonalBroker";
import ProjectAdaptiveSlider from "@/shared/components/ProjectAdaptiveSlider/ProjectAdaptiveSlider";
import { ProjectWithRelations } from "@/types/project";
import RequestView from "@/widgets/RequestView";
import SimilarProjects from "@/widgets/SimilarProjects";
import SimilarUnits from "@/widgets/SimilarUnits";
import UnitAboutBuilding from "@/widgets/UnitAboutBuilding";
import UnitPurchaseConditions from "@/widgets/UnitPurchaseConditions";
import UnitQuickActions from "@/widgets/UnitQuickActions";
import UnitYieldCalculator from "@/widgets/UnitYieldCalculator";
import { ViewingRequestModal } from "@/components/projects/ViewingRequestModal";
import { transformProjectAssessment } from "@/components/projects/ProjectDetail/ProjectDetail";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

// Расширенный тип для Unit с включенными связями
type UnitWithRelations = Prisma.UnitGetPayload<{
  include: {
    media: true;
    building: {
      include: {
        media: true;
      };
    };
    project: {
      include: {
        media: true;
        location: true;
        amenities: {
          include: {
            amenity: true;
          };
        };
        yield: {
          select: {
            expected: true;
            guaranteed: true;
            potential: true;
          };
        };
      };
    };
  };
}>;

// Унифицированный интерфейс для медиа-элементов
interface MediaItem {
  url: string;
  title?: string | null;
  category?: string;
  floorPlan?: string;
  [key: string]: any;
}

// Интерфейс для фактов о юните
interface UnitFactsType {
  bedrooms: string;
  bathrooms: string;
  area: string;
  floor: string;
  completion: string;
}

// Интерфейс для состояния медиа-фильтра
interface MediaFilterState {
  isOpen: boolean;
  view: "Gallery" | "Layout" | "3d" | null;
}

// Интерфейс для состояния планов этажей
interface FloorPlansState {
  currentUnitId: string;
  floorPlans: FloorPlan[];
  layoutImage: string | null;
}

// Интерфейс для карточки девелопера
interface DeveloperCardData {
  project: {
    name: string;
    link: string;
    location: {
      address: string;
      beach: string;
      distance: string;
    };
  };
  developer: {
    name: string;
    link: string;
    image: string;
  };
}

/**
 * Проверяет, является ли юнит виллой
 */
const isUnitVilla = (unit: any): boolean => {
  return Boolean(unit?.layout?.type === "VILLA");
};

/**
 * Форматирует заголовок юнита в зависимости от типа
 */
const formatUnitTitle = (unit: any, tUnit: any): string => {
  if (isUnitVilla(unit)) {
    return tUnit("request-viewing.unit-title-villa", {
      bed: unit?.layout?.bedrooms || unit?.bedrooms,
      area: unit?.layout?.totalArea || unit?.area
    });
  }

  return tUnit("request-viewing.unit-title", {
    bed: unit?.layout?.bedrooms || unit?.bedrooms,
    area: unit?.layout?.totalArea || unit?.area,
    floor: unit?.floor,
    floors: unit?.building?.floors
  });
};

/**
 * Подготавливает медиа для галереи из юнита и проекта
 */
const prepareMediaGalleryImages = (unit: any, project: any): any[] => {
  const unitMedia = unit?.media || [];
  const projectMedia = project?.media || [];

  return [
    ...unitMedia.map((media: any) => ({
      url: media.url,
      type: "image",
      category: media.category,
      interior: true,
      blurhash: media.blurhash
    })),
    ...projectMedia.map((media: any) => ({
      url: media.url,
      type: "image",
      category: media.category,
      interior: false,
      blurhash: media.blurhash
    }))
  ];
};

/**
 * Подготавливает факты о юните в формате объекта для компонента AboutUnit
 */
const prepareUnitFacts = (
  unit: any,
  building: any,
  project: any,
  tUnit: any
): UnitFactsType => {
  return {
    bedrooms: String(unit?.bedrooms || 0),
    bathrooms: String(unit?.bathrooms || 0),
    area: unit?.area
      ? `${unit.area} ${tUnit("developer-widget.sqm")}`
      : tUnit("no-data"),
    floor:
      unit?.floor && building?.floors
        ? `${unit.floor}/${building.floors}`
        : tUnit("no-data"),
    completion: project?.completionDate
      ? new Date(project.completionDate).toLocaleDateString()
      : tUnit("no-data")
  };
};

/**
 * Подготавливает данные для карточки девелопера
 */
const prepareDeveloperCard = (
  project: any,
  developer: any,
  unitProjectId: string,
  tUnit: any,
  locale: string
): DeveloperCardData => {
  return {
    project: {
      name: project.translations?.[0]?.name || tUnit("no-data"),
      link: `/projects/${unitProjectId}`,
      location: {
        address: `${project.location?.city || tUnit("no-data")}, ${project.location?.district || tUnit("no-data")}`,
        beach: project.location?.beachDistance
          ? tUnit("developer-widget.beach", {
              distance: project.location.beachDistance
            })
          : tUnit("developer-widget.beachDistanceNotSpecified"),
        distance: project.location?.centerDistance
          ? `${project.location.centerDistance}`
          : tUnit("no-data")
      }
    },
    developer: developer
      ? {
          name:
            developer.translations?.find(
              (translation: any) => translation.language === locale
            )?.name ||
            developer.translations?.[0]?.name ||
            tUnit("no-data"),
          link: `/developers/${developer.id || ""}`,
          image: developer.logo || "/images/default-developer.png"
        }
      : {
          name: tUnit("no-data"),
          link: "#",
          image: "/images/default-developer.png"
        }
  };
};

/**
 * Обрабатывает данные макета и возвращает массив медиа-элементов
 */
const processLayoutData = (unit: any, layout: any): MediaItem[] => {
  const layoutImages: MediaItem[] = [];

  try {
    if (unit.layoutId && layout) {
      // Добавление основного изображения
      if (layout.mainImage) {
        layoutImages.push({ url: layout.mainImage, title: null });
      }

      // Обработка дополнительных изображений
      if (layout.images && Array.isArray(layout.images)) {
        const additionalImages = layout.images
          .map(img => {
            if (typeof img === "string") {
              return { url: img, title: null };
            } else if (img && typeof img === "object" && "url" in img) {
              return { url: img.url, title: img.title || null };
            }
            return null;
          })
          .filter(Boolean) as MediaItem[];

        return [...layoutImages, ...additionalImages];
      }
    }
  } catch (error) {
    console.error("Error processing layout data:", error);
  }

  return layoutImages;
};

/**
 * Находит перевод для текущей локали
 */
const findTranslation = (translations: any, locale: string) => {
  if (!translations) return null;

  return Array.isArray(translations)
    ? translations.find((t: any) => t?.language === locale)
    : null;
};

/**
 * Основной компонент детальной страницы юнита
 */
export default function UnitDetailContent({
  unit,
  project,
  building,
  similarProjects,
  similarUnits,
  amenities,
  developer,
  layout,
  aboutBuilding
}: {
  unit: UnitWithRelations;
  project: ProjectWithRelations;
  building: any;
  similarProjects: ProjectWithRelations[];
  similarUnits: UnitWithRelations[];
  amenities: any;
  developer: any;
  layout: any;
  aboutBuilding: any;
}) {
  // Инициализация хуков и контекста
  const router = useRouter();
  const params = useParams<{ id: string; unitId: string }>();
  const user = useSession();
  const t = useTranslations("ProjectDetails");
  const tUnit = useTranslations("UnitDetail");
  const locale = useLocale();

  // Состояние компонента
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layoutImages, setLayoutImages] = useState<MediaItem[]>([]);
  const [translation, setTranslation] = useState<any>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [unitFacts, setUnitFacts] = useState<UnitFactsType>({
    bedrooms: "",
    bathrooms: "",
    area: "",
    floor: "",
    completion: ""
  });
  const [miniDeveloperCardData, setMiniDeveloperCardData] =
    useState<DeveloperCardData | null>(null);
  const [mediaGalleryImages, setMediaGalleryImages] = useState<any[]>([]);
  const [mediaFilter, setMediaFilter] = useState<MediaFilterState>({
    isOpen: false,
    view: null
  });
  const [isViewingRequestOpen, setIsViewingRequestOpen] = useState(false);
  const [floorPlans, setFloorPlans] = useState<FloorPlansState>({
    currentUnitId: params?.unitId || "",
    floorPlans: [],
    layoutImage: null
  });

  // Мемоизированные функции обработки данных
  const updateFloorPlans = useCallback((buildingData: any) => {
    if (buildingData?.id && buildingData.floorPlans) {
      setFloorPlans(prev => ({
        ...prev,
        floorPlans: buildingData.floorPlans
      }));
    }
  }, []);

  const validateParams = useCallback(() => {
    if (!params || !params.id || !params.unitId) {
      throw new Error("Missing required parameters");
    }

    if (!unit) {
      throw new Error("Failed to fetch unit");
    }

    if (!project) {
      throw new Error("Failed to fetch project");
    }
  }, [params, unit, project]);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Проверка наличия необходимых параметров
        validateParams();

        // Загрузка планов этажей из здания
        updateFloorPlans(building);

        // Обработка данных макета (layout)
        const processedLayoutImages = processLayoutData(unit, layout);
        setLayoutImages(processedLayoutImages);

        // Подготавливаем данные для карточки девелопера
        const developerCardData = prepareDeveloperCard(
          project,
          developer,
          unit.project.id,
          tUnit,
          locale
        );
        setMiniDeveloperCardData(developerCardData);

        // Устанавливаем факты о юните
        const facts = prepareUnitFacts(unit, building, project, tUnit);
        setUnitFacts(facts);

        // Обработка перевода
        const translationItem = findTranslation(unit.translations, locale);
        setTranslation(translationItem || null);

        // Подготовка медиа-галереи
        const galleryImages = prepareMediaGalleryImages(unit, project);
        setMediaGalleryImages(galleryImages);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    locale,
    params?.id,
    params?.unitId,
    project,
    unit,
    building,
    tUnit,
    layout,
    developer,
    validateParams,
    updateFloorPlans
  ]);

  // Управление overflow для body при открытии модалки
  useEffect(() => {
    document.body.style.overflow = mediaFilter.isOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mediaFilter.isOpen]);

  // Обработчики событий
  const handleViewingRequestOpen = () => setIsViewingRequestOpen(true);
  const handleViewingRequestClose = () => setIsViewingRequestOpen(false);
  const handleEditButtonClick = () => {
    if (params?.id && params?.unitId) {
      router.push(`/projects/${params.id}/units/${params.unitId}/edit`);
    }
  };
  const handleMediaFilterOpen = (filter: Partial<MediaFilterState>) => {
    setMediaFilter(prev => ({ ...prev, ...filter, isOpen: true }));
  };

  // Отображение ошибки загрузки
  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-8">
        <Alert color="danger">{error}</Alert>
      </div>
    );
  }

  // Отображение ошибки отсутствия юнита
  if (!unit) {
    return (
      <div className="max-w-[1448px] mx-auto px-8">
        <Alert color="secondary">{t("unit.notFound")}</Alert>
      </div>
    );
  }

  // Формирование заголовка юнита
  const unitTitle = formatUnitTitle(unit, tUnit);

  // Рендер компонента
  return (
    <div className="max-w-[1448px] mx-auto px-8 py-8">
      {/* Модальные окна */}
      <MediaGalleyModal
        isOpen={mediaFilter}
        setIsOpen={setMediaFilter}
        images={mediaGalleryImages || []}
        floorPlans={floorPlans}
      />

      <ViewingRequestModal
        isOpen={isViewingRequestOpen}
        onClose={handleViewingRequestClose}
        projectId={params?.id || ""}
        projectName={project?.translations?.[0]?.name || ""}
      />

      {/* Хедер страницы с навигацией и кнопкой редактирования */}
      <div className="mb-6 flex justify-between">
        <div className="hidden md:block">
          <Breadcrumbs>
            <BreadcrumbItem>
              <Link href="/projects">{t("breadcrumbs.projects")}</Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Link href={`/projects/${params?.id || ""}`}>
                {project?.translations?.[0]?.name || ""}
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Link
                href={`/projects/${params?.id || ""}/units/${params?.unitId || ""}`}
              >
                {unitTitle}
              </Link>
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>

        {params?.id &&
          params?.unitId &&
          user.data?.user.role !== UserRole.AGENT && (
            <NextButton
              color="primary"
              variant="flat"
              startContent={<IconEdit size={20} />}
              onPress={handleEditButtonClick}
            >
              {t("unit.editUnit")}
            </NextButton>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Левая колонка: основное содержимое */}
        <div className="lg:col-span-8">
          {/* Медиа слайдер */}
          {mediaGalleryImages.length > 0 && (
            <>
              <MediaSlider media={mediaGalleryImages} />
              <ProjectAdaptiveSlider media={mediaGalleryImages} />
            </>
          )}

          {/* Фильтры медиа */}
          {mediaGalleryImages.length > 0 && (
            <MediaFilters setIsOpen={handleMediaFilterOpen} className="mt-12" />
          )}

          {/* Основная информация о юните */}
          <AboutUnit
            price={unit.price || 0}
            currency={(unit.project?.currency as string) || "USD"}
            description={translation?.description || ""}
            facilities={layout?.facilities || []}
            factsList={unitFacts as any}
            underHeaderContent={
              !mediaGalleryImages.length && (
                <MediaFilters
                  setIsOpen={handleMediaFilterOpen}
                  className="mt-12"
                />
              )
            }
            project={{
              name: project.translations?.[0]?.name || tUnit("no-data"),
              location: {
                address: `${project.location?.city || tUnit("no-data")}, ${project.location?.district || tUnit("no-data")}`,
                beach: project.location?.beachDistance
                  ? tUnit("developer-widget.beach", {
                      distance: project.location.beachDistance
                    })
                  : tUnit("developer-widget.beachDistanceNotSpecified"),
                distance: project.location?.centerDistance
                  ? `${project.location.centerDistance}`
                  : tUnit("no-data")
              }
            }}
            developerName={developer?.translations?.[0]?.name || ""}
            onRequestView={handleViewingRequestOpen}
          />

          {/* Калькулятор доходности */}
          <UnitYieldCalculator
            unitPrice={unit.price || 0}
            currency={(unit.project?.currency as string) || "USD"}
          />

          {/* Условия покупки */}
          <UnitPurchaseConditions unit={unit as any} />

          {/* Инфраструктура */}
          <div id="infrastructure" className="mt-12">
            <InfrastructureMap
              assessment={transformProjectAssessment(project)}
              latitude={unit.project?.location?.latitude || 7.8}
              longitude={unit.project?.location?.longitude || 98.3}
              address={
                unit.project?.location
                  ? `${unit.project.location.district || ""}, ${unit.project.location.city || ""}`
                  : ""
              }
            />
          </div>

          {/* Похожие юниты */}
          <SimilarUnits units={similarUnits} />

          {/* Информация о здании */}
          <UnitAboutBuilding {...aboutBuilding} />

          {/* Удобства комплекса */}
          <ComplexAmenities
            amenities={amenities || []}
            title="Complex amenities"
            maxVisible={6}
          />

          {/* Похожие проекты */}
          <SimilarProjects similarProjects={similarProjects as any} />
        </div>

        {/* Правая колонка: виджеты и действия */}
        <div className="lg:col-span-4 space-y-4 max-w-[320px] hidden md:block">
          {/* Виджет запроса просмотра */}
          <RequestView
            unit={{
              title: unitTitle,
              area: unit.area || 0,
              bed: unit.bedrooms || 0,
              floor: String(unit.floor || ""),
              price: unit.price || 0,
              currency: (unit.project?.currency as string) || "USD"
            }}
            onRequestView={handleViewingRequestOpen}
            onRequestDetails={handleViewingRequestOpen}
          />

          {/* Быстрые действия с юнитом */}
          <UnitQuickActions />

          {/* Мини-карточка девелопера */}
          {miniDeveloperCardData && (
            <DeveloperMiniCard data={miniDeveloperCardData as any} />
          )}

          {/* Персональный брокер */}
          <PersonalBroker />
        </div>
      </div>
    </div>
  );
}
