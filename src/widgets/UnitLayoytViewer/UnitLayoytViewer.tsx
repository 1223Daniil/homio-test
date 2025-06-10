import React, { useEffect, useMemo, useRef, useState } from "react";
import { Select, SelectItem } from "@heroui/select";
import { TbZoom, TbZoomIn, TbZoomOut } from "react-icons/tb";

import { FiBookmark } from "react-icons/fi";
import { FloorPlan } from "@prisma/client";
import Image from "next/image";
import { Key } from "react";
import { Spinner } from "@heroui/spinner";
import { Tooltip } from "@heroui/react";
import { formatNumberType } from "@/utils/formatPrice";
import styles from "./UnitLayoytViewer.module.css";
import { useParams } from "next/navigation";
import { useRouter } from "@/config/i18n";
import { useTranslations } from "next-intl";

interface IProps {
  type: "layout" | "floorPlan";
  floorPlans: {
    currentUnitId: string;
    floorPlans: FloorPlan[];
    layoutImage: string | null;
  };
  selectedFloorNumber?: number | null;
  onUnitSelect?: (unitId: string) => void;
  showTooltips?: boolean;
  showFloorSelector?: boolean;
  buildingData?: any;
  transparentSvg?: boolean;
  containerWidth?: string | number;
  containerHeight?: string | number;
  isPublic?: boolean;
}

const UnitLayoytViewer = ({
  type,
  floorPlans,
  selectedFloorNumber,
  onUnitSelect,
  showTooltips = false,
  showFloorSelector = true,
  buildingData,
  transparentSvg = false,
  containerWidth,
  containerHeight,
  isPublic = false
}: IProps) => {
  const [scale, setScale] = useState(1);
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<FloorPlan | null>(
    null
  );

  const t = useTranslations("UnitDetail.unit-modal");

  const sortedFloorPlans = useMemo(() => {
    return floorPlans.floorPlans.sort((a, b) => a.floorNumber - b.floorNumber);
  }, [floorPlans]);

  useEffect(() => {
    if (sortedFloorPlans.length > 0) {
      // Если есть selectedFloorNumber, находим соответствующий план
      if (selectedFloorNumber !== undefined && selectedFloorNumber !== null) {
        const floorPlanByNumber = sortedFloorPlans.find(
          plan => plan.floorNumber === selectedFloorNumber
        );

        if (floorPlanByNumber) {
          setSelectedFloorPlan(floorPlanByNumber);
          return;
        }
      }

      // Если есть currentUnitId, пытаемся найти план этажа с этим юнитом
      if (floorPlans.currentUnitId) {
        const foundFloorPlan = sortedFloorPlans.find(floorPlan => {
          if (!floorPlan.svgData) return false;
          try {
            const svgData = JSON.parse(floorPlan.svgData);
            return svgData.some(
              item => item.unitId === floorPlans.currentUnitId
            );
          } catch (e) {
            return false;
          }
        });

        if (foundFloorPlan) {
          setSelectedFloorPlan(foundFloorPlan);
          return;
        }
      }

      // Если не нашли план по юниту или юнита нет, берем первый план
      if (sortedFloorPlans[0]) {
        setSelectedFloorPlan(sortedFloorPlans[0]);
      } else {
        setSelectedFloorPlan(null);
      }
    } else {
      setSelectedFloorPlan(null);
    }
  }, [sortedFloorPlans, floorPlans.currentUnitId, selectedFloorNumber]);

  const onSelectionChange = (
    keys: (Set<Key> & { anchorKey?: string; currentKey?: string }) | "all"
  ) => {
    if (keys !== "all" && keys.size > 0) {
      const selectedKey = Array.from(keys)[0];
      if (typeof selectedKey === "string") {
        const index = parseInt(selectedKey);
        if (index >= 0 && index < sortedFloorPlans.length) {
          const plan = sortedFloorPlans[index];
          if (plan) {
            setSelectedFloorPlan(plan);
          }
        }
      }
    }
  };

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  };

  // Находим индекс текущего плана в отсортированном списке для селектора
  const selectedIndex = useMemo(() => {
    if (!selectedFloorPlan) return undefined;

    return sortedFloorPlans.findIndex(plan => plan.id === selectedFloorPlan.id);
  }, [selectedFloorPlan, sortedFloorPlans]);

  // Добавляем обработчик выбора юнита с проверкой на undefined
  const handleUnitSelect = (unitId: string) => {
    if (onUnitSelect) {
      onUnitSelect(unitId);
    }
  };

  // Создаем реф для доступа к функции fitToScreen из компонента FloorPlanImage
  const floorPlanImageRef = useRef<{ fitToScreen: () => void } | null>(null);

  // Формирование стилей для контейнера на основе переданных размеров
  const containerStyle = {
    ...(containerWidth && {
      width:
        typeof containerWidth === "number"
          ? `${containerWidth}px`
          : containerWidth
    }),
    ...(containerHeight && {
      height:
        typeof containerHeight === "number"
          ? `${containerHeight}px`
          : containerHeight
    })
  } as React.CSSProperties;

  console.log("buildingDatabuildingDatabuildingData", buildingData);

  return (
    <div className={`${styles.unitLayoytViewer}`} style={containerStyle}>
      <div className={styles.controls}>
        <div className={styles.controlsButton}>
          {type === "floorPlan" &&
            sortedFloorPlans.length > 0 &&
            showFloorSelector && (
              <>
                <Select
                  className={styles.selector}
                  placeholder={t("floorplans.unit-level")}
                  selectedKeys={
                    selectedIndex !== undefined
                      ? [selectedIndex.toString()]
                      : []
                  }
                  onSelectionChange={onSelectionChange}
                >
                  {sortedFloorPlans.map((floorPlan, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {t("floorplans.level", { level: floorPlan.floorNumber })}
                    </SelectItem>
                  ))}
                </Select>
              </>
            )}
        </div>

        <div className={styles.controlsButton}>
          <div className={styles.zoomControl}>
            <button
              className={styles.zoomControlButton}
              onClick={handleZoomOut}
            >
              <TbZoomOut />
            </button>
            <div className={styles.zoomControlTextContainer}>
              <span className={styles.zoomControlText}>
                {Math.round(scale * 100)}%
              </span>
            </div>
            <button className={styles.zoomControlButton} onClick={handleZoomIn}>
              <TbZoomIn />
            </button>
            <button
              className={styles.zoomControlButton}
              onClick={() => floorPlanImageRef.current?.fitToScreen()}
              title={t("floorplans.level")}
            >
              <TbZoom />
            </button>
          </div>
        </div>
      </div>

      {selectedFloorPlan ? (
        <FloorPlanImage
          floorPlan={selectedFloorPlan}
          imageUrl={
            type === "layout"
              ? floorPlans.layoutImage || ""
              : selectedFloorPlan.imageUrl || ""
          }
          scale={scale}
          setScale={setScale}
          currentUnitId={floorPlans.currentUnitId}
          type={type}
          onUnitSelect={handleUnitSelect}
          showTooltips={showTooltips}
          buildingData={buildingData}
          transparentSvg={transparentSvg}
          ref={(ref: any) => {
            if (ref) {
              floorPlanImageRef.current = { fitToScreen: ref.fitToScreen };
            }
          }}
          isPublic={isPublic}
        />
      ) : (
        <div className={styles.noImageContainer}>
          <p className={styles.noImageText}>
            {type === "layout"
              ? t("floorplans.no-layout")
              : t("floorplans.no-floor-plan")}
          </p>
        </div>
      )}
    </div>
  );
};

export default UnitLayoytViewer;

interface IFloorPlanImageProps {
  floorPlan: FloorPlan;
  imageUrl: string;
  scale: number;
  setScale: (scale: number) => void;
  currentUnitId?: string;
  type: "layout" | "floorPlan";
  onUnitSelect?: (unitId: string) => void;
  showTooltips?: boolean;
  buildingData?: any;
  transparentSvg?: boolean;
  ref?: React.Ref<{ fitToScreen: () => void }>;
  isPublic?: boolean;
}

const FloorPlanImage = React.forwardRef<
  { fitToScreen: () => void },
  IFloorPlanImageProps
>(
  (
    {
      floorPlan,
      imageUrl,
      scale,
      setScale,
      currentUnitId,
      type,
      onUnitSelect,
      showTooltips = false,
      buildingData,
      transparentSvg = false,
      isPublic = false
    },
    ref
  ) => {
    const [svgUnits, setSvgUnits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const t = useTranslations("UnitDetail.unit-modal.floorplans");

    useEffect(() => {
      if (floorPlan.svgData) {
        try {
          const parsedData = JSON.parse(floorPlan.svgData);
          setSvgUnits(parsedData);
        } catch (e) {
          console.error("Ошибка при парсинге SVG данных:", e);
          setSvgUnits([]);
        }
      } else {
        setSvgUnits([]);
      }
    }, [floorPlan]);

    // Обработчик начала перемещения
    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      if (containerRef.current) {
        containerRef.current.style.cursor = "grabbing";
      }
    };

    // Обработчик перемещения
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    };

    // Обработчик окончания перемещения
    const handleMouseUp = () => {
      setIsDragging(false);
      if (containerRef.current) {
        containerRef.current.style.cursor = "grab";
      }
    };

    // Обработчик выхода курсора за пределы контейнера
    const handleMouseLeave = () => {
      if (isDragging) {
        setIsDragging(false);
        if (containerRef.current) {
          containerRef.current.style.cursor = "grab";
        }
      }
    };

    // Добавляем и удаляем обработчики глобальных событий мыши
    useEffect(() => {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, [isDragging, dragStart]);

    // Сброс позиции при изменении масштаба или загрузке новых данных
    useEffect(() => {
      // Только центрируем изображение при изменении данных
      setPosition({ x: 0, y: 0 });
      // Не сбрасываем масштаб здесь, чтобы не перезаписать значение из handleImageLoad
    }, [floorPlan, imageUrl]);

    const handleImageLoad = () => {
      if (imageRef.current && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const imgWidth = imageRef.current.naturalWidth;
        const imgHeight = imageRef.current.naturalHeight;

        const containerRatio = containerWidth / containerHeight;
        const imageRatio = imgWidth / imgHeight;

        let width: number;
        let height: number;

        if (containerRatio > imageRatio) {
          height = containerHeight;
          width = height * imageRatio;
        } else {
          width = containerWidth;
          height = width / imageRatio;
        }

        setImageSize({ width, height });

        // Устанавливаем масштаб 100% вместо автоматического fitToScreen
        setScale(1);
        // Центрируем изображение
        setPosition({ x: 0, y: 0 });

        setIsLoading(false);
      }
    };

    const handleWheel = (e: React.WheelEvent) => {
      // Предотвращаем скроллинг страницы
      e.preventDefault();
      e.stopPropagation();

      // Уменьшаем чувствительность скролла
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const newScale = Math.max(0.5, Math.min(3, scale + delta));

      if (newScale !== scale) {
        setScale(newScale);
      }
    };

    // Добавляем и удаляем обработчики событий wheel с passive: false
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Добавляем обработчик события wheel с passive: false для предотвращения скроллинга страницы
      const preventScroll = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Уменьшаем чувствительность скролла
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        const newScale = Math.max(0.5, Math.min(3, scale + delta));

        if (newScale !== scale) {
          setScale(newScale);
        }
      };

      // Используем addEventListener с опцией passive: false
      container.addEventListener("wheel", preventScroll, { passive: false });

      return () => {
        // Удаляем обработчик при размонтировании компонента
        container.removeEventListener("wheel", preventScroll);
      };
    }, [scale, setScale]);

    const handleDragStart = (e: React.DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Обработчик для передачи юнита в родительский компонент
    const handleUnitSelection = (unitId: string) => {
      if (onUnitSelect) {
        onUnitSelect(unitId);
      }
    };

    const fitToScreen = () => {
      if (imageRef.current && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const imgWidth = imageRef.current.naturalWidth;
        const imgHeight = imageRef.current.naturalHeight;

        const scaleX = containerWidth / imgWidth;
        const scaleY = containerHeight / imgHeight;
        // Изменяем на фиксированное значение 1 (100%) вместо автоматического расчета
        const newScale = 1;

        // Применяем новый масштаб
        setScale(Math.max(0.5, newScale));

        // Центрируем изображение
        setPosition({ x: 0, y: 0 });
      }
    };

    // Используем useImperativeHandle для предоставления методов через ref
    React.useImperativeHandle(ref, () => ({
      fitToScreen
    }));

    return (
      <div
        className={`${styles.imageContainer}`}
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {isLoading && (
          <div className={styles.loaderContainer}>
            <Spinner size="lg" color="primary" />
          </div>
        )}

        {imageUrl ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isLoading ? 0 : 1,
              transition: "opacity 0.3s ease-in-out"
            }}
          >
            <div
              style={{
                position: "relative",
                width: imageSize.width,
                height: imageSize.height,
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transformOrigin: "center",
                transition: isDragging ? "none" : "transform 0.2s"
              }}
            >
              <Image
                ref={imageRef as any}
                src={imageUrl}
                alt={`План этажа ${floorPlan.floorNumber}`}
                fill
                draggable="false"
                onDragStart={handleDragStart}
                className={styles.image}
                onLoadingComplete={handleImageLoad}
                priority
              />

              {type === "floorPlan" && (
                <UnitSvgFloorPlan
                  svgUnits={svgUnits}
                  currentUnitId={currentUnitId || ""}
                  imageSize={imageSize}
                  onUnitSelect={handleUnitSelection}
                  showTooltips={showTooltips}
                  buildingData={buildingData}
                  floorPlan={floorPlan}
                  transparentSvg={transparentSvg}
                  isPublic={isPublic}
                />
              )}
            </div>
          </div>
        ) : (
          <div className={styles.noImageContainer}>
            <p className={styles.noImageText}>
              {type === "layout" ? t("no-layout") : t("no-floor-plan")}
            </p>
          </div>
        )}
      </div>
    );
  }
);

FloorPlanImage.displayName = "FloorPlanImage";

interface IUnitSvgFloorPlanProps {
  svgUnits: any[];
  currentUnitId: string;
  imageSize: { width: number; height: number };
  onUnitSelect?: (unitId: string) => void;
  showTooltips?: boolean;
  buildingData?: any;
  floorPlan?: FloorPlan;
  transparentSvg?: boolean;
  isPublic?: boolean;
}

const UnitSvgFloorPlan = ({
  svgUnits,
  currentUnitId,
  imageSize,
  onUnitSelect,
  showTooltips = false,
  buildingData,
  floorPlan,
  transparentSvg = false,
  isPublic = false
}: IUnitSvgFloorPlanProps) => {
  const [hoveredUnit, setHoveredUnit] = useState<string | null>(null);

  const params = useParams();

  const t = useTranslations("UnitDetail");
  const projectT = useTranslations("ProjectDetails.tabs.masterPlan.floorPlan");
  const currencyT = useTranslations("projects.currency.symbols");
  const amountT = useTranslations("Amounts");

  const router = useRouter();

  // Исправленный обработчик наведения - работает для всех юнитов
  const handleUnitHover = (unit: any, e: React.MouseEvent) => {
    if (!unit || !e) return;

    // Убираем проверку на unitId, чтобы обрабатывать все элементы
    const currentTarget = e.currentTarget;
    if (!currentTarget) return;

    const dataIndex = currentTarget.getAttribute("data-index");
    const unitId = unit.unitId || (dataIndex ? `unit-${dataIndex}` : null);

    if (unitId) {
      setHoveredUnit(unitId);
    }
  };

  const handleUnitLeave = () => {
    setHoveredUnit(null);
  };

  const handleUnitClick = (unit: any) => {
    if (!unit) return;

    // Проверяем наличие unitId
    if (unit.unitId) {
      // Если есть функция обратного вызова, вызываем ее
      if (onUnitSelect) {
        onUnitSelect(unit.unitId);
      }

      // Если есть buildingData с id проекта, перенаправляем на страницу юнита
      if (buildingData && buildingData.id) {
        router.push(
          isPublic
            ? `/p/${params.slug}/units/${
                buildingData.units.find(u => u.id === unit.unitId)?.slug
              }`
            : `/projects/${buildingData.project.id}/units/${unit.unitId}`
        );
      }
    }
  };

  // Функция для получения данных юнита из buildingData
  const getUnitData = (unitId: string) => {
    if (!buildingData || !buildingData.units) return null;

    const foundUnit = buildingData.units.find(
      (unit: any) => unit.id === unitId
    );
    if (foundUnit) {
      // Если нашли юнит, ищем его тип (layout) среди layouts здания
      if (buildingData.layouts && foundUnit.layoutId) {
        const layout = buildingData.layouts.find(
          (l: any) => l.id === foundUnit.layoutId
        );
        if (layout) {
          return { ...foundUnit, layout };
        }
      }
      return foundUnit;
    }
    return null;
  };

  // Улучшенная функция для рендеринга содержимого тултипа
  const renderTooltipContent = (unit: any) => {
    try {
      console.log("unit", unit);

      if (!unit)
        return (
          <div className={styles["tooltip-empty"]}>{projectT("noData")}</div>
        );

      // Безопасное получение данных юнита
      const unitData = unit.unitId ? getUnitData(unit.unitId) : null;

      // Получаем валюту проекта из buildingData.project.currency или используем запасное значение
      const currency =
        buildingData?.project?.currency || unitData?.layout?.currency || "USD";

      // Возвращаем сообщение, если нет данных юнита
      if (!unitData) {
        return (
          <div className={styles["tooltip-no-data"]}>
            <p>{projectT("dataIsNotAvailable")}</p>
          </div>
        );
      }

      const formattedPrice = formatNumberType(unitData.price);
      console.log(unitData.status);

      return (
        <div
          className={`${styles["tooltip-content"]} ${styles.tooltip} ${styles[`${unitData.status}`]} cursor-pointer`}
          style={{ padding: "8px 12px", minWidth: "180px" }}
          onClick={() => handleUnitClick(unit)}
        >
          <div className={styles.tooltipHeader}>
            <div className={styles.tooltipUnitNumber}>
              <span>{unitData.number || unitData.unitNumber || "Н/Д"}</span>
              <button>
                <FiBookmark size={20} />
              </button>
            </div>

            {unitData.layout && (
              <p className={styles.tooltipLayoutName}>
                {unitData.layout.name.length > 10
                  ? unitData.layout.name.slice(0, 7) + "..."
                  : unitData.layout.name}
              </p>
            )}
          </div>

          <div className={styles.tooltipPrice}>
            {unitData.price > 0 ? (
              <span>
                {(() => {
                  // Проверяем, является ли валюта одной из допустимых
                  const validCurrencies = [
                    "USD",
                    "EUR",
                    "THB",
                    "IDR",
                    "AED",
                    "VND",
                    "MYR",
                    "SGD"
                  ];
                  if (
                    typeof currency === "string" &&
                    validCurrencies.includes(currency)
                  ) {
                    // Используем правильный тип для вызова функции перевода
                    return currencyT(currency as any);
                  }
                  return currency;
                })()}{" "}
                {formattedPrice?.number}{" "}
                {(() => {
                  // Проверяем, является ли тип одним из допустимых
                  const validTypes = ["thousand", "million"];
                  if (
                    formattedPrice?.type &&
                    typeof formattedPrice.type === "string" &&
                    validTypes.includes(formattedPrice.type)
                  ) {
                    // Используем правильный тип для вызова функции перевода
                    return amountT(formattedPrice.type as any);
                  }
                  return "";
                })()}
              </span>
            ) : (
              <span>{unitData.status}</span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px"
            }}
            className={styles.totalArea}
          >
            {unitData.layout?.totalArea && (
              <span>
                {unitData.layout.totalArea} {projectT("unit.sqm")}
              </span>
            )}
          </div>
        </div>
      );
    } catch (error) {
      console.error("Ошибка при рендеринге тултипа:", error);
      return (
        <div className={styles["tooltip-error"]}>
          {projectT("unit.displayError")}
        </div>
      );
    }
  };

  // Вспомогательная функция для определения типа планировки
  const getLayoutType = (unitData: any) => {
    if (!unitData) return "Studio";

    if (unitData.layout?.type) return unitData.layout.type;

    if (unitData.bedrooms) {
      return `${unitData.bedrooms}-${projectT("unit.bedroom")}`;
    }

    if (unitData.type) return unitData.type;

    return projectT("unit.studio");
  };

  return (
    svgUnits.length > 0 &&
    imageSize.width > 0 && (
      <>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 10
          }}
        >
          <g>
            {/* Эффект свечения для текущего юнита */}
            {svgUnits.map(
              (unit, index) =>
                unit.unitId === currentUnitId &&
                !transparentSvg && (
                  <path
                    key={`glow-${index}`}
                    d={unit.svgPath}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="0.8"
                    className={styles.glowEffect}
                    style={{
                      filter: "blur(1px)",
                      opacity: 0.6,
                      pointerEvents: "none"
                    }}
                  />
                )
            )}

            {/* Отрисовка всех юнитов на плане этажа */}
            {svgUnits.map((unit, index) => {
              const unitId = unit.unitId || `unit-${index}`;
              const isActive = unitId === currentUnitId;
              const isHovered = unitId === hoveredUnit;

              // Если tooltips отключены, возвращаем просто путь
              if (!showTooltips) {
                return (
                  <path
                    key={`unit-${index}`}
                    data-index={index}
                    d={unit.svgPath}
                    fill={
                      transparentSvg
                        ? isHovered
                          ? "transparent"
                          : "rgba(255, 255, 255, 0.4)"
                        : isActive
                          ? "rgba(34, 197, 94, 0.7)"
                          : isHovered
                            ? "rgba(0, 123, 255, 0.5)"
                            : "rgba(0, 123, 255, 0.2)"
                    }
                    stroke={
                      transparentSvg
                        ? isHovered
                          ? "transparent"
                          : "rgba(255, 255, 255, 0.6)"
                        : isActive
                          ? "#16a34a"
                          : "#007bff"
                    }
                    strokeWidth={
                      transparentSvg
                        ? isHovered
                          ? "0"
                          : "0.5"
                        : isActive
                          ? "0.3"
                          : "0.1"
                    }
                    className={isActive ? styles.activeUnit : ""}
                    style={{
                      pointerEvents: "all",
                      cursor: "pointer",
                      transition: "fill 0.3s ease, stroke 0.3s ease",
                      filter:
                        transparentSvg && !isHovered ? "blur(0.5px)" : "none"
                    }}
                    onMouseEnter={e => handleUnitHover(unit, e)}
                    onMouseLeave={handleUnitLeave}
                    onClick={() => handleUnitClick(unit)}
                  />
                );
              }

              // Если tooltips включены, оборачиваем путь в компонент Tooltip с правильными данными
              return (
                <Tooltip
                  key={`unit-${index}`}
                  content={renderTooltipContent(unit)}
                  placement="top"
                  showArrow={true}
                  classNames={{
                    base: "shadow-lg border border-default-200",
                    content: "p-0"
                  }}
                >
                  <path
                    data-index={index}
                    d={unit.svgPath}
                    fill={
                      transparentSvg
                        ? isHovered
                          ? "transparent"
                          : "rgba(255, 255, 255, 0.4)"
                        : isActive
                          ? "rgba(34, 197, 94, 0.7)"
                          : isHovered
                            ? "rgba(0, 123, 255, 0.5)"
                            : "rgba(0, 123, 255, 0.2)"
                    }
                    stroke={
                      transparentSvg
                        ? isHovered
                          ? "transparent"
                          : "rgba(255, 255, 255, 0.6)"
                        : isActive
                          ? "#16a34a"
                          : "#007bff"
                    }
                    strokeWidth={
                      transparentSvg
                        ? isHovered
                          ? "0"
                          : "0.5"
                        : isActive
                          ? "0.3"
                          : "0.1"
                    }
                    className={isActive ? styles.activeUnit : ""}
                    style={{
                      pointerEvents: "all",
                      cursor: "pointer",
                      transition: "fill 0.3s ease, stroke 0.3s ease",
                      filter:
                        transparentSvg && !isHovered ? "blur(0.5px)" : "none"
                    }}
                    onMouseEnter={e => handleUnitHover(unit, e)}
                    onMouseLeave={handleUnitLeave}
                    onClick={() => handleUnitClick(unit)}
                  />
                </Tooltip>
              );
            })}
          </g>
        </svg>
      </>
    )
  );
};
