import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Tooltip as ChartTooltip,
  Legend,
  LinearScale,
  Title
} from "chart.js";
import {
  MouseEvent,
  TouchEvent,
  WheelEvent,
  useEffect,
  useRef,
  useState
} from "react";
import { Unit, UnitLayout } from "@prisma/client";

import { Bar } from "react-chartjs-2";
import { UnitItem } from "../AdaptiveUnitsList/AdaptiveUnitsList";
import { cn } from "../../lib/utils";
import { formatNumberType } from "@/utils/formatPrice";
import { tailwindConfig } from "../../lib/tailwind-config";
import { useRouter } from "@/config/i18n";
import { useTranslations } from "next-intl";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

interface FloorPlan {
  id: string;
  floorNumber: number;
  name: string;
  imageUrl: string;
  svgData: string;
  description: string | null;
  status: string;
  order: number;
}

interface AdaptiveUnitsFloorPlanProps {
  className?: string;
  layouts?: (UnitLayout & { units: Unit[] })[];
  floorPlans?: FloorPlan[];
  project?: {
    id: string;
    currency: string;
    offDate: string;
  };
}

const AdaptiveUnitsFloorPlan = ({
  className,
  layouts = [],
  floorPlans = [],
  project = { id: "", currency: "USD", offDate: new Date().toISOString() }
}: AdaptiveUnitsFloorPlanProps) => {
  const [selectedFloor, setSelectedFloor] = useState<FloorPlan | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const unitCardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(
    null
  );
  const [zoomLevel, setZoomLevel] = useState(3.0); // Увеличиваем начальный масштаб до 300%
  const [svgUnits, setSvgUnits] = useState<any[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [compressedImage, setCompressedImage] = useState<string | null>(null);

  const t = useTranslations("UnitDetail");
  const projectT = useTranslations("ProjectDetails.tabs.masterPlan.floorPlan");
  const currencyT = useTranslations("projects.currency.symbols");
  const amountT = useTranslations("Amounts");
  const floorsT = useTranslations("ProjectDetails.tabs.masterPlan.floorsList");

  const router = useRouter();

  const floorCounts: Record<string, number> = {};

  layouts?.forEach(layout => {
    layout.units.forEach(unit => {
      const floor = unit.floor?.toString() || "0";
      floorCounts[floor] = (floorCounts[floor] || 0) + 1;
    });
  });

  const sortedFloors = Object.keys(floorCounts).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  // Парсинг SVG данных выбранного этажа
  useEffect(() => {
    if (selectedFloor && selectedFloor.svgData) {
      try {
        const parsedData = JSON.parse(selectedFloor.svgData);
        setSvgUnits(parsedData);
      } catch (e) {
        console.error("Ошибка при парсинге SVG данных:", e);
        setSvgUnits([]);
      }
    } else {
      setSvgUnits([]);
    }
  }, [selectedFloor]);

  const handleFloorClick = (floor: string) => {
    const floorNumber = parseInt(floor);
    const foundFloorPlan = floorPlans.find(
      fp => fp.floorNumber === floorNumber
    );
    if (foundFloorPlan) {
      setSelectedFloor(foundFloorPlan);
      // Сбрасываем позицию при выборе нового этажа
      setPosition({ x: 0, y: 0 });
      // Устанавливаем увеличенный масштаб по умолчанию
      setZoomLevel(3.0);
      // Сбрасываем флаг загрузки изображения и размер
      setImageLoaded(false);
      setImageSize({ width: 0, height: 0 });
    }
  };

  // Обработчик загрузки изображения
  const handleImageLoad = () => {
    setImageLoaded(true);

    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setImageSize({
        width: naturalWidth,
        height: naturalHeight
      });
    }
  };

  // Эффект для проксирования изображения
  useEffect(() => {
    if (!selectedFloor?.imageUrl || !imageContainerRef.current) return;

    // Получаем размеры контейнера для оптимального качества изображения
    const width = imageContainerRef.current.clientWidth * 3;
    const height = imageContainerRef.current.clientHeight * 3;

    if (
      typeof selectedFloor.imageUrl === "string" &&
      selectedFloor.imageUrl.includes("storage.yandexcloud.net")
    ) {
      const cloudPath = selectedFloor.imageUrl.replace(
        "https://storage.yandexcloud.net/",
        ""
      );
      setCompressedImage(
        `/api/image-proxy/${cloudPath}?width=${width}&height=${height}&quality=100`
      );
    } else {
      setCompressedImage(null);
    }
  }, [selectedFloor?.imageUrl, imageContainerRef.current]);

  // Обработчики для перетаскивания изображения (мышь)
  const handleMouseDown = (e: MouseEvent) => {
    if (!selectedFloor) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !imageContainerRef.current) return;

    const containerRect = imageContainerRef.current.getBoundingClientRect();
    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;

    // Увеличиваем размер границ перемещения с учетом масштаба
    const maxX = (containerRect.width * zoomLevel) / 2;
    const maxY = (containerRect.height * zoomLevel) / 2;

    setPosition({
      x: Math.max(Math.min(newX, maxX), -maxX),
      y: Math.max(Math.min(newY, maxY), -maxY)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Обработчики для сенсорных устройств
  const handleTouchStart = (e: TouchEvent) => {
    if (!selectedFloor || !e.touches) return;

    // Сохраняем начальную позицию для перетаскивания
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (!touch) return;

      setIsDragging(true);
      setStartPos({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
    // Сохраняем начальное расстояние между пальцами для масштабирования
    else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      if (!touch1 || !touch2) return;

      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setLastTouchDistance(distance);
    }

    // Предотвращаем прокрутку страницы при жестах на изображении
    e.preventDefault();
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!selectedFloor || !imageContainerRef.current || !e.touches) return;

    // Обработка перетаскивания (один палец)
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      if (!touch) return;

      const containerRect = imageContainerRef.current.getBoundingClientRect();
      const newX = touch.clientX - startPos.x;
      const newY = touch.clientY - startPos.y;

      // Ограничиваем перемещение
      const maxX = (containerRect.width * zoomLevel) / 2;
      const maxY = (containerRect.height * zoomLevel) / 2;

      setPosition({
        x: Math.max(Math.min(newX, maxX), -maxX),
        y: Math.max(Math.min(newY, maxY), -maxY)
      });
    }
    // Обработка масштабирования (два пальца)
    else if (e.touches.length === 2 && lastTouchDistance !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      if (!touch1 || !touch2) return;

      const newDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      // Изменение масштаба на основе изменения расстояния между пальцами
      const scaleFactor = newDistance / lastTouchDistance;
      const newZoomLevel = Math.max(1, Math.min(5, zoomLevel * scaleFactor));

      // Обновляем масштаб и запоминаем новое расстояние
      setZoomLevel(newZoomLevel);
      setLastTouchDistance(newDistance);
    }

    // Предотвращаем прокрутку страницы
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDistance(null);
  };

  // Получение данных юнита
  const getUnitData = (unitId: string) => {
    // Поиск юнита во всех layouts
    for (const layout of layouts) {
      const foundUnit = layout.units.find(unit => unit.id === unitId);
      if (foundUnit) {
        return {
          ...foundUnit,
          layout: {
            name: layout.name,
            type: layout.type,
            totalArea: layout.totalArea
          }
        };
      }
    }
    return null;
  };

  // Обработчик для масштабирования колесиком мыши
  const handleWheel = (e: WheelEvent) => {
    if (!selectedFloor) return;
    e.preventDefault();

    const delta = e.deltaY * -0.01;
    const newZoomLevel = Math.max(1, Math.min(5, zoomLevel + delta)); // Ограничиваем масштаб от 100% до 500%
    setZoomLevel(newZoomLevel);

    // Корректируем позицию при масштабировании, чтобы масштабирование происходило относительно центра
    if (imageContainerRef.current) {
      const containerRect = imageContainerRef.current.getBoundingClientRect();
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;

      // Координаты относительно центра
      const relX = position.x - centerX;
      const relY = position.y - centerY;

      // Новые координаты с учетом изменения масштаба
      const scaleFactor = newZoomLevel / zoomLevel;
      const newX = centerX + relX * scaleFactor;
      const newY = centerY + relY * scaleFactor;

      setPosition({ x: newX, y: newY });
    }
  };

  // Добавляем и удаляем обработчики событий для drag and drop
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
      if (!isDragging || !imageContainerRef.current) return;

      const containerRect = imageContainerRef.current.getBoundingClientRect();
      const newX = e.clientX - startPos.x;
      const newY = e.clientY - startPos.y;

      // Увеличиваем размер границ перемещения с учетом масштаба
      const maxX = (containerRect.width * zoomLevel) / 2;
      const maxY = (containerRect.height * zoomLevel) / 2;

      setPosition({
        x: Math.max(Math.min(newX, maxX), -maxX),
        y: Math.max(Math.min(newY, maxY), -maxY)
      });
    };

    // Обработчик для сенсорных событий вне компонента
    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
      setLastTouchDistance(null);
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("touchend", handleGlobalTouchEnd);
    window.addEventListener("touchcancel", handleGlobalTouchEnd);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("touchend", handleGlobalTouchEnd);
      window.removeEventListener("touchcancel", handleGlobalTouchEnd);
    };
  }, [isDragging, startPos, zoomLevel, lastTouchDistance]);

  const labels = sortedFloors;
  const data = {
    labels,
    datasets: [
      {
        data: sortedFloors.map(floor => floorCounts[floor]),
        backgroundColor: tailwindConfig.theme.colors.emerald[500],
        hoverBackgroundColor: tailwindConfig.theme.colors.emerald[600],
        barThickness: 40,
        borderRadius: 4,
        maxBarThickness: 40
      }
    ]
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 10,
        left: 6,
        right: 6
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: tailwindConfig.theme.colors.slate[800],
        titleColor: tailwindConfig.theme.colors.white,
        bodyColor: tailwindConfig.theme.colors.white,
        padding: 8,
        displayColors: false,
        cornerRadius: 4,
        callbacks: {
          label: function (context) {
            return `Количество юнитов: ${context.raw}`;
          },
          title: function (context) {
            if (context && context[0]) {
              return `Этаж ${context[0].label}`;
            }
            return "";
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: tailwindConfig.theme.colors.slate[600],
          font: {
            size: 14,
            weight: "bold"
          }
        },
        title: {
          display: false
        }
      },
      y: {
        display: false,
        beginAtZero: true,
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          display: false
        }
      }
    },
    elements: {
      bar: {
        borderWidth: 0
      }
    },
    datasets: {
      bar: {
        barPercentage: 0.8,
        categoryPercentage: 0.7
      }
    },
    onClick: (_, elements) => {
      if (elements && elements.length > 0) {
        const clickedElement = elements[0];
        if (clickedElement) {
          const dataIndex = clickedElement.index;
          if (dataIndex !== undefined && labels[dataIndex]) {
            handleFloorClick(labels[dataIndex]);
          }
        }
      }
    }
  };

  // Кнопки управления масштабом
  const handleZoomIn = () => {
    if (!selectedFloor) return;
    const newZoomLevel = Math.min(5, zoomLevel + 0.5);
    setZoomLevel(newZoomLevel);
  };

  const handleZoomOut = () => {
    if (!selectedFloor) return;
    const newZoomLevel = Math.max(1, zoomLevel - 0.5);
    setZoomLevel(newZoomLevel);
  };

  const handleResetZoom = () => {
    if (!selectedFloor) return;
    setZoomLevel(3.0);
    setPosition({ x: 0, y: 0 });
  };

  // Обработчик клика по юниту
  const handleUnitClick = (unit: any) => {
    if (!unit || !unit.unitId) return;

    // Установка выбранного юнита
    const newUnitId = unit.unitId === selectedUnitId ? null : unit.unitId;

    setSelectedUnitId(newUnitId);

    // Если был выбран юнит, прокручиваем к блоку с карточкой
    if (newUnitId) {
      // Даем немного времени для рендеринга блока с карточкой
      setTimeout(() => {
        if (unitCardRef.current) {
          unitCardRef.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
          });
        }
      }, 100);
    }
  };

  // Получение данных юнита по его ID и ID проекта
  const getSelectedUnitData = () => {
    if (!selectedUnitId) return null;

    // Находим projectId из юнитов
    let validProjectId = "";

    for (const layout of layouts) {
      const foundUnit = layout.units.find(unit => unit.id === selectedUnitId);
      if (foundUnit) {
        // Устанавливаем projectId непосредственно из найденного юнита
        if (foundUnit.projectId) {
          validProjectId = foundUnit.projectId;
        }

        return {
          unit: foundUnit,
          layout: {
            image: layout.mainImage || null,
            name: layout.name,
            type: layout.type,
            totalArea: layout.totalArea
          },
          projectId: validProjectId
        };
      }
    }

    return null;
  };

  // Добавляем эффект для выбора 1 этажа по умолчанию
  useEffect(() => {
    if (floorPlans.length > 0 && !selectedFloor) {
      // Ищем 1 этаж
      const firstFloor = floorPlans.find(fp => fp.floorNumber === 1);

      // Если 1 этаж не найден, берем первый доступный этаж
      const defaultFloor = firstFloor || floorPlans[0];

      if (defaultFloor) {
        setSelectedFloor(defaultFloor);
      }
    }
  }, [floorPlans, selectedFloor]);

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col w-full relative", className)}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">
          Распределение юнитов по этажам
        </h3>
      </div>

      <div
        ref={scrollContainerRef}
        className="overflow-x-auto"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none"
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div
          className="min-w-full"
          style={{
            minWidth: Math.max(300, labels.length * 80) + "px",
            height: "100px"
          }}
        >
          {layouts && layouts.length > 0 ? (
            <Bar data={data} options={options} />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              Нет доступных данных для отображения
            </div>
          )}
        </div>
      </div>

      {selectedFloor && (
        <div className="mt-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4">
            <h3 className="text-lg font-semibold">{selectedFloor.name}</h3>

            <p className="text-sm text-slate-500">
              {svgUnits.length} {floorsT("units")}
            </p>
          </div>
          {selectedFloor.imageUrl && (
            <div
              ref={imageContainerRef}
              className="relative overflow-hidden"
              style={{
                width: "91.47vw",
                height: "60.08vw",
                margin: "0 auto",
                cursor: isDragging ? "grabbing" : "grab"
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
                    transformOrigin: "center",
                    transition: isDragging ? "none" : "transform 0.2s"
                  }}
                >
                  <img
                    ref={imageRef}
                    src={compressedImage || selectedFloor.imageUrl}
                    alt={selectedFloor.name}
                    className="w-full h-auto"
                    style={{
                      pointerEvents: "none",
                      objectFit: "cover"
                    }}
                    onLoad={handleImageLoad}
                  />

                  {imageLoaded && svgUnits.length > 0 && (
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
                        zIndex: 10,
                        transform: "translateY(-3%)"
                      }}
                    >
                      <g>
                        {svgUnits.map((unit, index) => {
                          return (
                            <path
                              key={`unit-${index}`}
                              data-index={index}
                              d={unit.svgPath}
                              fill={
                                unit.unitId === selectedUnitId
                                  ? "rgba(0, 200, 83, 0.7)"
                                  : "rgba(0, 200, 83, 0.2)"
                              }
                              stroke={
                                unit.unitId === selectedUnitId
                                  ? "rgba(0, 200, 83, 0.9)"
                                  : "rgba(0, 200, 83, 0.5)"
                              }
                              strokeWidth={
                                unit.unitId === selectedUnitId ? "0.3" : "0.2"
                              }
                              style={{
                                pointerEvents: "all",
                                cursor: "pointer"
                              }}
                              onClick={() => handleUnitClick(unit)}
                            />
                          );
                        })}
                      </g>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedUnitId && (
        <div
          ref={unitCardRef}
          className="w-full p-4 mt-8 shadow-lg bg-white rounded-lg"
        >
          {(() => {
            const selectedUnitData = getSelectedUnitData();
            if (!selectedUnitData) return null;

            return (
              <UnitItem
                unit={selectedUnitData.unit}
                layout={selectedUnitData.layout}
                project={{
                  ...project,
                  id:
                    selectedUnitData.projectId ||
                    selectedUnitData.unit.projectId ||
                    project.id ||
                    ""
                }}
              />
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default AdaptiveUnitsFloorPlan;
