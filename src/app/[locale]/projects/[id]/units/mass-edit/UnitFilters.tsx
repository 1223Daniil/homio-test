"use client";

import { Input, Select, SelectItem } from "@heroui/react";
import {
  applyFilters,
  selectBuildings,
  selectFilteredUnits,
  selectLayouts,
  selectUnits
} from "@/store/slices/unitsSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { useCallback, useEffect, useMemo, useState } from "react";

import { IconSearch } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface UnitFiltersProps {
  projectId: string;
}

export default function UnitFilters({ projectId }: UnitFiltersProps) {
  const t = useTranslations("Units");
  const dispatch = useAppDispatch();

  const units = useAppSelector(selectUnits);
  const buildings = useAppSelector(selectBuildings);
  const layouts = useAppSelector(selectLayouts);
  const filteredUnits = useAppSelector(selectFilteredUnits);

  // Состояния для фильтров
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [buildingFilter, setBuildingFilter] = useState<string>("all");
  const [floorFilter, setFloorFilter] = useState<string>("all");
  const [layoutFilter, setLayoutFilter] = useState<string>("all");

  // Используем useRef для хранения таймера дебаунса
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Получаем уникальные этажи для фильтра
  const uniqueFloors = useMemo(() => {
    return Array.from(new Set(units.map(unit => unit.floor))).sort(
      (a, b) => a - b
    );
  }, [units]);

  // Обработчик изменения поискового запроса
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);

      // Очищаем предыдущий таймер дебаунса
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      // Устанавливаем новый таймер
      const timeout = setTimeout(() => {
        dispatch(
          applyFilters({
            searchQuery: value,
            statusFilter,
            buildingFilter,
            floorFilter,
            layoutFilter
          })
        );
      }, 300);

      setDebounceTimeout(timeout);
    },
    [
      dispatch,
      statusFilter,
      buildingFilter,
      floorFilter,
      layoutFilter,
      debounceTimeout
    ]
  );

  // Обработчик изменения фильтра статуса
  const handleStatusChange = useCallback(
    (value: string) => {
      setStatusFilter(value);
      dispatch(
        applyFilters({
          searchQuery,
          statusFilter: value,
          buildingFilter,
          floorFilter,
          layoutFilter
        })
      );
    },
    [dispatch, searchQuery, buildingFilter, floorFilter, layoutFilter]
  );

  // Обработчик изменения фильтра здания
  const handleBuildingChange = useCallback(
    (value: string) => {
      setBuildingFilter(value);
      dispatch(
        applyFilters({
          searchQuery,
          statusFilter,
          buildingFilter: value,
          floorFilter,
          layoutFilter
        })
      );
    },
    [dispatch, searchQuery, statusFilter, floorFilter, layoutFilter]
  );

  // Обработчик изменения фильтра этажа
  const handleFloorChange = useCallback(
    (value: string) => {
      setFloorFilter(value);
      dispatch(
        applyFilters({
          searchQuery,
          statusFilter,
          buildingFilter,
          floorFilter: value,
          layoutFilter
        })
      );
    },
    [dispatch, searchQuery, statusFilter, buildingFilter, layoutFilter]
  );

  // Обработчик изменения фильтра планировки
  const handleLayoutChange = useCallback(
    (value: string) => {
      setLayoutFilter(value);
      dispatch(
        applyFilters({
          searchQuery,
          statusFilter,
          buildingFilter,
          floorFilter,
          layoutFilter: value
        })
      );
    },
    [dispatch, searchQuery, statusFilter, buildingFilter, floorFilter]
  );

  // Применяем фильтры при монтировании компонента
  useEffect(() => {
    dispatch(
      applyFilters({
        searchQuery,
        statusFilter,
        buildingFilter,
        floorFilter,
        layoutFilter
      })
    );

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [dispatch, projectId]);

  // Мемоизируем массивы для селектов
  const statusItems = useMemo(
    () => [
      { key: "all", value: "all", label: t("status.allStatuses") },
      { key: "AVAILABLE", value: "AVAILABLE", label: t("status.available") },
      { key: "RESERVED", value: "RESERVED", label: t("status.reserved") },
      { key: "SOLD", value: "SOLD", label: t("status.sold") }
    ],
    [t]
  );

  const buildingItems = useMemo(
    () => [
      {
        key: "all",
        value: "all",
        label: t("filters.form.filters.allBuildings")
      },
      ...buildings.map(building => ({
        key: building.id,
        value: building.id,
        label: building.name
      }))
    ],
    [buildings, t]
  );

  const floorItems = useMemo(
    () => [
      { key: "all", value: "all", label: t("filters.form.filters.allFloors") },
      ...uniqueFloors.map(floor => ({
        key: floor.toString(),
        value: floor.toString(),
        label: floor.toString()
      }))
    ],
    [uniqueFloors, t]
  );

  const layoutItems = useMemo(
    () => [
      { key: "all", value: "all", label: t("filters.form.filters.allLayouts") },
      ...layouts.map(layout => ({
        key: layout.id,
        value: layout.id,
        label: layout.name
      }))
    ],
    [layouts, t]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder={t("filters.form.search")}
          value={searchQuery}
          onChange={e => handleSearchChange(e.target.value)}
          startContent={<IconSearch size={18} />}
          className="md:w-1/3"
        />

        <div className="flex flex-wrap gap-2">
          <Select
            label={t("status.title")}
            selectedKeys={[statusFilter]}
            onChange={e => handleStatusChange(e.target.value)}
            className="w-40"
          >
            {statusItems.map(item => (
              <SelectItem key={item.key} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label={t("filters.form.selectBuilding")}
            selectedKeys={[buildingFilter]}
            onChange={e => handleBuildingChange(e.target.value)}
            className="w-40"
          >
            {buildingItems.map(item => (
              <SelectItem key={item.key} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label={t("filters.form.selectFloor")}
            selectedKeys={[floorFilter]}
            onChange={e => handleFloorChange(e.target.value)}
            className="w-40"
          >
            {floorItems.map(item => (
              <SelectItem key={item.key} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label={t("filters.form.selectLayout")}
            selectedKeys={[layoutFilter]}
            onChange={e => handleLayoutChange(e.target.value)}
            className="w-40"
          >
            {layoutItems.map(item => (
              <SelectItem key={item.key} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Информация о количестве юнитов */}
      <div className="text-sm text-default-500">
        {filteredUnits.length > 0 && (
          <p>
            {t("filters.form.filters.showing", {
              count: Math.min(filteredUnits.length, 100)
            })}
          </p>
        )}
        {filteredUnits.length > 100 && (
          <p>{t("filters.form.filters.tooMany")}</p>
        )}
      </div>
    </div>
  );
}
