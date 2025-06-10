"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea
} from "@heroui/react";
import { IconMapPin, IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { TbChevronsDownLeft } from "react-icons/tb";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface PointStyle {
  fill: string;
  stroke: string;
  opacity: number;
}

interface Point {
  id?: string;
  x: number;
  y: number;
  type: string;
  style: PointStyle;
  buildingId?: string | undefined;
  building?:
    | {
        id: string;
        name: string;
      }
    | undefined;
}

interface MasterPlanEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  projectId: string;
  mediaId: string;
}

// Дефолтный стиль для точек
const DEFAULT_STYLE: PointStyle = {
  fill: "#3B82F6",
  stroke: "#1D4ED8",
  opacity: 0.8
};

export default function MasterPlanEditor({
  isOpen,
  onClose,
  imageUrl,
  projectId,
  mediaId
}: MasterPlanEditorProps) {
  const t = useTranslations("Projects");
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [buildings, setBuildings] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [buildingFilter, setBuildingFilter] = useState<string | "all">("all");
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Загрузка существующих точек
  useEffect(() => {
    if (isOpen && projectId) {
      loadPoints();
      loadBuildings();
    }
  }, [isOpen, projectId]);

  // Загрузка списка зданий проекта
  const loadBuildings = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/buildings`);
      if (!response.ok) throw new Error(t("errors.buildingsLoadFailed"));

      const data = await response.json();
      setBuildings(data);
    } catch (error) {
      console.error(t("errors.buildingsLoadFailed"), error);
      toast.error(t("errors.buildingsLoadFailed"));
    }
  };

  const loadPoints = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/projects/${projectId}/master-plan-points`
      );
      if (!response.ok) throw new Error(t("errors.masterPlanLoadFailed"));

      const data = await response.json();

      // Убеждаемся, что все точки имеют правильную структуру стиля и другие поля
      const formattedPoints = data.map((point: any) => {
        // Проверяем и форматируем style
        let style = { ...DEFAULT_STYLE };

        if (point.style) {
          try {
            // Если style пришел как строка (JSON), преобразуем его в объект
            const styleObj =
              typeof point.style === "string"
                ? JSON.parse(point.style)
                : point.style;

            style = {
              fill: styleObj.fill || DEFAULT_STYLE.fill,
              stroke: styleObj.stroke || DEFAULT_STYLE.stroke,
              opacity:
                typeof styleObj.opacity === "number"
                  ? styleObj.opacity
                  : DEFAULT_STYLE.opacity
            };
          } catch (e) {
            console.error(t("errors.masterPlanLoadFailed"), e);
          }
        }

        // Возвращаем точку с гарантированно правильными полями
        return {
          id: point.id,
          x: typeof point.x === "number" ? point.x : parseFloat(point.x) || 0,
          y: typeof point.y === "number" ? point.y : parseFloat(point.y) || 0,
          type: point.type || "BUILDING",
          buildingId: point.buildingId || undefined,
          style,
          building: point.building || undefined
        };
      });

      setPoints(formattedPoints);
    } catch (error) {
      console.error(t("errors.masterPlanLoadFailed"), error);
      toast.error(t("errors.masterPlanLoadFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || selectedPoint) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Создаем новую точку со всеми необходимыми полями
    // Добавляем временный id для новых точек
    const newPoint: Point = {
      id: `temp-${Date.now()}`, // Временный id для новых точек
      x: parseFloat(x.toFixed(2)), // Округляем до 2 знаков после запятой
      y: parseFloat(y.toFixed(2)),
      type: "BUILDING", // Значение по умолчанию
      buildingId: undefined, // По умолчанию не привязана к зданию
      style: { ...DEFAULT_STYLE },
      building: undefined
    };

    setPoints([...points, newPoint]);
    setSelectedPoint(newPoint);
  };

  const handlePointClick = (e: React.MouseEvent, point: Point) => {
    e.stopPropagation();
    setSelectedPoint(point);
  };

  const handleUpdatePoint = (updatedPoint: Partial<Point>) => {
    if (!selectedPoint) return;

    // Создаем обновленный объект с правильными типами
    let updatedData: Partial<Point> = { ...updatedPoint };

    // Если обновляем стиль, убеждаемся что все поля присутствуют
    if (updatedPoint.style) {
      const currentStyle = selectedPoint.style;
      updatedData.style = {
        fill: updatedPoint.style.fill || currentStyle.fill,
        stroke: updatedPoint.style.stroke || currentStyle.stroke,
        opacity:
          updatedPoint.style.opacity !== undefined
            ? updatedPoint.style.opacity
            : currentStyle.opacity
      };
    }

    // Обновляем точку в массиве по id, который теперь должен быть у всех точек
    const updatedPoints = points.map(p => {
      return p.id === selectedPoint.id ? { ...p, ...updatedData } : p;
    });

    setPoints(updatedPoints);
    setSelectedPoint({ ...selectedPoint, ...updatedData });
  };

  const handleDeletePoint = () => {
    if (!selectedPoint) return;

    // Удаляем точку из массива по id
    const updatedPoints = points.filter(p => p.id !== selectedPoint.id);

    setPoints(updatedPoints);
    setSelectedPoint(null);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Сохраняем копию текущих точек перед отправкой
      const pointsBeforeSave = [...points];

      // Подготавливаем точки для сохранения
      const pointsToSave = points.map(point => {
        const isTemporaryPoint = point.id?.startsWith("temp-");

        return {
          ...(isTemporaryPoint ? {} : { id: point.id }),
          x: point.x,
          y: point.y,
          type: point.type || "BUILDING",
          buildingId: point.buildingId || null, // Если buildingId не указан, передаем null
          style: point.style || { ...DEFAULT_STYLE },
          projectId
        };
      });

      const response = await fetch(
        `/api/projects/${projectId}/master-plan-points`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(pointsToSave)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || t("errors.masterPlanUpdateFailed"));
      }

      await loadPoints(); // Перезагружаем точки после сохранения

      toast.success(t("messages.success.masterPlanUpdateSuccess"));
      onClose();
    } catch (error) {
      console.error(t("errors.masterPlanUpdateFailed"), error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("errors.masterPlanUpdateFailed")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Фильтрация точек по выбранному зданию
  const filteredPoints =
    buildingFilter === "all"
      ? points
      : points.filter(point => point.buildingId === buildingFilter);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-lg font-medium">{t("masterPlanEditor.title")}</h3>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4 h-[600px]">
            {/* Фильтр по зданиям */}
            {buildings.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">
                  {t("masterPlanEditor.filterByBuilding") ||
                    "Фильтр по зданиям:"}
                </label>
                <select
                  className="rounded-md border-default-200 text-sm p-1 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={buildingFilter}
                  onChange={e => setBuildingFilter(e.target.value)}
                >
                  <option value="all">
                    {t("masterPlanEditor.allBuildings") || "Все здания"}
                  </option>
                  {buildings.map(building => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-4 flex-1">
              <div
                ref={canvasRef}
                className="relative flex-1 overflow-hidden rounded-lg border border-default-200 cursor-crosshair"
                onClick={handleCanvasClick}
              >
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Мастер-план"
                  className="absolute inset-0 w-full h-full object-contain"
                />

                {/* Отображение точек */}
                {filteredPoints.map((point, index) => (
                  <div
                    key={index}
                    className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group ${
                      selectedPoint === point ? "z-20" : "z-10"
                    }`}
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`
                    }}
                    onClick={e => handlePointClick(e, point)}
                  >
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-full 
                        transition-transform ${selectedPoint === point ? "scale-125" : "scale-100"}
                        group-hover:scale-125 ${point.buildingId ? "ring-2 ring-white ring-opacity-70" : ""}`}
                      style={{
                        background: point.style.fill,
                        border: `2px solid ${point.style.stroke}`,
                        opacity: point.style.opacity
                      }}
                    >
                      <IconMapPin size={14} className="text-white" />
                    </div>

                    {/* Название точки */}
                    {point.title && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-black/75 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                        {point.title}
                        {point.building && (
                          <span className="ml-1 text-primary-300">
                            ({point.building.name})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Панель редактирования выбранной точки */}
              <div className="w-80 border border-default-200 rounded-lg p-4 overflow-y-auto">
                {selectedPoint ? (
                  <div className="space-y-4">
                    <h4 className="font-medium">
                      {t("masterPlanEditor.parameters")}
                    </h4>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        {t("masterPlanEditor.form.point.type.label")}
                      </label>
                      <select
                        className="w-full rounded-md border-default-200 text-sm p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={selectedPoint.type}
                        onChange={e =>
                          handleUpdatePoint({ type: e.target.value })
                        }
                      >
                        <option value="BUILDING">
                          {t(
                            "masterPlanEditor.form.point.type.options.BUILDING"
                          )}
                        </option>
                        <option value="AMENITY">
                          {t(
                            "masterPlanEditor.form.point.type.options.AMENITY"
                          )}
                        </option>
                        <option value="LANDMARK">
                          {t(
                            "masterPlanEditor.form.point.type.options.LANDMARK"
                          )}
                        </option>
                        <option value="OTHER">
                          {t("masterPlanEditor.form.point.type.options.OTHER")}
                        </option>
                      </select>
                    </div>

                    {/* Селектор для привязки к зданию */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        {t("masterPlanEditor.form.point.building.label") ||
                          "Связанное здание"}
                      </label>
                      <select
                        className="w-full rounded-md border-default-200 text-sm p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={selectedPoint.buildingId || ""}
                        onChange={e =>
                          handleUpdatePoint({
                            buildingId:
                              e.target.value === "" ? undefined : e.target.value
                          })
                        }
                      >
                        <option value="">
                          {t("masterPlanEditor.form.point.building.none") ||
                            "Не выбрано"}
                        </option>
                        {buildings.map(building => (
                          <option key={building.id} value={building.id}>
                            {building.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-default-400 mt-1">
                        {t(
                          "masterPlanEditor.form.point.building.description"
                        ) || "Выберите здание, к которому относится эта точка"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        {t("masterPlanEditor.form.point.coordinates.label")}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Input
                            label={t(
                              "masterPlanEditor.form.point.coordinates.x"
                            )}
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={selectedPoint.x.toString()}
                            onChange={e => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value) && value >= 0 && value <= 100) {
                                handleUpdatePoint({ x: value });
                              }
                            }}
                            startContent={
                              <span className="text-default-400">%</span>
                            }
                          />
                        </div>
                        <div>
                          <Input
                            label={t(
                              "masterPlanEditor.form.point.coordinates.y"
                            )}
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={selectedPoint.y.toString()}
                            onChange={e => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value) && value >= 0 && value <= 100) {
                                handleUpdatePoint({ y: value });
                              }
                            }}
                            startContent={
                              <span className="text-default-400">%</span>
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="block text-sm font-medium mb-1.5">
                        {t("masterPlanEditor.form.point.style.label")}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs mb-1">
                            {t("masterPlanEditor.form.point.style.fill")}
                          </label>
                          <input
                            type="color"
                            className="w-full h-8 rounded-md cursor-pointer"
                            value={selectedPoint.style.fill}
                            onChange={e =>
                              handleUpdatePoint({
                                style: {
                                  ...selectedPoint.style,
                                  fill: e.target.value
                                }
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">
                            {t("masterPlanEditor.form.point.style.borderColor")}
                          </label>
                          <input
                            type="color"
                            className="w-full h-8 rounded-md cursor-pointer"
                            value={selectedPoint.style.stroke}
                            onChange={e =>
                              handleUpdatePoint({
                                style: {
                                  ...selectedPoint.style,
                                  stroke: e.target.value
                                }
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">
                            {t("masterPlanEditor.form.point.style.opacity")}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            className="w-full h-8 cursor-pointer"
                            value={selectedPoint.style.opacity}
                            onChange={e =>
                              handleUpdatePoint({
                                style: {
                                  ...selectedPoint.style,
                                  opacity: parseFloat(e.target.value)
                                }
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-default-200 pt-4 mt-4 flex gap-2">
                      <Button
                        color="danger"
                        variant="light"
                        onClick={handleDeletePoint}
                        startContent={<IconTrash size={16} />}
                        fullWidth
                      >
                        {t("masterPlanEditor.form.point.delete.label")}
                      </Button>

                      <Button
                        color="primary"
                        variant="light"
                        onClick={() => setSelectedPoint(null)}
                        fullWidth
                      >
                        {t("masterPlanEditor.form.point.done.label")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <IconPlus size={24} className="text-default-400" />
                    <p className="text-sm text-default-500 mt-2 text-center">
                      {t("masterPlanEditor.clickToAdd")}
                    </p>
                    {points.length > 0 && (
                      <p className="text-xs text-default-400 mt-1 text-center">
                        {t("masterPlanEditor.orSelectExisting")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onClick={onClose}>
            {t("masterPlanEditor.cancel")}
          </Button>
          <Button color="primary" onClick={handleSave} isLoading={isLoading}>
            {t("masterPlanEditor.save")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
