import { useEffect, useMemo, useState } from "react";

import { FloorPlan } from "@prisma/client";
import ProjectFloorsList from "../ProjectFloorsList";
import UnitLayoytViewer from "../UnitLayoytViewer";
import styles from "./ProjectFloorPlan.module.css";
import { useLayouts } from "@/hooks/useLayouts";

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
    return `/api/image-proxy/${cloudPath}?width=${width}&height=${height}&quality=${quality}`;
  }

  // Для остальных изображений
  const normalizedUrl = imageUrl.replace(/^https?:\/\//, "");
  return `/api/image-proxy/${normalizedUrl}?width=${width}&height=${height}&quality=${quality}`;
};

interface ProjectFloorPlanProps {
  floorPlans: FloorPlan[];
  showFloorSelector?: boolean;
  showTooltips?: boolean;
  buildingData?: any;
  width?: string | number;
  height?: string | number;
  className?: string;
  isPublic?: boolean;
}

const ProjectFloorPlan = ({
  floorPlans,
  showFloorSelector = true,
  showTooltips = false,
  buildingData,
  width,
  height,
  className,
  isPublic = false
}: ProjectFloorPlanProps) => {
  const [activeFloor, setActiveFloor] = useState<number | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const { selectedLayouts } = useLayouts();

  // Получаем список этажей из поэтажных планов
  const floorNumbers = useMemo(() => {
    // Извлекаем номера этажей из planFloors и сортируем их
    if (!floorPlans || floorPlans.length === 0) {
      return [];
    }

    // Получаем уникальные номера этажей
    const floorNumArr = floorPlans.map(plan => plan.floorNumber);
    const uniqueFloors = Array.from(new Set(floorNumArr));

    // Сортировка от меньшего к большему
    return uniqueFloors.sort((a, b) => a - b);
  }, [floorPlans]);

  // Устанавливаем первый этаж по умолчанию
  useEffect(() => {
    if (floorNumbers.length > 0 && activeFloor === null) {
      // Проверяем, что первый элемент не undefined
      const firstFloor = floorNumbers[0];
      if (typeof firstFloor === "number") {
        setActiveFloor(firstFloor);
      }
    }
  }, [floorNumbers, activeFloor]);

  // Максимальный этаж
  const maxFloor = floorNumbers.length > 0 ? Math.max(...floorNumbers) : 0;

  // Количество юнитов на каждом этаже
  const unitsPerFloor = useMemo(() => {
    if (!floorPlans || floorPlans.length === 0) return {};

    const countMap: Record<number, number> = {};

    for (const plan of floorPlans) {
      if (!plan.svgData) continue;

      try {
        const svgData = JSON.parse(plan.svgData);
        const uniqueUnitIds = new Set(
          svgData
            .filter((item: any) => item.unitId)
            .map((item: any) => item.unitId)
        );

        countMap[plan.floorNumber] = uniqueUnitIds.size;
      } catch (e) {
        console.error("Ошибка при парсинге SVG данных:", e);
      }
    }

    return countMap;
  }, [floorPlans]);

  // Проксируем URL изображений в планах этажей
  const proxiedFloorPlans = useMemo(() => {
    return floorPlans.map(plan => {
      if (!plan.imageUrl) return plan;

      return {
        ...plan,
        imageUrl: getProxiedImageUrl(plan.imageUrl, 1024, 768, 100)
      };
    });
  }, [floorPlans]);

  // Данные для просмотрщика этажей
  const viewerData = {
    type: "floorPlan",
    currentUnitId: selectedUnitId || "",
    floorPlans: proxiedFloorPlans,
    layoutImage: null
  };

  // Обработчик выбора юнита
  const handleUnitSelection = (unitId: string) => {
    setSelectedUnitId(unitId);
  };

  // Формирование стилей для контейнера на основе переданных размеров
  const containerStyle = {
    ...(width && {
      "--floor-plan-width": typeof width === "number" ? `${width}px` : width
    }),
    ...(height && {
      "--floor-plan-height": typeof height === "number" ? `${height}px` : height
    })
  } as React.CSSProperties;

  return (
    <div
      className={`${styles.floorPlan} ${className || ""}`}
      style={containerStyle}
    >
      <ProjectFloorsList
        floors={floorNumbers}
        setActiveFloor={setActiveFloor}
        unitsPerFloor={unitsPerFloor}
        maxFloor={maxFloor}
        activeFloor={activeFloor}
      />

      <UnitLayoytViewer
        type="floorPlan"
        floorPlans={viewerData}
        selectedFloorNumber={activeFloor}
        onUnitSelect={handleUnitSelection}
        showFloorSelector={showFloorSelector}
        showTooltips={showTooltips}
        buildingData={buildingData}
        transparentSvg={true}
        containerWidth={808}
        containerHeight={684}
        isPublic={isPublic}
      />
    </div>
  );
};

export default ProjectFloorPlan;
