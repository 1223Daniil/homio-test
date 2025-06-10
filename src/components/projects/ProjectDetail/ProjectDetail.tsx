"use client";

import { AbstractIntlMessages, MessageKeys, useTranslations } from "next-intl";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  Chip,
  Skeleton,
  Tab,
  Tabs
} from "@heroui/react";
import {
  DocumentCategory,
  MediaCategory,
  ProjectTranslation,
  UserRole
} from "@prisma/client";
import {
  DomainProject,
  MasterPlanPoint as MasterPlanPointType
} from "@/types/domain";
import {
  GOOGLE_MAPS_LOADER_OPTIONS,
  validateGoogleMapsApiKey
} from "@/utils/googleMaps";
import {
  IconApps,
  IconArrowRight,
  IconBabyCarriage,
  IconBarbell,
  IconBeach,
  IconBuildingSkyscraper,
  IconBuildingStore,
  IconChevronLeft,
  IconChevronRight,
  IconEdit,
  IconFileText,
  IconGrid3x3,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconMapPin,
  IconParking,
  IconPaw,
  IconShield,
  IconStar,
  IconSwimming,
  IconUpload,
  IconWifi
} from "@tabler/icons-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useParams, useRouter } from "next/navigation";

import AmenitiesAdaptiveSlider from "@/shared/components/AmenitiesAdaptiveSlider";
import Availability from "@/shared/components/Availability";
import { Blurhash } from "react-blurhash";
import { BuildingCard } from "@/components/projects/BuildingCard";
import { ComplexAmenities } from "@/components/amenities/ComplexAmenities";
import { ErrorBoundary } from "@/components/utils/ErrorBoundary";
import { FloorPlanFilters } from "@/components/projects/FloorPlanFilters";
import { FloorPlanViewer } from "@/widgets/FloorPlanViewer";
import Hero from "@/widgets/ProjectDetails/Hero";
import HeroSimple from "@/widgets/ProjectDetails/Hero/HeroSimple";
import Image from "next/image";
import InfrastructureMap from "@/components/infrastructure/InfrastructureMap";
import { Link } from "@/config/i18n";
import MasterPlanPointComponent from "@/shared/components/MasterPlanPoint";
import { PreloadImages } from "@/components/utils/Preload";
import ProjectAdaptiveAvailbility from "@/widgets/ProjectAdaptiveAvailbility";
import ProjectAdaptiveSlider from "@/shared/components/ProjectAdaptiveSlider/ProjectAdaptiveSlider";
import ProjectAdaptiveSpecialOffers from "@/shared/components/ProjectAdaptiveSpecialOffers";
import ProjectSlider from "@/components/media/ProjectSlider";
import { ProjectUnits } from "@/components/projects/ProjectUnits";
import { SpecialOffers } from "@/components/projects/SpecialOffers";
import { TbLocation } from "react-icons/tb";
import UnitsList from "@/widgets/ProjectUnits";
import { ViewingRequest } from "@/components/projects/ViewingRequest";
import { ViewingRequestModal } from "@/components/projects/ViewingRequestModal";
import { formatDateToQuarter } from "@/utils/formatQuarterDate";
import { formatNumberType } from "@/utils/formatPrice";
import { getProjectBuildingsData } from "@/features/actions/unique-actions/get-project-buildings-data";
import { toast } from "sonner";
import { useJsApiLoader } from "@react-google-maps/api";
import { useLayouts } from "@/hooks/useLayouts";
import { useSession } from "next-auth/react";

// Добавим компонент для адаптивного контейнера
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

// Обновляем функцию форматирования текста с учетом склонений
const formatProjectsText = (count: number, locale: string) => {
  if (locale === "ru") {
    // Для русского языка используем правильные окончания
    if (count === 1) return "проект";
    if (count >= 2 && count <= 4) return "проекта";
    return "проектов";
  }
  return "projects";
};

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

export function transformProjectAssessment(project: any) {
  return {
    publicTransport: project.publicTransport || undefined,
    amenitiesLevel: project.amenitiesLevel || undefined,
    climateConditions: project.climateConditions || undefined,
    beachAccess: project.beachAccess || undefined,
    rentalDemand: project.rentalDemand || undefined,
    safetyLevel: project.safetyLevel || undefined,
    noiseLevel: project.noiseLevel || undefined,
    schoolsAvailable: project.schoolsAvailable || undefined
  };
}

async function fetchProjectData(id: string) {
  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const projectResponse = await fetch(
        `/api/projects/${id}?include=documents,media,location,amenities,units`,
        { cache: "no-store" }
      );

      if (!projectResponse.ok) {
        throw new Error(
          `Failed to fetch project: ${projectResponse.status} ${projectResponse.statusText}`
        );
      }

      return projectResponse.json();
    } catch (error) {
      retries++;
      console.error(`Attempt ${retries}/${MAX_RETRIES} failed:`, error);

      if (retries >= MAX_RETRIES) {
        throw error;
      }

      // Ждем перед следующей попыткой (экспоненциальная задержка)
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * Math.pow(2, retries - 1))
      );
    }
  }

  throw new Error("Failed to fetch project after multiple attempts");
}

async function fetchMasterPlanPoints(id: string) {
  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const response = await fetch(`/api/projects/${id}/master-plan-points`, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch points: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      retries++;
      console.error(`Attempt ${retries}/${MAX_RETRIES} failed:`, error);

      if (retries >= MAX_RETRIES) {
        throw error;
      }

      // Ждем перед следующей попыткой
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * Math.pow(2, retries - 1))
      );
    }
  }

  throw new Error("Failed to fetch master plan points after multiple attempts");
}

export default function ProjectPage({
  project,
  developer,
  currentTranslation,
  amenities,
  masterPlanPoints,
  buildingsWithFloorPlans,
  projectSlider,
  projectDetails = "show",
  projectBuildingsData: serverProjectBuildingsData
}: {
  project: DomainProject;
  developer: ProjectDeveloper;
  currentTranslation: ProjectTranslation;
  amenities: any;
  masterPlanPoints: any;
  buildingsWithFloorPlans?: any[];
  projectSlider?: "hide" | "show" | "replace";
  projectDetails?: any;
  projectBuildingsData?: any[];
}) {
  const t = useTranslations("ProjectDetails");
  const amountsT = useTranslations("Amounts");
  const buildingsT = useTranslations("buildings");
  const layoutsT = useTranslations("Layouts");
  const developerT = useTranslations("Developers");
  const currenciesT = useTranslations("projects.currency.symbols");
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [currentUpdateSlide, setCurrentUpdateSlide] = useState(0);
  const [isShownAllDescriptions, setIsShownAllDescriptions] = useState(false);
  const [showAllBuildings, setShowAllBuildings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewingRequestOpen, setIsViewingRequestOpen] = useState(false);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [unitFilters, setUnitFilters] = useState({
    availability: [] as string[],
    bedrooms: [] as number[],
    priceRange: [0, 10000000] as [number, number],
    areaRange: [0, 500] as [number, number],
    windowView: [] as string[]
  });
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [activeMasterPlanPoint, setActiveMasterPlanPoint] =
    useState<MasterPlanPointType | null>(null);
  const [projectBuildingsData, setProjectBuildingsData] = useState<any[]>([]);
  const masterPlanRef = useRef<HTMLDivElement>(null);
  const [masterPlanImageDimensions, setMasterPlanImageDimensions] = useState({
    width: 720,
    height: 480
  });
  const masterPlanImageRef = useRef<HTMLImageElement>(null);
  const [isMasterPlanLoading, setIsMasterPlanLoading] = useState(true);
  const [masterPlanImageLoaded, setMasterPlanImageLoaded] = useState(false);

  const [adjustmentFactors, setAdjustmentFactors] = useState({
    xFactor: 0.78,
    yFactor: 1.29,
    xOffset: 9,
    yOffset: -1
  });

  const user = useSession();

  console.log("USER", user);

  const [useManualAdjustment, setUseManualAdjustment] = useState(false);

  const { selectedLayouts, addLayout, clearLayouts } = useLayouts();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDebugMode =
        new URLSearchParams(window.location.search).get("debug") === "true";

      setUseManualAdjustment(false);
    }
  }, []);

  const params = useParams<{
    id: string;
    locale: string;
  }>();
  const id = params?.id;
  const locale = params?.locale;

  console.log(projectBuildingsData);

  // Определяем функцию форматирования даты
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

  // Мемоизируем валюту
  const currency = useMemo(
    () => project?.currency?.code || "THB",
    [project?.currency]
  );
  const currencySymbol = useMemo(() => {
    const currencies = currenciesT.rich(
      "USD",
      {}
    ) as unknown as AbstractIntlMessages; // Пример ключа
    // Убедимся, что ключ валиден для messages
    const key = currency as MessageKeys<
      typeof currencies,
      keyof typeof currencies
    >;
    try {
      return currenciesT.rich(key, {}) || project?.currency?.symbol || "฿";
    } catch (e) {
      // Если ключ невалиден, вернем символ по умолчанию
      console.warn(`Invalid currency key for translation: ${key}`);
      return project?.currency?.symbol || "฿";
    }
  }, [project?.currency, currenciesT, currency]);

  // Мемоизируем функции форматирования цены и площади
  const formatPrice = useCallback(
    (price: number) => {
      return (price / 1000000).toLocaleString(
        locale === "ru" ? "ru-RU" : "en-US",
        {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }
      );
    },
    [locale]
  );

  const formatArea = useCallback(
    (area: number | null | undefined) => {
      if (!area) return "0";
      return Math.round(area).toLocaleString(
        locale === "ru" ? "ru-RU" : "en-US"
      );
    },
    [locale]
  );

  // Мемоизируем диапазон цен
  const priceRange = useMemo(() => {
    if (!project?.units?.length) return null;

    const prices = project.units
      .filter(unit => unit.price)
      .map(unit => unit.price as number);

    if (!prices.length) return null;

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    const formattedMin = formatNumberType(min);
    const formattedMax = formatNumberType(max);

    const currencies = currenciesT.rich(
      "USD",
      {}
    ) as unknown as AbstractIntlMessages; // Пример ключа
    const amounts = amountsT.rich(
      "million",
      {}
    ) as unknown as AbstractIntlMessages; // Пример ключа

    // Явно приводим типы ключей
    const currencyKey = currency as MessageKeys<
      typeof currencies,
      keyof typeof currencies
    >;
    const minAmountKey = (formattedMin.type || "million") as MessageKeys<
      typeof amounts,
      keyof typeof amounts
    >;
    const maxAmountKey = (formattedMax.type || "million") as MessageKeys<
      typeof amounts,
      keyof typeof amounts
    >;

    let minText = "";
    let maxText = "";

    try {
      minText = `${currenciesT.rich(currencyKey, {}) || currency}${formattedMin.number}${formattedMin.type ? amountsT.rich(minAmountKey, {}) : ""}`;
    } catch (e) {
      console.warn(
        `Invalid key for min price translation: cur=${currencyKey}, amount=${minAmountKey}`
      );
      minText = `${currency}${formattedMin.number}${formattedMin.type || ""}`;
    }

    try {
      maxText = `${currenciesT.rich(currencyKey, {}) || currency}${formattedMax.number}${formattedMax.type ? amountsT.rich(maxAmountKey, {}) : ""}`;
    } catch (e) {
      console.warn(
        `Invalid key for max price translation: cur=${currencyKey}, amount=${maxAmountKey}`
      );
      maxText = `${currency}${formattedMax.number}${formattedMax.type || ""}`;
    }

    const priceRangeText = t("slider.price-range", {
      min: minText,
      max: maxText
    });

    return priceRangeText;
  }, [project?.units, currency, locale, formatPrice, amountsT, currenciesT, t]);

  // Мемоизируем баннеры
  const bannerSlides = useMemo(() => {
    const projectMedia = project?.media || [];
    const sortedMedia = [...projectMedia]
      .filter(media => media.category === "BANNER")
      .sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 0;
        const orderB = b.order !== undefined ? b.order : 0;
        return orderA - orderB;
      });

    return sortedMedia.length > 0
      ? sortedMedia
      : [
          "/images/pool.jpg",
          "/images/playground.jpg",
          "/images/fitness.jpg",
          "/images/restaurant.jpg"
        ];
  }, [project?.media]);

  // Мемоизируем специальные предложения
  const specialOffers = useMemo(() => {
    if (!project?.specialOffers) return [];

    const offers =
      typeof project.specialOffers === "string"
        ? JSON.parse(project.specialOffers)
        : project.specialOffers;

    if (!Array.isArray(offers)) return [];

    return offers
      .filter(offer => {
        const translation = offer.translations?.[locale as string];
        return translation?.title && translation?.description;
      })
      .map(offer => ({
        id: offer.id,
        title: offer.translations[locale as string].title,
        description: offer.translations[locale as string].description,
        validUntil: offer.translations[locale as string].validUntil,
        icon: offer.icon || "percentage"
      }));
  }, [project?.specialOffers, locale]);

  // Мемоизируем выбранное здание
  const selectedBuilding = useMemo(() => {
    if (
      !projectBuildingsData ||
      !projectBuildingsData.length ||
      !activeMasterPlanPoint
    )
      return null;
    return projectBuildingsData.find(
      building => activeMasterPlanPoint.id === building.id
    );
  }, [projectBuildingsData, activeMasterPlanPoint]);

  console.log("projectBuildingsData", projectBuildingsData);
  console.log("selectedBuilding", selectedBuilding);

  // Используем единые настройки для загрузчика из utils/googleMaps.ts
  const { isLoaded: isGoogleMapsApiLoaded, loadError } = useJsApiLoader({
    ...GOOGLE_MAPS_LOADER_OPTIONS,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  });

  useEffect(() => {
    setIsClient(true);
    console.log("amenities", amenities);
  }, []);

  // Обновляем проверку доступности Google Maps API
  useEffect(() => {
    if (isClient) {
      // Проверяем валидность API ключа
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
      if (!validateGoogleMapsApiKey(apiKey)) {
        console.error("Google Maps API ключ недействителен или отсутствует");
        setMapError("Ошибка API ключа Google Maps");
        return;
      }

      // Проверяем загрузку API Google Maps и устанавливаем соответствующие состояния
      try {
        if (isGoogleMapsApiLoaded) {
          setIsGoogleMapsLoaded(true);
          setMapError(null);
        } else if (loadError) {
          console.error("Google Maps API loading error:", loadError);
          setMapError(
            `Ошибка загрузки карты: ${loadError.message || "Проверьте API ключ"}`
          );
        } else {
          // Вместо простого логирования ошибки проверяем доступность Google Maps API
          if (typeof window !== "undefined" && !window.google?.maps) {
            console.error("Google Maps API не загружен");
            setMapError("Google Maps API не загружен");
          } else {
            // API доступен, но не загружен через useJsApiLoader
            setIsGoogleMapsLoaded(true);
            setMapError(null);
          }
        }
      } catch (error) {
        console.error("Ошибка при инициализации Google Maps:", error);
        setMapError("Ошибка при инициализации карты");
      }
    }
  }, [isClient, isGoogleMapsApiLoaded, loadError]);

  // Оптимизированная загрузка данных
  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setIsLoading(true);

    const loadAllData = async () => {
      try {
        // Используем данные, полученные на сервере
        if (!isMounted) return;

        // Устанавливаем данные с сервера, если они доступны
        if (serverProjectBuildingsData?.length) {
          setProjectBuildingsData(serverProjectBuildingsData);
        }

        // Используем данные о зданиях, переданные с сервера
        if (isMounted) {
          setBuildings(buildingsWithFloorPlans || []);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAllData();

    return () => {
      isMounted = false;
    };
  }, [id, buildingsWithFloorPlans, serverProjectBuildingsData]);

  // Обработчик клика по зданию на плане
  const handleBuildingPointClick = useCallback(
    (buildingId: string | null) => {
      if (!buildingId || !projectBuildingsData || !projectBuildingsData.length)
        return;

      // Находим соответствующее здание непосредственно в projectBuildingsData
      const building = projectBuildingsData.find(b => b.id === buildingId);

      if (!building) return;

      // Используем данные здания из projectBuildingsData
      setActiveMasterPlanPoint({
        ...building,
        completionDate: formatDateToQuarter(project?.completionDate || "")
      });
    },
    [projectBuildingsData]
  );

  const getActiveBuildingFromPoint = useCallback(() => {
    if (
      !projectBuildingsData ||
      !projectBuildingsData.length ||
      !activeMasterPlanPoint
    )
      return null;
    return projectBuildingsData.find(
      building => building.id === activeMasterPlanPoint.buildingId
    );
  }, [projectBuildingsData, activeMasterPlanPoint]);

  // Добавим эффект для получения реальных размеров изображения
  useEffect(() => {
    const updateImageDimensions = () => {
      if (masterPlanImageRef.current) {
        const img = masterPlanImageRef.current;
        if (img.complete) {
          const { width, height } = img.getBoundingClientRect();
          if (width > 0 && height > 0) {
            setMasterPlanImageDimensions({ width, height });
          }
        }
      }
    };

    // Вызываем функцию сразу и при каждом загрузке изображения
    updateImageDimensions();

    // Добавляем обработчик события load для получения размеров после загрузки
    const imgElement = masterPlanImageRef.current;
    if (imgElement) {
      imgElement.addEventListener("load", updateImageDimensions);

      // Добавляем обработчик изменения размера окна
      window.addEventListener("resize", updateImageDimensions);
    }

    return () => {
      if (imgElement) {
        imgElement.removeEventListener("load", updateImageDimensions);
      }
      window.removeEventListener("resize", updateImageDimensions);
    };
  }, []);

  // Переносим useMemo сюда, ДО условного return
  const developerName =
    developer.translations?.find(t => t.language === locale)?.name ||
    developer.translations?.[0]?.name || // Добавили проверку на undefined
    "Unknown Developer";

  const heroData = useMemo(
    () => ({
      developer: {
        id: developer.id,
        name:
          developerName.length > 15
            ? developerName.slice(0, 15) + "..."
            : developerName,
        image: developer.logo || "/placeholder-developer.png" // Добавили плейсхолдер
      },
      project: {
        images: project.media as any, // TODO: Исправить тип
        name: currentTranslation?.name || "",
        price: priceRange || t("units.priceOnRequest"), // Обеспечиваем string
        location: `${project.location?.district || ""}, ${project.location?.city || ""}, ${project.location?.country || ""}`,
        beach: {
          name: (project.location as any)?.beachName || "",
          distance: project.location?.beachDistance || 0
        }
      }
    }),
    [
      developer,
      project,
      currentTranslation,
      priceRange,
      developerName,
      locale,
      t
    ]
  );

  const heroBottomBarData = useMemo(
    () => ({
      offDate: project.completionDate || t("projectInfo.values.tba"), // Обеспечиваем string
      deliveryStage: project.phase || null,
      totalArea: project.totalLandArea,
      infrastructureArea: project.infrastructureArea,
      buildings: project?.buildings?.length || 0,
      units: project?.units?.length || 0, // Используем длину массива юнитов
      class: project?.class
    }),
    [project]
  );

  if (!isClient) {
    return null;
  }

  console.log("developer", developer);

  return (
    <div className="min-h-screen overflow-x-hidden pb-12">
      {/* Предзагрузка ключевых изображений для LCP */}
      <PreloadImages
        images={[
          // Главное изображение проекта
          ...(bannerSlides &&
          bannerSlides.length > 0 &&
          typeof bannerSlides[0] !== "string"
            ? [
                {
                  url: bannerSlides[0].url,
                  fetchPriority: "high" as const,
                  sizes:
                    "(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1920px"
                }
              ]
            : []),
          // Изображение мастер-плана (если есть)
          ...(project?.media?.find(
            media => media.category === "MASTER_PLAN" && media.type === "photo"
          )
            ? [
                {
                  url: project.media.find(
                    media =>
                      media.category === "MASTER_PLAN" && media.type === "photo"
                  )!.url,
                  fetchPriority: "auto" as const,
                  sizes: "(max-width: 768px) 100vw, 900px"
                }
              ]
            : []),
          // Логотип разработчика
          ...(developer?.logo
            ? [
                {
                  url: developer.logo,
                  fetchPriority: "high" as const,
                  sizes: "64px"
                }
              ]
            : [])
        ]}
      />

      {user.data?.user.role !== UserRole.AGENT && (
        <AdaptiveContainer>
          <div className={`py-4 flex flex-wrap justify-end gap-2 max-w-full`}>
            <Button
              color="primary"
              variant="flat"
              startContent={<IconEdit size={20} />}
              onClick={() => router.push(`/${locale}/projects/${id}/edit`)}
              className="whitespace-normal h-auto min-h-[40px] text-sm max-w-[200px]"
            >
              {t("headers.editButtons.editProject")}
            </Button>
            <Button
              color="primary"
              variant="flat"
              startContent={<IconBuildingSkyscraper size={20} />}
              onClick={() => router.push(`/${locale}/projects/${id}/buildings`)}
              className="whitespace-normal h-auto min-h-[40px] text-sm max-w-[200px]"
            >
              {t("headers.editButtons.editBuildings")}
            </Button>
            <Button
              color="primary"
              variant="flat"
              startContent={<IconLayoutGrid size={20} />}
              onClick={() => {
                if (project?.buildings && project.buildings.length > 0) {
                  router.push(`/${locale}/projects/${id}/layouts`);
                } else {
                  toast.error(buildingsT("noBuildings"));
                }
              }}
              className="whitespace-normal h-auto min-h-[40px] text-sm max-w-[200px]"
            >
              {layoutsT("buttons.editLayouts")}
            </Button>
            <Button
              color="primary"
              variant="flat"
              startContent={<IconEdit size={20} />}
              onClick={() =>
                router.push(`/${locale}/projects/${id}/units/mass-edit`)
              }
              className="whitespace-normal h-auto min-h-[40px] text-sm max-w-[200px]"
            >
              {t("headers.editButtons.editUnits")}
            </Button>
            <Button
              color="primary"
              variant="flat"
              startContent={<IconUpload size={20} />}
              onClick={() => router.push(`/${locale}/projects/${id}/import`)}
              className="whitespace-normal h-auto min-h-[40px] text-sm max-w-[200px]"
            >
              {t("headers.editButtons.importUnits")}
            </Button>
          </div>
        </AdaptiveContainer>
      )}

      {/* Верхний слайдер */}
      <AdaptiveContainer>
        <Breadcrumbs className="mb-4 hidden lg:block">
          <BreadcrumbItem>
            <Link href="/projects">{t("breadcrumbs.projects")}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link href={`/projects/${params.id}`}>
              {currentTranslation.name || ""}
            </Link>
          </BreadcrumbItem>
        </Breadcrumbs>
        {/* Hero */}
        <div className="xl:w-[1040px] 2xl:w-[1200px]">
          <Hero data={heroData} bottomBar={heroBottomBarData} />
        </div>
        {/* Slider */}
        <ProjectAdaptiveSlider media={(project?.media as any) || []} />
      </AdaptiveContainer>

      {/* Основной контент */}
      <AdaptiveContainer className="mt-4 lg:mt-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Левая колонка */}
          <div className="w-full max-w-[720px] 2xl:max-w-[888px]">
            {/* О проекте */}
            <div className="mb-8 sm:mb-0">
              <h2 className="text-xl sm:text-2xl font-bold lg:mb-4 text-default-900 break-words">
                {currentTranslation?.name || "Project"}
              </h2>

              <p className="text-[30px] leading-[38px] font-semibold md:hidden">
                {priceRange}
              </p>

              <div className="flex gap-6 md:hidden mt-4">
                <div>
                  <p className="text-gray-500 text-sm leading-5">
                    {t("projectInfo.offDate")}
                  </p>
                  <p
                    className={
                      "text-gray-900 text-xl leading-[28px] font-semibold"
                    }
                  >
                    {formatDateToQuarter(project?.completionDate || "")}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm leading-5">
                    {t("projectInfo.buildings")}
                  </p>
                  <p
                    className={
                      "text-gray-900 text-xl leading-[28px] font-semibold"
                    }
                  >
                    {project?.buildings?.length ||
                      t("projectInfo.values.notSpecified")}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm leading-5">
                    {t("projectInfo.units")}
                  </p>
                  <p
                    className={
                      "text-gray-900 text-xl leading-[28px] font-semibold"
                    }
                  >
                    {project?.totalUnits ||
                      t("projectInfo.values.notSpecified")}
                  </p>
                </div>
              </div>

              <div className="flex justify-between gap-2 mt-4 md:hidden">
                <div className="flex gap-2 justify-between">
                  <div className="flex flex-wrap flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <IconMapPin
                        size={20}
                        className="text-gray-400 drop-shadow-sm"
                      />
                      <span className="text-gray-400 drop-shadow-sm">
                        {project.location
                          ? `${project.location.district}, ${project.location.city}, ${project.location.country}`
                          : t("location.unknown")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <TbLocation
                        size={20}
                        className="text-gray-400 drop-shadow-sm"
                      />
                      <span className="text-gray-400 drop-shadow-sm">
                        {t("beachDistance", {
                          distance: project.location?.beachDistance
                        })}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`min-w-[64px] max-h-[64px] rounded-lg relative overflow-clip;`}
                  >
                    <Image src="/images/location-icon.png" fill alt="Map" />
                  </div>
                </div>
              </div>

              <div className="relative mt-12 lg:mt-0 hidden md:block">
                <p className="text-gray-600 break-words">
                  {isShownAllDescriptions
                    ? currentTranslation?.description
                    : currentTranslation?.description?.slice(0, 300) + "..."}
                </p>
                {currentTranslation?.description &&
                  currentTranslation.description.length > 300 && (
                    <button
                      className="text-primary hover:text-primary/80 mt-2"
                      onClick={() =>
                        setIsShownAllDescriptions(!isShownAllDescriptions)
                      }
                    >
                      {isShownAllDescriptions
                        ? t("overview.hide")
                        : t("overview.readMore")}
                    </button>
                  )}
              </div>

              <div className="relative mt-12 lg:mt-0 md:hidden">
                <p className="text-gray-600 break-words">
                  {isShownAllDescriptions
                    ? currentTranslation?.description
                    : currentTranslation?.description?.slice(0, 128) + "..."}
                </p>
                {currentTranslation?.description &&
                  currentTranslation.description.length > 128 && (
                    <button
                      className="text-primary hover:text-primary/80 mt-2"
                      onClick={() =>
                        setIsShownAllDescriptions(!isShownAllDescriptions)
                      }
                    >
                      {isShownAllDescriptions
                        ? t("overview.hide")
                        : t("overview.readMore")}
                    </button>
                  )}
              </div>

              <div className="mt-3 md:hidden">
                <div className="flex justify-between gap-3 text-gray-500">
                  <span className="text-sm leading-5">Developer</span>
                  <span className="text-[#3062B8] text-sm leading-5 font-semibold">
                    <Link href={`/developers/${project.developerId}`}>
                      {developer?.name}
                    </Link>
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-gray-500">
                  <span className="text-sm leading-5"></span>
                  <span className="text-[#3062B8] text-sm leading-5 font-semibold">
                    <Link href={`/developers/${project.developerId}`}>
                      {project?.phase?.toString() ||
                        t("projectInfo.values.notSpecified")}
                    </Link>
                  </span>
                </div>
              </div>
            </div>

            {/* Специальные предложения */}
            {specialOffers.length > 0 && (
              <>
                <div className="mb-8 sm:mb-0 hidden lg:block">
                  <SpecialOffers offers={specialOffers} />
                </div>
                <ProjectAdaptiveSpecialOffers offers={specialOffers} />
              </>
            )}

            {/* Табы с информацией о проекте */}
            <div className="mt-4 sm:mt-3">
              <Tabs
                aria-label="Project information"
                color="primary"
                variant="underlined"
                classNames={{
                  tabList: "gap-6",
                  cursor: "w-full bg-primary",
                  tab: "max-w-fit px-0 max-h-0",
                  tabContent: "group-data-[selected=true]:text-primary"
                }}
              >
                <Tab
                  key="master-plan"
                  title={
                    <>
                      {/* <div className="flex items-center space-x-2">
                        <IconBook size={20} />
                        <span>{t("tabs.masterPlan.title")}</span>
                      </div> */}
                    </>
                  }
                >
                  <div className="py-4">
                    <h3 className="text-lg font-semibold mb-4 text-default-900">
                      {t("tabs.masterPlan.title")}
                    </h3>

                    {project?.media?.find(
                      media =>
                        media.category === "MASTER_PLAN" &&
                        media.type === "photo"
                    ) ? (
                      <>
                        <ProjectAdaptiveAvailbility
                          image={{
                            url: (() => {
                              const masterPlanImage =
                                project?.media?.find(
                                  media =>
                                    media.category === "MASTER_PLAN" &&
                                    media.type === "photo"
                                )?.url || "";

                              if (!masterPlanImage) return "";

                              // Пропускаем локальные изображения
                              if (masterPlanImage.startsWith("/"))
                                return masterPlanImage;

                              // Для изображений из Yandex Cloud
                              if (
                                masterPlanImage.includes(
                                  "storage.yandexcloud.net"
                                )
                              ) {
                                const cloudPath = masterPlanImage.replace(
                                  /^https?:\/\/storage\.yandexcloud\.net\//,
                                  ""
                                );
                                return `/api/image-proxy/${cloudPath}?width=1024&height=768&quality=80`;
                              }

                              if (
                                masterPlanImage.startsWith("/api/image-proxy/")
                              ) {
                                return masterPlanImage;
                              }

                              const normalizedUrl = masterPlanImage.replace(
                                /^https?:\/\//,
                                ""
                              );
                              return `/api/image-proxy/${normalizedUrl}?width=1024&height=768&quality=80`;
                            })(),
                            alt: "Master Plan"
                          }}
                          points={masterPlanPoints}
                          buildings={projectBuildingsData}
                          project={{
                            id: project.id,
                            offDate: project?.completionDate || "",
                            phase: project?.phase || "",
                            currency: project?.currency || ""
                          }}
                        />
                        <div className="mb-6 relative hidden lg:block">
                          <div
                            className="relative rounded-lg overflow-hidden max-w-[912px] max-h-[480px] w-[720px] h-[480px]"
                            style={{ width: "100%" }}
                            ref={masterPlanRef}
                            onClick={() => {
                              if (activeMasterPlanPoint !== null) {
                                setActiveMasterPlanPoint(null);
                              }
                            }}
                          >
                            {/* Лоадер для изображения мастер-плана */}
                            {isMasterPlanLoading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-default-100/50 z-10">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}

                            {/* Блюр-хеш плейсхолдер для мастер-плана */}
                            {!masterPlanImageLoaded &&
                              project?.media?.find(
                                media =>
                                  media.category === "MASTER_PLAN" &&
                                  media.type === "photo" &&
                                  media.blurhash
                              )?.blurhash && (
                                <div className="absolute inset-0">
                                  <Blurhash
                                    hash={
                                      project.media.find(
                                        media =>
                                          media.category === "MASTER_PLAN" &&
                                          media.type === "photo"
                                      )?.blurhash || "" // Используем прямое свойство
                                    }
                                    width="100%"
                                    height="100%"
                                    resolutionX={32}
                                    resolutionY={32}
                                    punch={1}
                                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                                  />
                                </div>
                              )}

                            {/* Базовое изображение мастер-плана */}
                            <Image
                              src={(() => {
                                const masterPlanImage =
                                  project?.media?.find(
                                    media =>
                                      media.category === "MASTER_PLAN" &&
                                      media.type === "photo"
                                  )?.url || "";

                                if (!masterPlanImage) return "";

                                // Пропускаем локальные изображения
                                if (masterPlanImage.startsWith("/"))
                                  return masterPlanImage;

                                // Для изображений из Yandex Cloud
                                if (
                                  masterPlanImage.includes(
                                    "storage.yandexcloud.net"
                                  )
                                ) {
                                  const cloudPath = masterPlanImage.replace(
                                    /^https?:\/\/storage\.yandexcloud\.net\//,
                                    ""
                                  );
                                  return `/api/image-proxy/${cloudPath}?width=1024&height=768&quality=80`;
                                }

                                if (
                                  masterPlanImage.startsWith(
                                    "/api/image-proxy/"
                                  )
                                ) {
                                  return masterPlanImage;
                                }

                                const normalizedUrl = masterPlanImage.replace(
                                  /^https?:\/\//,
                                  ""
                                );
                                return `/api/image-proxy/${normalizedUrl}?width=1024&height=768&quality=80`;
                              })()}
                              fill
                              alt="Master Plan"
                              priority
                              className={`w-full object-contain rounded-lg transition-opacity duration-300 ${masterPlanImageLoaded ? "opacity-100" : "opacity-0"}`}
                              ref={masterPlanImageRef}
                              onLoad={() => {
                                setIsMasterPlanLoading(false);
                                setMasterPlanImageLoaded(true);
                                if (masterPlanImageRef.current) {
                                  const { width, height } =
                                    masterPlanImageRef.current.getBoundingClientRect();
                                  if (width > 0 && height > 0) {
                                    setMasterPlanImageDimensions({
                                      width,
                                      height
                                    });
                                  }
                                }
                              }}
                            />

                            {/* Кнопка для включения режима отладки */}
                            {process.env.NODE_ENV === "development" &&
                              !new URLSearchParams(window.location.search).get(
                                "debug"
                              ) && (
                                <a
                                  href={`?debug=true`}
                                  className="absolute top-2 right-2 bg-white/80 dark:bg-black/80 p-1 rounded text-xs z-50 hover:bg-white/100 dark:hover:bg-black/100"
                                  title="Включить режим отладки"
                                >
                                  🔧
                                </a>
                              )}

                            {/* Отладочная информация в режиме разработки */}
                            {process.env.NODE_ENV === "development" &&
                              new URLSearchParams(window.location.search).get(
                                "debug"
                              ) === "true" && (
                                <div className="absolute bottom-2 left-2 bg-white/80 dark:bg-black/80 p-2 rounded text-xs z-50">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold">
                                      Режим отладки
                                    </span>
                                    <a
                                      href={`${window.location.pathname}`}
                                      className="text-blue-500 hover:text-blue-700"
                                    >
                                      ✕
                                    </a>
                                  </div>
                                  <div>Original: 638.76 x 556.64</div>
                                  <div>
                                    Display:{" "}
                                    {Math.round(
                                      masterPlanImageDimensions.width
                                    )}{" "}
                                    x{" "}
                                    {Math.round(
                                      masterPlanImageDimensions.height
                                    )}
                                  </div>
                                  <div>
                                    Ratio: {(638.76 / 556.64).toFixed(2)} /{" "}
                                    {(
                                      masterPlanImageDimensions.width /
                                      masterPlanImageDimensions.height
                                    ).toFixed(2)}
                                  </div>
                                  <div>
                                    Scale:{" "}
                                    {(
                                      (masterPlanImageDimensions.height *
                                        (638.76 / 556.64)) /
                                      masterPlanImageDimensions.width
                                    ).toFixed(3)}
                                  </div>
                                  {masterPlanPoints &&
                                    masterPlanPoints.length > 0 && (
                                      <div>
                                        Points: {masterPlanPoints.length}
                                      </div>
                                    )}

                                  {/* Переключатель режима настройки */}
                                  <div className="mt-2 border-t pt-1 border-gray-300">
                                    <label className="flex items-center justify-between">
                                      <span>Ручная настройка:</span>
                                      <button
                                        className={`px-2 py-1 rounded ${useManualAdjustment ? "bg-blue-500 text-white" : "bg-gray-300"}`}
                                        onClick={() =>
                                          setUseManualAdjustment(prev => !prev)
                                        }
                                      >
                                        {useManualAdjustment ? "Вкл" : "Выкл"}
                                      </button>
                                    </label>
                                  </div>

                                  {/* Информация об автоматических коэффициентах */}
                                  {!useManualAdjustment && (
                                    <div className="mt-2 border-t pt-1 border-gray-300">
                                      <p className="font-bold">Авто расчет:</p>
                                      <div>
                                        {Math.abs(
                                          masterPlanImageDimensions.width - 720
                                        ) < 20 &&
                                          Math.abs(
                                            masterPlanImageDimensions.height -
                                              480
                                          ) < 20 && (
                                            <div className="text-green-600">
                                              Используются значения для 720x480
                                            </div>
                                          )}
                                        {Math.abs(
                                          masterPlanImageDimensions.width - 880
                                        ) < 20 &&
                                          Math.abs(
                                            masterPlanImageDimensions.height -
                                              480
                                          ) < 20 && (
                                            <div className="text-green-600">
                                              Используются значения для 880x480
                                            </div>
                                          )}
                                        {Math.abs(
                                          masterPlanImageDimensions.width - 896
                                        ) < 20 &&
                                          Math.abs(
                                            masterPlanImageDimensions.height -
                                              480
                                          ) < 20 && (
                                            <div className="text-green-600">
                                              Используются значения для 896x480
                                            </div>
                                          )}
                                        {(Math.abs(
                                          masterPlanImageDimensions.width - 720
                                        ) >= 20 ||
                                          Math.abs(
                                            masterPlanImageDimensions.height -
                                              480
                                          ) >= 20) &&
                                          (Math.abs(
                                            masterPlanImageDimensions.width -
                                              880
                                          ) >= 20 ||
                                            Math.abs(
                                              masterPlanImageDimensions.height -
                                                480
                                            ) >= 20) &&
                                          (Math.abs(
                                            masterPlanImageDimensions.width -
                                              896
                                          ) >= 20 ||
                                            Math.abs(
                                              masterPlanImageDimensions.height -
                                                480
                                            ) >= 20) && (
                                            <div className="text-yellow-600">
                                              Интерполяция между известными
                                              размерами
                                            </div>
                                          )}
                                      </div>
                                      <div className="grid grid-cols-2 gap-x-2">
                                        <div>
                                          xF:{" "}
                                          {masterPlanImageDimensions.width < 800
                                            ? "~0.93"
                                            : masterPlanImageDimensions.width >=
                                                  800 &&
                                                masterPlanImageDimensions.width <
                                                  890
                                              ? "~0.89"
                                              : "~0.78"}
                                        </div>
                                        <div>
                                          yF:{" "}
                                          {masterPlanImageDimensions.width < 800
                                            ? "~1.33"
                                            : masterPlanImageDimensions.width >=
                                                  800 &&
                                                masterPlanImageDimensions.width <
                                                  890
                                              ? "~1.54"
                                              : "~1.29"}
                                        </div>
                                        <div>
                                          xO:{" "}
                                          {masterPlanImageDimensions.width < 800
                                            ? "~2"
                                            : masterPlanImageDimensions.width >=
                                                  800 &&
                                                masterPlanImageDimensions.width <
                                                  890
                                              ? "~7"
                                              : "~9"}
                                        </div>
                                        <div>
                                          yO:{" "}
                                          {masterPlanImageDimensions.width < 800
                                            ? "~-1"
                                            : masterPlanImageDimensions.width >=
                                                  800 &&
                                                masterPlanImageDimensions.width <
                                                  890
                                              ? "~-2"
                                              : "~-1"}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Настройка коэффициентов (только в ручном режиме) */}
                                  {useManualAdjustment && (
                                    <div className="mt-2 border-t pt-1 border-gray-300">
                                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                        <div>
                                          <label className="block">
                                            xF: {adjustmentFactors.xFactor}
                                          </label>
                                          <div className="flex space-x-1">
                                            <button
                                              className="px-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                              onClick={() =>
                                                setAdjustmentFactors(prev => ({
                                                  ...prev,
                                                  xFactor: +(
                                                    prev.xFactor - 0.01
                                                  ).toFixed(2)
                                                }))
                                              }
                                            >
                                              -
                                            </button>
                                            <button
                                              className="px-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                              onClick={() =>
                                                setAdjustmentFactors(prev => ({
                                                  ...prev,
                                                  xFactor: +(
                                                    prev.xFactor + 0.01
                                                  ).toFixed(2)
                                                }))
                                              }
                                            >
                                              +
                                            </button>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block">
                                            yF: {adjustmentFactors.yFactor}
                                          </label>
                                          <div className="flex space-x-1">
                                            <button
                                              className="px-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                              onClick={() =>
                                                setAdjustmentFactors(prev => ({
                                                  ...prev,
                                                  yFactor: +(
                                                    prev.yFactor - 0.01
                                                  ).toFixed(2)
                                                }))
                                              }
                                            >
                                              -
                                            </button>
                                            <button
                                              className="px-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                              onClick={() =>
                                                setAdjustmentFactors(prev => ({
                                                  ...prev,
                                                  yFactor: +(
                                                    prev.yFactor + 0.01
                                                  ).toFixed(2)
                                                }))
                                              }
                                            >
                                              +
                                            </button>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block">
                                            xO: {adjustmentFactors.xOffset}
                                          </label>
                                          <div className="flex space-x-1">
                                            <button
                                              className="px-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                              onClick={() =>
                                                setAdjustmentFactors(prev => ({
                                                  ...prev,
                                                  xOffset: +(
                                                    prev.xOffset - 1
                                                  ).toFixed(0)
                                                }))
                                              }
                                            >
                                              -
                                            </button>
                                            <button
                                              className="px-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                              onClick={() =>
                                                setAdjustmentFactors(prev => ({
                                                  ...prev,
                                                  xOffset: +(
                                                    prev.xOffset + 1
                                                  ).toFixed(0)
                                                }))
                                              }
                                            >
                                              +
                                            </button>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block">
                                            yO: {adjustmentFactors.yOffset}
                                          </label>
                                          <div className="flex space-x-1">
                                            <button
                                              className="px-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                              onClick={() =>
                                                setAdjustmentFactors(prev => ({
                                                  ...prev,
                                                  yOffset: +(
                                                    prev.yOffset - 1
                                                  ).toFixed(0)
                                                }))
                                              }
                                            >
                                              -
                                            </button>
                                            <button
                                              className="px-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                              onClick={() =>
                                                setAdjustmentFactors(prev => ({
                                                  ...prev,
                                                  yOffset: +(
                                                    prev.yOffset + 1
                                                  ).toFixed(0)
                                                }))
                                              }
                                            >
                                              +
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                            {/* Отображение точек/маркеров поверх изображения */}
                            {masterPlanPoints &&
                              masterPlanPoints.length > 0 &&
                              !isMasterPlanLoading && (
                                <>
                                  {masterPlanPoints.map((point, index) => (
                                    <MasterPlanPointComponent
                                      key={index}
                                      point={point}
                                      handleBuildingPointClick={
                                        handleBuildingPointClick
                                      }
                                      activeMasterPlanPoint={
                                        activeMasterPlanPoint
                                      }
                                      setIsOpen={setActiveMasterPlanPoint}
                                      originalWidth={638.76}
                                      originalHeight={556.64}
                                      displayWidth={
                                        masterPlanImageDimensions.width
                                      }
                                      displayHeight={
                                        masterPlanImageDimensions.height
                                      }
                                      // Передаем коэффициенты, если включен ручной режим
                                      adjustmentFactors={
                                        useManualAdjustment
                                          ? adjustmentFactors
                                          : undefined
                                      }
                                    />
                                  ))}
                                </>
                              )}
                          </div>
                        </div>
                      </>
                    ) : null}
                    <section
                      id="availability"
                      className={`${selectedBuilding ? "pt-[80px]" : ""}`}
                    >
                      {selectedBuilding && (
                        <ErrorBoundary fallback={<div>Error</div>}>
                          <Availability
                            building={selectedBuilding}
                            isPublic={false}
                          />
                        </ErrorBoundary>
                      )}
                    </section>

                    <section
                      id="units-list"
                      className={`${selectedLayouts.length > 0 ? "pt-[80px]" : ""}`}
                    >
                      {selectedBuilding && (
                        <ErrorBoundary fallback={<div>Error</div>}>
                          <UnitsList
                            floorPlans={selectedBuilding.floorPlans}
                            buildingData={selectedBuilding}
                          />
                        </ErrorBoundary>
                      )}
                    </section>
                  </div>
                </Tab>

                {/* ЗДАНИЯ */}
                <Tab
                  key="buildings"
                  className="hidden"
                  title={
                    <div className="flex items-center space-x-2">
                      <IconBuildingSkyscraper size={20} />
                      <span>{t("tabs.buildings.title")}</span>
                      {project?.buildings?.length ? (
                        <Chip size="sm" variant="flat" color="primary">
                          {project.buildings.length}
                        </Chip>
                      ) : null}
                    </div>
                  }
                >
                  <div className="py-6">
                    <h3 className="text-lg font-semibold mb-6 text-default-900">
                      {t("tabs.buildings.information")}
                    </h3>

                    {/* Buildings Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-2 gap-6">
                      {(project?.buildings || [])
                        .slice(0, showAllBuildings ? undefined : 4)
                        .map(building => (
                          <BuildingCard
                            key={building.id}
                            building={building as any}
                            projectId={id as string}
                          />
                        ))}
                    </div>

                    {/* Show All Button */}
                    {project?.buildings && project.buildings.length > 4 && (
                      <div className="flex justify-center mt-8">
                        <Button
                          color="secondary"
                          variant="flat"
                          onClick={() => setShowAllBuildings(!showAllBuildings)}
                          className="px-8"
                        >
                          {showAllBuildings
                            ? "Show less"
                            : `Show all ${project.buildings.length} buildings`}
                        </Button>
                      </div>
                    )}

                    {/* Empty State */}
                    {(!project?.buildings ||
                      project.buildings.length === 0) && (
                      <div className="text-center py-8">
                        <p className="text-default-500">
                          {t("tabs.buildings.noBuildings")}
                        </p>
                      </div>
                    )}
                  </div>
                </Tab>

                {/* Закомментируем таб Facades */}
                {/*
                <Tab
                  key="facades"
                  title={
                    <div className="flex items-center space-x-2">
                      <IconLayoutDashboard size={20} />
                      <span>{t("tabs.facades.title")}</span>
                    </div>
                  }
                >
                  <div className="py-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {t("tabs.facades.description")}
                    </h3>
                    <p className="text-gray-600">
                      {t("tabs.facades.subtitle")}
                    </p>
                  </div>
                </Tab>
                */}

                <Tab
                  key="plans"
                  className="hidden"
                  title={
                    <div className="flex items-center space-x-2">
                      <IconApps size={20} />
                      <span>{t("tabs.plans.title")}</span>
                    </div>
                  }
                >
                  <div className="py-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {t("tabs.plans.description")}
                    </h3>

                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-32 rounded-lg" />
                        <Skeleton className="h-32 rounded-lg" />
                      </div>
                    ) : (
                      <FloorPlanViewer
                        projectId={id as string}
                        floorPlans={
                          buildings && buildings.length > 0
                            ? buildings.flatMap(b => b.floorPlans || [])
                            : []
                        }
                        selectedFloor={selectedFloor}
                        onFloorChange={setSelectedFloor}
                      />
                    )}
                  </div>
                </Tab>

                <Tab
                  key="units"
                  className="hidden"
                  title={
                    <div className="flex items-center gap-1">
                      <IconLayoutDashboard size={20} />
                      <span>{t("tabs.units.title")}</span>
                      {(project?.buildings?.reduce(
                        (total, building) =>
                          total + (building?.units?.length || 0),
                        0
                      ) || 0) > 0 && (
                        <Chip size="sm" variant="flat" color="primary">
                          {project?.buildings?.reduce(
                            (total, building) =>
                              total + (building?.units?.length || 0),
                            0
                          ) || 0}
                        </Chip>
                      )}
                    </div>
                  }
                >
                  <div className="mt-4 space-y-6">
                    {/* Unit Filters */}
                    <FloorPlanFilters
                      buildings={buildings}
                      selectedBuilding={null}
                      onBuildingChange={() => {}}
                      filters={unitFilters}
                      onFilterChange={(key, value) =>
                        setUnitFilters(prev => ({ ...prev, [key]: value }))
                      }
                      currency={currency}
                    />

                    {/* Units List */}
                    {project?.buildings && project.buildings.length > 0 ? (
                      <ProjectUnits
                        buildings={project.buildings}
                        projectId={project?.id || ""}
                        currency={currency}
                        locale={locale as string}
                        filters={unitFilters}
                      />
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-500">
                          {t("tabs.units.noUnits") || "Нет доступных юнитов"}
                        </p>
                      </div>
                    )}
                  </div>
                </Tab>

                <Tab
                  key="units-grid"
                  className="hidden"
                  id="units-section"
                  title={
                    <div className="flex items-center space-x-2">
                      <IconGrid3x3 size={20} />
                      <span>{t("tabs.unitsGrid.title")}</span>
                    </div>
                  }
                >
                  <div className="py-6 space-y-6">
                    {/* Unit Filters */}
                    <FloorPlanFilters
                      buildings={buildings}
                      selectedBuilding={null}
                      onBuildingChange={() => {}}
                      filters={unitFilters}
                      onFilterChange={(key, value) =>
                        setUnitFilters(prev => ({ ...prev, [key]: value }))
                      }
                      currency={currency}
                    />

                    {/* Legend at the top */}
                    <div className="flex gap-6 mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-success-50 border border-default-200"></div>
                        <span className="text-sm text-default-600">
                          {t("tabs.unitsGrid.status.available")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-warning-50 border border-default-200"></div>
                        <span className="text-sm text-default-600">
                          {t("tabs.unitsGrid.status.reserved")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-default-100 border border-default-200"></div>
                        <span className="text-sm text-default-600">
                          {t("tabs.unitsGrid.status.sold")}
                        </span>
                      </div>
                    </div>

                    {/* Units Grid */}
                    {project?.units &&
                      Object.entries(
                        project.units.reduce(
                          (acc, unit) => {
                            const floor = unit.floor || 1;
                            if (!acc[floor]) acc[floor] = [];
                            acc[floor].push(unit);
                            return acc;
                          },
                          {} as Record<number, typeof project.units>
                        )
                      )
                        .sort(
                          ([floorA], [floorB]) =>
                            Number(floorA) - Number(floorB)
                        )
                        .map(([floor, units]) => (
                          <div key={floor} className="mb-4">
                            {/* Floor row with units */}
                            <div className="flex">
                              {/* Floor number - фиксированная ширина */}
                              <div className="min-w-[80px] flex items-center">
                                <span className="text-default-600">
                                  {t("tabs.unitsGrid.floor")} {floor}
                                </span>
                              </div>

                              {/* Контейнер для стрелок и юнитов */}
                              <div className="flex-1 relative max-w-[calc(100%-80px)]">
                                {/* Левая стрелка */}
                                <button
                                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-default-100 hover:bg-default-200 rounded-full transition-colors"
                                  onClick={e => {
                                    e.preventDefault();
                                    const container =
                                      e.currentTarget.parentElement?.querySelector(
                                        ".overflow-x-auto"
                                      );
                                    if (container) {
                                      container.scrollBy({
                                        left: -200,
                                        behavior: "smooth"
                                      });
                                    }
                                  }}
                                >
                                  <IconChevronLeft size={20} />
                                </button>

                                {/* Units - скроллируемый контейнер */}
                                <div className="overflow-x-auto scrollbar-hide px-4 mx-4">
                                  <div className="flex gap-2">
                                    {units.map((unit, index) => {
                                      // Determine status styles
                                      let bgColor = "bg-default-100";
                                      let textColor = "text-default-600";

                                      if (unit.status === "AVAILABLE") {
                                        bgColor = "bg-success-50";
                                        textColor = "text-success-600";
                                      } else if (unit.status === "RESERVED") {
                                        bgColor = "bg-warning-50";
                                        textColor = "text-warning-600";
                                      }

                                      return (
                                        <Link
                                          key={unit.id || index}
                                          href={`/projects/${id}/units/${unit.id}`}
                                          className={`
                                        w-[60px] h-[60px]
                                        ${bgColor}
                                        rounded-lg
                                        flex items-center justify-center
                                        cursor-pointer
                                        hover:opacity-80
                                        transition-all
                                        border border-default-200
                                        flex-shrink-0
                                      `}
                                        >
                                          <span
                                            className={`text-lg font-medium ${textColor}`}
                                          >
                                            {unit.number || index + 1}
                                          </span>
                                        </Link>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Правая стрелка */}
                                <button
                                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-default-100 hover:bg-default-200 rounded-full transition-colors"
                                  onClick={e => {
                                    e.preventDefault();
                                    const container =
                                      e.currentTarget.parentElement?.querySelector(
                                        ".overflow-x-auto"
                                      );
                                    if (container) {
                                      container.scrollBy({
                                        left: 200,
                                        behavior: "smooth"
                                      });
                                    }
                                  }}
                                >
                                  <IconChevronRight size={20} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                    {/* Empty state */}
                    {(!project?.units || project.units.length === 0) && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          {t("tabs.unitsGrid.noUnits") ||
                            "Нет доступных юнитов"}
                        </p>
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </div>

            {/* Complex amenities */}
            <ComplexAmenities amenities={(amenities || []) as any} />

            <div className="md:hidden">
              {project?.media.filter(
                media => media.category === MediaCategory.AMENITIES
              ).length > 0 && (
                <AmenitiesAdaptiveSlider
                  medias={project?.media
                    .filter(media => media.category === MediaCategory.AMENITIES)
                    .map(media => ({
                      media: media as any, // Временно используем any
                      description: media.description || undefined
                    }))}
                />
              )}
            </div>

            {/* Информация о застройщике */}
            <div className="mt-12 hidden lg:block">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-default-900">
                {t("aboutDeveloper")}
              </h2>
              <Card className="w-full bg-white dark:bg-[#2C2C2C] shadow-small overflow-hidden">
                <CardBody className="p-4 overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary/10 relative">
                        <Image
                          src={developer?.logo || "/vip-logo.png"}
                          alt={
                            developer?.translations?.[0]?.name || "Developer"
                          }
                          fill
                          priority
                          className="object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-semibold">
                        {developer?.translations?.[0]?.name || "UNKNOWN"}
                      </h3>
                    </div>
                    <Link
                      href={`/developers/${developer?.id}`}
                      className="text-primary hover:text-primary/80 flex items-center gap-1 break-words max-w-[200px]"
                    >
                      <span className="truncate">
                        {t("developer.learnMore")}
                      </span>
                      <IconArrowRight size={18} className="flex-shrink-0" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-full">
                    <div className="max-w-full">
                      <div className="text-sm text-gray-500 mb-1 break-words">
                        {developerT("deliveredOnTime")}
                      </div>
                      <div className="text-lg font-semibold flex items-center gap-2 break-words">
                        {developer?.deliveryRate || "0"}%
                      </div>
                    </div>

                    <div className="max-w-full">
                      <div className="text-sm text-gray-500 mb-1 break-words">
                        {developerT("yearOfEstablishment")}
                      </div>
                      <div className="text-lg font-semibold break-words">
                        {developer?.establishedYear || developerT("unnamed")}
                      </div>
                    </div>

                    <div className="max-w-full">
                      <div className="text-sm text-gray-500 mb-1 break-words">
                        {developerT("completed")}
                      </div>
                      <div className="text-lg font-semibold break-words">
                        {developer?.completedProjects || "0"}{" "}
                        {formatProjectsText(
                          Number(developer?.completedProjects) || 0,
                          locale as string
                        )}
                      </div>
                    </div>

                    <div className="max-w-full">
                      <div className="text-sm text-gray-500 mb-1 break-words">
                        {developerT("underConstruction")}
                      </div>
                      <div className="text-lg font-semibold break-words">
                        {developer?.ongoingProjects || "0"}{" "}
                        {formatProjectsText(
                          Number(developer?.ongoingProjects) || 0,
                          locale as string
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Инфраструктура */}
            <div className="mt-12">
              {project?.location?.latitude && project?.location?.longitude ? (
                <ErrorBoundary
                  fallback={
                    <Card className="w-full">
                      <CardBody className="p-6">
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-default-900">
                          {t("infrastructure.title")}
                        </h3>
                        <p className="text-default-600">
                          Произошла ошибка при загрузке карты. Пожалуйста,
                          попробуйте позже.
                        </p>
                      </CardBody>
                    </Card>
                  }
                >
                  {mapError ? (
                    <Card className="w-full">
                      <CardBody className="p-6">
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-default-900">
                          {t("infrastructure.title")}
                        </h3>
                        <p className="text-default-600">
                          {mapError}. Пожалуйста, попробуйте позже.
                        </p>
                      </CardBody>
                    </Card>
                  ) : (
                    <InfrastructureMap
                      assessment={transformProjectAssessment(project)}
                      latitude={project?.location?.latitude}
                      longitude={project?.location?.longitude}
                      address={
                        project?.location
                          ? `${project.location.district || ""}, ${project.location.city || ""}`
                          : ""
                      }
                    />
                  )}
                </ErrorBoundary>
              ) : (
                <Card className="w-full">
                  <CardBody className="p-6">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 text-default-900">
                      {t("infrastructure.title")}
                    </h3>
                    <p className="text-default-600">
                      {t("infrastructure.noLocationData")}
                    </p>
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Last updates */}
            {(project?.media || []).filter(
              media => media.category === MediaCategory.CONSTRUCTION_PROGRESS
            )?.length > 0 && (
              <>
                <div className="mt-12">
                  <h3 className="text-xl sm:text-2xl font-bold mb-6 text-default-900">
                    {t("headers.lastUpdates")}
                  </h3>
                  <div className="relative">
                    <div className="flex overflow-hidden px-1 pb-4">
                      {(project?.media || []).filter(
                        media =>
                          media.category === MediaCategory.CONSTRUCTION_PROGRESS
                      )?.length > 0
                        ? Array.from(
                            {
                              length: Math.ceil(
                                (project?.media || []).filter(
                                  media =>
                                    media.category ===
                                    MediaCategory.CONSTRUCTION_PROGRESS
                                ).length / 3
                              )
                            },
                            (_, i) => (
                              <div
                                key={i}
                                className={`w-full grid grid-cols-3 gap-4 transition-transform duration-300 ease-in-out ${
                                  i === currentUpdateSlide
                                    ? "opacity-100"
                                    : "opacity-0 absolute"
                                }`}
                                style={{
                                  transform: `translateX(${(i - currentUpdateSlide) * 100}%)`
                                }}
                              >
                                {(project?.media || [])
                                  .filter(
                                    media =>
                                      media.category ===
                                      MediaCategory.CONSTRUCTION_PROGRESS
                                  )
                                  .slice(i * 3, i * 3 + 3)
                                  .map((media, index) => (
                                    <Card
                                      key={index}
                                      className="bg-white dark:bg-[#2C2C2C] shadow-small"
                                    >
                                      <CardBody className="p-0">
                                        <div className="h-[180px] overflow-hidden">
                                          <img
                                            src={media.url}
                                            alt={
                                              media.description ||
                                              `Construction Update ${index + 1}`
                                            }
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div className="p-4">
                                          <h3 className="text-lg font-semibold">
                                            {media.description ||
                                              (media.createdAt
                                                ? new Date(
                                                    media.createdAt
                                                  ).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                      month: "long",
                                                      year: "numeric"
                                                    }
                                                  )
                                                : t("projectInfo.values.tba"))}
                                          </h3>
                                        </div>
                                      </CardBody>
                                    </Card>
                                  ))}
                              </div>
                            )
                          )
                        : null}
                    </div>

                    {/* Навигация слайдера */}
                    {((project?.media || []).filter(
                      media =>
                        media.category === MediaCategory.CONSTRUCTION_PROGRESS
                    )?.length || 0) > 3 && (
                      <div className="flex justify-end mt-4 gap-2">
                        <button
                          className="p-2 rounded-full bg-default-100 hover:bg-default-200 disabled:opacity-50"
                          onClick={() =>
                            setCurrentUpdateSlide(prev => Math.max(0, prev - 1))
                          }
                          disabled={currentUpdateSlide === 0}
                        >
                          <IconChevronLeft size={20} />
                        </button>
                        <button
                          className="p-2 rounded-full bg-default-100 hover:bg-default-200 disabled:opacity-50"
                          onClick={() =>
                            setCurrentUpdateSlide(prev =>
                              Math.min(
                                Math.ceil(
                                  ((project?.media || []).filter(
                                    media =>
                                      media.category ===
                                      MediaCategory.CONSTRUCTION_PROGRESS
                                  ).length || 0) / 3
                                ) - 1,
                                prev + 1
                              )
                            )
                          }
                          disabled={
                            currentUpdateSlide ===
                            Math.ceil(
                              ((project?.media || []).filter(
                                media =>
                                  media.category ===
                                  MediaCategory.CONSTRUCTION_PROGRESS
                              ).length || 0) / 3
                            ) -
                              1
                          }
                        >
                          <IconChevronRight size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Licenses & certifications */}
            {project?.documents &&
              project?.documents?.filter(doc => doc.category === "GENERAL")
                .length > 0 && (
                <>
                  <div className="mt-12">
                    <h3 className="text-xl sm:text-2xl font-bold mb-6 text-default-900">
                      {t("projectInfo.columns.licenses")}
                    </h3>
                    <div className="space-y-4">
                      {project?.documents
                        ?.filter(
                          doc => doc.category === DocumentCategory.GENERAL
                        )
                        ?.map(document => (
                          <Card
                            key={document.id}
                            className="w-full bg-white dark:bg-[#2C2C2C] shadow-small"
                          >
                            <CardBody className="p-4">
                              <div className="flex items-start gap-[14px]">
                                <div className="bg-[#EBF2FF] border-[4px] size-8 border-[#F5F8FF] rounded-full flex items-center justify-center">
                                  <IconFileText className="size-4 text-[#416DC6]" />
                                </div>

                                <div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-default-900 text-[18px] leading-[22px] hidden md:block">
                                      {document.title}
                                    </h4>

                                    <h4 className="font-semibold text-default-900 text-[18px] leading-[22px] md:hidden">
                                      {document.title.length > 25
                                        ? document.title.slice(0, 22) + "..."
                                        : document.title}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      {t("documents.date")}:{" "}
                                      {formatDate(document.createdAt)}
                                    </p>
                                  </div>

                                  <a
                                    href={document.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#535862] hover:text-[#416DC6] flex items-center gap-2 mt-2"
                                  >
                                    <span className="text-sm">
                                      {locale === "ru"
                                        ? "Просмотр документа"
                                        : "Show document"}
                                    </span>
                                    <IconArrowRight
                                      size={16}
                                      className="flex-shrink-0 text-[#535862]"
                                    />
                                  </a>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        ))}

                      {/* Показываем сообщение, если нет документов */}
                      {!project?.documents?.filter(
                        doc => doc.category === "GENERAL"
                      ) && (
                        <div className="text-center py-8 text-gray-500">
                          {t("projectInfo.columns.noLicenses")}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
          </div>

          {/* Правая колонка */}
          <div className="w-full lg:w-[280px] overflow-visible hidden md:block">
            {/* {project?.developerId && (
              <div className="mb-6">
                <CertificationBlock
                  developerId={project.developerId}
                  locale={locale}
                />
              </div>
            )} */}

            {/* Компонент запроса на просмотр */}
            {project && (
              <div className="overflow-visible">
                <ViewingRequest
                  projectId={project.id} // Добавили projectId
                  projectName={currentTranslation?.name || "PROJECT UNTITLED"}
                  location={`${project.location?.city || t("location.defaultCity")}, Thailand`}
                  priceRange={priceRange || t("units.priceOnRequest")}
                  onRequestViewing={() => setIsViewingRequestOpen(true)}
                />
              </div>
            )}
          </div>
        </div>
      </AdaptiveContainer>
      <ViewingRequestModal
        isOpen={isViewingRequestOpen}
        onClose={() => setIsViewingRequestOpen(false)}
        projectId={id as string}
        projectName={project?.translations?.[0]?.name || ""}
      />
    </div>
  );
}
