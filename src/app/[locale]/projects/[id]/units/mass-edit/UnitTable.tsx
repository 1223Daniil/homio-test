"use client";

import {
  Button,
  Checkbox,
  Chip,
  Table,
  TableColumn,
  TableHeader
} from "@heroui/react";
import {
  deselectAllUnits,
  selectAllUnits,
  selectBuildings,
  selectFilteredUnits,
  selectIsLoading,
  selectLayouts,
  selectSelectedUnits,
  toggleSelectUnit
} from "@/store/slices/unitsSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { useCallback, useMemo } from "react";

import { IconEdit } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

// Динамический импорт FixedSizeList для решения проблемы с SSR
const FixedSizeList = dynamic(
  () => import("react-window").then(mod => mod.FixedSizeList as any),
  { ssr: false }
);

interface UnitTableProps {
  editMode: boolean;
  projectId: string;
  locale: string;
}

export default function UnitTable({
  editMode,
  projectId,
  locale
}: UnitTableProps) {
  const t = useTranslations("Units");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const filteredUnits = useAppSelector(selectFilteredUnits);
  const selectedUnits = useAppSelector(selectSelectedUnits);
  const buildings = useAppSelector(selectBuildings);
  const layouts = useAppSelector(selectLayouts);
  const isLoading = useAppSelector(selectIsLoading);

  // Показываем только первые 100 юнитов для оптимизации
  const visibleUnits = useMemo(() => {
    return filteredUnits.slice(0, 100);
  }, [filteredUnits]);

  // Проверяем, все ли юниты выбраны
  const allSelected = useMemo(() => {
    return (
      filteredUnits.length > 0 && selectedUnits.size === filteredUnits.length
    );
  }, [filteredUnits.length, selectedUnits.size]);

  // Форматирование цены
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(price);
  }, []);

  // Получение цвета для статуса
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "success";
      case "RESERVED":
        return "warning";
      case "SOLD":
        return "danger";
      default:
        return "default";
    }
  }, []);

  // Получение названия статуса
  const getStatusName = useCallback(
    (status: string) => {
      switch (status) {
        case "AVAILABLE":
          return t("status.available");
        case "RESERVED":
          return t("status.reserved");
        case "SOLD":
          return t("status.sold");
        default:
          return status;
      }
    },
    [t]
  );

  // Получение названия здания
  const getBuildingName = useCallback(
    (buildingId: string) => {
      const building = buildings.find(b => b.id === buildingId);
      return building ? building.name : buildingId.substring(0, 8);
    },
    [buildings]
  );

  // Получение названия планировки
  const getLayoutName = useCallback(
    (layoutId: string | null) => {
      if (!layoutId) return t("noLayout");
      const layout = layouts.find(l => l.id === layoutId);
      return layout ? layout.name : layoutId.substring(0, 8);
    },
    [layouts, t]
  );

  // Обработчик выбора юнита
  const handleSelectUnit = useCallback(
    (unitId: string, isSelected: boolean) => {
      dispatch(toggleSelectUnit(unitId));
    },
    [dispatch]
  );

  // Обработчик выбора всех юнитов
  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      dispatch(deselectAllUnits());
    } else {
      dispatch(selectAllUnits());
    }
  }, [dispatch, allSelected]);

  // Обработчик перехода к редактированию юнита
  const handleEditUnit = useCallback(
    (unitId: string) => {
      router.push(`/${locale}/projects/${projectId}/units/${unitId}`);
    },
    [router, projectId, locale]
  );

  // Компонент строки для виртуализированного списка
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const unit = visibleUnits[index];
      if (!unit) return null;

      return (
        <div
          style={style}
          className={`flex items-center border-b border-default-200 ${index % 2 === 0 ? "bg-default-50" : ""}`}
        >
          <div className="flex-shrink-0 w-10 pl-2">
            {editMode ? (
              <Checkbox
                isSelected={selectedUnits.has(unit.id)}
                onChange={() =>
                  handleSelectUnit(unit.id, !selectedUnits.has(unit.id))
                }
                aria-label={`Выбрать юнит ${unit.number || unit.id}`}
              />
            ) : (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onClick={() => handleEditUnit(unit.id)}
                aria-label={`Редактировать юнит ${unit.number || unit.id}`}
              >
                <IconEdit size={18} />
              </Button>
            )}
          </div>
          <div className="flex-1 min-w-[120px] p-2 truncate">
            {unit.name || "-"}
          </div>
          <div className="flex-1 min-w-[100px] p-2 truncate">
            {unit.number || "-"}
          </div>
          <div className="flex-1 min-w-[120px] p-2 truncate">
            {getBuildingName(unit.buildingId)}
          </div>
          <div className="flex-1 min-w-[80px] p-2">{unit.floor}</div>
          <div className="flex-1 min-w-[100px] p-2">
            {unit.area ? `${unit.area} м²` : "-"}
          </div>
          <div className="flex-1 min-w-[80px] p-2">{unit.bedrooms}</div>
          <div className="flex-1 min-w-[80px] p-2">{unit.bathrooms}</div>
          <div className="flex-1 min-w-[120px] p-2">
            {formatPrice(unit.price)}
          </div>
          <div className="flex-1 min-w-[120px] p-2">
            <Chip color={getStatusColor(unit.status) as any} size="sm">
              {getStatusName(unit.status)}
            </Chip>
          </div>
          <div className="flex-1 min-w-[120px] p-2 truncate">
            {getLayoutName(unit.layoutId)}
          </div>
        </div>
      );
    },
    [
      visibleUnits,
      editMode,
      selectedUnits,
      getBuildingName,
      getLayoutName,
      formatPrice,
      getStatusColor,
      getStatusName,
      handleSelectUnit,
      handleEditUnit
    ]
  );

  if (isLoading) {
    return null;
  }

  if (filteredUnits.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-default-500">{t("noUnits")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Заголовок таблицы */}
      <div className="flex items-center border-b border-default-200 bg-default-100 font-semibold">
        <div className="flex-shrink-0 w-10 pl-2">
          {editMode && (
            <Checkbox
              isSelected={allSelected}
              onChange={handleSelectAll}
              aria-label="Выбрать все юниты"
            />
          )}
        </div>
        <div className="flex-1 min-w-[120px] p-2">{t("filters.form.name")}</div>
        <div className="flex-1 min-w-[100px] p-2">
          {t("filters.form.number")}
        </div>
        <div className="flex-1 min-w-[120px] p-2">
          {t("filters.form.building")}
        </div>
        <div className="flex-1 min-w-[80px] p-2">{t("filters.form.floor")}</div>
        <div className="flex-1 min-w-[100px] p-2">
          {t("filters.form.area.label")}
        </div>
        <div className="flex-1 min-w-[80px] p-2">
          {t("filters.form.bedrooms.label")}
        </div>
        <div className="flex-1 min-w-[80px] p-2">
          {t("filters.form.bathrooms.label")}
        </div>
        <div className="flex-1 min-w-[120px] p-2">
          {t("filters.form.price.label")}
        </div>
        <div className="flex-1 min-w-[120px] p-2">
          {t("filters.form.status.label")}
        </div>
        <div className="flex-1 min-w-[120px] p-2">
          {t("filters.form.layout")}
        </div>
      </div>

      {/* Виртуализированный список юнитов */}
      <div className="flex-1">
        <FixedSizeList
          className="!h-[35vw]"
          height={500}
          width="100%"
          itemCount={visibleUnits.length}
          itemSize={48}
          overscanCount={5}
        >
          {Row as any}
        </FixedSizeList>
      </div>

      {/* Информация о выбранных юнитах и кнопки выбора */}
      {editMode && (
        <div className="flex justify-between items-center mt-4 p-2 bg-default-50 rounded">
          <div>
            <span className="font-semibold">
              {t("filters.form.massEdit.selectedUnits")}:
            </span>{" "}
            {selectedUnits.size} / {filteredUnits.length}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="flat"
              onClick={() => dispatch(deselectAllUnits())}
              isDisabled={selectedUnits.size === 0}
            >
              {t("filters.form.massEdit.deselectAll")}
            </Button>
            <Button
              size="sm"
              variant="flat"
              onClick={() => dispatch(selectAllUnits())}
              isDisabled={filteredUnits.length === 0 || allSelected}
            >
              {t("filters.form.massEdit.selectAll")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
