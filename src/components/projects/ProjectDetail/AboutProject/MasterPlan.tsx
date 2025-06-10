"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";

import Availability from "@/shared/components/Availability";
import BlurHashImage from "@/components/media/BlurHashImage";
import { Button } from "@heroui/react";
import { ErrorBoundary } from "@/components/utils/ErrorBoundary";
import { IconMaximize } from "@tabler/icons-react";
import Image from "next/image";
import MasterPlanPointComponent from "@/shared/components/MasterPlanPoint";
import { MasterPlanPoint as MasterPlanPointType } from "@/types/domain";
import ProjectAdaptiveAvailbility from "@/widgets/ProjectAdaptiveAvailbility";
import UnitsList from "@/widgets/ProjectUnits";
import dynamic from "next/dynamic";
import { formatDateToQuarter } from "@/utils/formatQuarterDate";
import { useLayouts } from "@/hooks/useLayouts";
import { useTranslations } from "next-intl";

interface MasterPlanProps {
  project: any;
  masterPlanPoints: any[];
  projectBuildingsData: any[];
  isClient: boolean;
  locale: string;
}

// Ленивая загрузка тяжелых компонентов
const BlurhashWithNoSSR = dynamic(
  () => import("react-blurhash").then(mod => mod.Blurhash),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
    )
  }
);

// Функция для проксирования URL изображений
const getProxiedImageUrl = (
  imageUrl: string,
  width: number = 1200,
  height: number = 800,
  quality: number = 90
): string => {
  if (!imageUrl) return "";

  // Пропускаем локальные изображения
  if (imageUrl.startsWith("/")) return imageUrl;

  // Пропускаем уже проксированные изображения
  if (imageUrl.startsWith("/api/image-proxy/")) {
    return imageUrl;
  }

  // Для изображений из Yandex Cloud
  if (imageUrl.includes("storage.yandexcloud.net")) {
    const cloudPath = imageUrl.replace(
      /^https?:\/\/storage\.yandexcloud\.net\//,
      ""
    );
    return `/api/image-proxy/${cloudPath}?width=${width}&height=${height}&quality=${quality}&format=webp`;
  }

  // Для остальных изображений
  const normalizedUrl = imageUrl.replace(/^https?:\/\//, "");
  return `/api/image-proxy/${normalizedUrl}?width=${width}&height=${height}&quality=${quality}&format=webp`;
};

const MasterPlan = ({
  project,
  masterPlanPoints,
  projectBuildingsData,
  isClient,
  locale
}: MasterPlanProps) => {
  const t = useTranslations("ProjectDetails");
  const [activeMasterPlanPoint, setActiveMasterPlanPoint] =
    useState<MasterPlanPointType | null>(null);
  const masterPlanRef = useRef<HTMLDivElement>(null);
  const [masterPlanImageDimensions, setMasterPlanImageDimensions] = useState({
    width: 720,
    height: 480
  });
  const masterPlanImageRef = useRef<HTMLImageElement>(null);
  const [isMasterPlanLoading, setIsMasterPlanLoading] = useState(true);
  const [useManualAdjustment, setUseManualAdjustment] = useState(false);
  const { selectedLayouts } = useLayouts();
  const [showEnlargedView, setShowEnlargedView] = useState(false);
  const [masterPlanImageLoaded, setMasterPlanImageLoaded] = useState(false);

  const [adjustmentFactors, setAdjustmentFactors] = useState({
    xFactor: 0.78,
    yFactor: 1.29,
    xOffset: 9,
    yOffset: -1
  });

  // Мемоизируем выбранное здание
  const selectedBuilding = projectBuildingsData.find(
    building => activeMasterPlanPoint?.id === building.id
  );

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
    [projectBuildingsData, project?.completionDate]
  );

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

  // Проверяем наличие дебаг-режима при загрузке
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDebugMode =
        new URLSearchParams(window.location.search).get("debug") === "true";

      setUseManualAdjustment(isDebugMode || false);
    }
  }, []);

  const masterPlanImage = useMemo(() => {
    const masterPlanMedia = project?.media?.find(
      item => item.category === "MASTER_PLAN"
    );

    if (!masterPlanMedia) {
      return null;
    }

    // Проксируем URL изображения для оптимизации
    const imageUrl = getProxiedImageUrl(masterPlanMedia.url, 1200, 1200, 90);
    const blurhash = masterPlanMedia.blurhash || "";

    return { url: imageUrl, blurhash };
  }, [project?.media]);

  useEffect(() => {
    // Регистрируем загрузку мастер-плана как часть метрик LCP
    if (masterPlanImageLoaded) {
      // Используем web-vitals API для отслеживания метрик
      if (typeof window !== "undefined" && "performance" in window) {
        // Отправляем в Performance API метку для возможного анализа
        performance.mark("masterplan-loaded");

        try {
          // Создаем метрику для возможного сбора аналитики
          const entry = performance.getEntriesByName("masterplan-loaded").pop();
          if (entry && "PerformanceObserver" in window) {
            // Можно использовать для интеграции с аналитикой
          }
        } catch (e) {
          // Игнорируем ошибки Performance API
        }
      }
    }
  }, [masterPlanImageLoaded]);

  return (
    <div id="master-plan" className="py-4">
      <h3 className="text-lg font-semibold mb-4 text-default-900">
        {t("tabs.masterPlan.title")}
      </h3>

      {project?.media?.find(
        media => media.category === "MASTER_PLAN" && media.type === "photo"
      ) ? (
        <>
          <div className="md:hidden">
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
                  if (masterPlanImage.startsWith("/")) return masterPlanImage;

                  // Для изображений из Yandex Cloud
                  if (masterPlanImage.includes("storage.yandexcloud.net")) {
                    const cloudPath = masterPlanImage.replace(
                      /^https?:\/\/storage\.yandexcloud\.net\//,
                      ""
                    );
                    return `/api/image-proxy/${cloudPath}?width=1024&height=768&quality=80`;
                  }

                  if (masterPlanImage.startsWith("/api/image-proxy/")) {
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
          </div>
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

              {/* Базовое изображение мастер-плана */}
              {masterPlanImage && (
                <>
                  {masterPlanImage.blurhash && (
                    <div className="absolute inset-0">
                      <Suspense
                        fallback={
                          <div className="absolute inset-0 bg-gray-200" />
                        }
                      >
                        <BlurhashWithNoSSR
                          hash={masterPlanImage.blurhash}
                          width="100%"
                          height="100%"
                          resolutionX={32}
                          resolutionY={32}
                          punch={1}
                        />
                      </Suspense>
                    </div>
                  )}
                  <Image
                    src={masterPlanImage ? masterPlanImage.url : ""}
                    alt={t("tabs.masterPlan.title")}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    quality={85}
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
                    ref={masterPlanImageRef}
                  />
                </>
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
                        handleBuildingPointClick={handleBuildingPointClick}
                        activeMasterPlanPoint={activeMasterPlanPoint}
                        setIsOpen={setActiveMasterPlanPoint}
                        originalWidth={638.76}
                        originalHeight={556.64}
                        displayWidth={masterPlanImageDimensions.width}
                        displayHeight={masterPlanImageDimensions.height}
                        // Передаем коэффициенты, если включен ручной режим
                        adjustmentFactors={
                          useManualAdjustment ? adjustmentFactors : undefined
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
            <Availability building={selectedBuilding} isPublic={true} />
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
              isPublic={true}
            />
          </ErrorBoundary>
        )}
      </section>
    </div>
  );
};

export default MasterPlan;
