import { Link, useRouter } from "@/config/i18n";
import { useMemo, useState } from "react";

import ProjectFloorsList from "../ProjectFloorsList";
import { UnitStatus } from "@prisma/client";
import { formatNumberType } from "@/utils/formatPrice";
import styles from "./ProjectUnitsGrid.module.css";
import { useLayouts } from "@/hooks/useLayouts";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

interface ProjectUnitsGridProps {
  buildingData?: any;
  isPublic?: boolean;
}

const ProjectUnitsGrid = ({
  buildingData,
  isPublic = false
}: ProjectUnitsGridProps) => {
  const [activeFloor, setActiveFloor] = useState<number | null>(null);

  const { selectedLayouts } = useLayouts();

  const t = useTranslations("ProjectDetails.tabs.masterPlan.projectUnitsGrid");

  console.log("isPublic", isPublic);

  // Улучшаем логирование для отладки
  console.log("ProjectUnitsGrid - selectedLayouts:", selectedLayouts);
  console.log(
    "ProjectUnitsGrid - selectedLayouts с units:",
    selectedLayouts.filter(layout => layout.units && layout.units.length > 0)
  );
  console.log("ProjectUnitsGrid - buildingData:", buildingData);

  // Получаем валюту из проекта или используем дефолтное значение
  const projectCurrency = buildingData?.project?.currency || "USD";

  const floors: number[] = useMemo(() => {
    return Array.from(
      new Set( // Используем Set для получения уникальных этажей
        selectedLayouts
          .filter(
            layout =>
              layout.units &&
              Array.isArray(layout.units) &&
              layout.units.length > 0
          )
          .flatMap(layout =>
            layout
              .units!.map(unit => unit.floor)
              .filter((floor): floor is number => floor !== null)
          )
      )
    ).sort((a, b) => a - b); // Сортируем этажи по возрастанию для удобства отображения
  }, [selectedLayouts]);

  // Логируем найденные этажи
  console.log("ProjectUnitsGrid - floors:", floors);

  // Количество юнитов на каждом этаже
  const unitsPerFloor = useMemo(() => {
    const countMap: Record<number, number> = {};

    // Инициализируем счетчик для каждого этажа
    floors.forEach(floor => {
      countMap[floor] = 0;
    });

    // Подсчитываем юниты для каждого этажа только если у планировки есть юниты
    selectedLayouts
      .filter(
        layout =>
          layout.units && Array.isArray(layout.units) && layout.units.length > 0
      )
      .forEach(layout => {
        layout.units!.forEach(unit => {
          if (unit.floor !== null && unit.floor !== undefined) {
            countMap[unit.floor] = (countMap[unit.floor] || 0) + 1;
          }
        });
      });

    return countMap;
  }, [selectedLayouts, floors]);

  // Если нет этажей, показываем сообщение
  if (floors.length === 0) {
    return (
      <div className={styles.noFloors}>
        <p>{t("noFloors")}</p>
      </div>
    );
  }

  return (
    <div className={styles.unitsGrid}>
      <ProjectFloorsList
        floors={floors}
        setActiveFloor={setActiveFloor}
        unitsPerFloor={unitsPerFloor}
        maxFloor={Math.max(...floors, 0)}
        activeFloor={activeFloor}
      />

      <div className={styles.units}>
        {floors.map(floor => {
          // Получаем все юниты для текущего этажа и убираем дубликаты по id
          // Используем Map для дедупликации юнитов с одинаковым id
          const unitsMap = new Map();

          selectedLayouts
            .filter(
              layout =>
                layout.units &&
                Array.isArray(layout.units) &&
                layout.units.length > 0
            )
            .forEach(layout => {
              layout
                .units!.filter(unit => unit.floor === floor)
                .forEach(unit => {
                  // Если такого id еще нет в карте или юнит имеет более полные данные, добавляем его
                  if (
                    !unitsMap.has(unit.id) ||
                    (!unitsMap.get(unit.id).price && unit.price)
                  ) {
                    unitsMap.set(unit.id, {
                      ...unit,
                      layoutId: layout.id,
                      layoutName: layout.name,
                      layoutType: layout.type,
                      layoutArea: layout.totalArea
                    });
                  }
                });
            });

          // Преобразуем Map обратно в массив
          const unitsOnFloor = Array.from(unitsMap.values());

          console.log(
            `Юниты на этаже ${floor} (уникальные):`,
            unitsOnFloor.length
          );

          return (
            <div
              key={`floor-${floor}`}
              className={`${styles.unitsRow} ${activeFloor === floor ? styles.unitsRowActive : ""}`}
            >
              {unitsOnFloor.map(unit => {
                // Создаем объект unitDto для компонента Unit
                const unitDto: unitDto = {
                  unit: {
                    id: unit.id, // Передаем id юнита
                    number: unit.number || t("list.noUnits"),
                    slug: unit.slug || "",
                    price: unit.price || 0,
                    status: (unit.status as UnitStatus) || "AVAILABLE",
                    currency: projectCurrency
                  },
                  layout: {
                    name: unit.layoutName || "",
                    type: unit.layoutType || "",
                    area: unit.layoutArea || 0
                  }
                };

                return (
                  <Unit
                    key={unit.id || `unit-${floor}-${unit.number}`}
                    unitDto={unitDto}
                    projectId={buildingData?.project?.id} // Передаем projectId в компонент Unit
                    isPublic={isPublic}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectUnitsGrid;

interface unitDto {
  unit: {
    id?: string; // Добавляем ID юнита в интерфейс
    slug?: string;
    number: string;
    price: number | string;
    status?: UnitStatus | string;
    currency?: string;
  };
  layout: {
    name?: string;
    type?: string;
    area?: number;
  };
}

export function Unit({
  unitDto,
  projectId,
  isPublic = false
}: {
  unitDto: unitDto;
  projectId?: string;
  isPublic?: boolean;
}) {
  const t = useTranslations("ProjectDetails.tabs.masterPlan.projectUnitsGrid");
  const currenciesT = useTranslations("projects.currency.symbols");
  const amountT = useTranslations("Amounts");

  const params = useParams();

  const router = useRouter();

  if (!unitDto || !unitDto.unit) {
    return null;
  }

  const formatPrice = (price: number | string) => {
    if (typeof price === "number") {
      return price.toLocaleString("ru-RU");
    }
    return price;
  };

  // Определяем цвет для статуса юнита
  const getStatusColor = () => {
    if (!unitDto?.unit?.status) return "";

    switch (unitDto.unit.status) {
      case "AVAILABLE":
        return styles.statusAvailable;
      case "RESERVED":
        return styles.statusReserved;
      case "SOLD":
        return styles.statusSold;
      default:
        return styles.statusUnavailable;
    }
  };

  console.log("unitDto", unitDto, unitDto.unit.price == 0);

  // Преобразуем price в number для formatNumberType
  const priceAsNumber =
    typeof unitDto.unit.price === "string"
      ? parseFloat(unitDto.unit.price)
      : unitDto.unit.price;

  // Проверяем, является ли priceAsNumber числом и не NaN
  const isValidNumber = !isNaN(priceAsNumber) && isFinite(priceAsNumber);

  // Получаем результат форматирования числа
  const formattedNumber = isValidNumber
    ? formatNumberType(priceAsNumber)
    : null;

  // Безопасное получение значений для переводов
  const getCurrencySymbol = () => {
    if (!unitDto.unit.currency) return "";

    // Проверяем, что валюта входит в допустимые значения
    const validCurrencies = [
      "THB",
      "IDR",
      "AED",
      "VND",
      "MYR",
      "SGD",
      "USD",
      "EUR"
    ];
    const currency = validCurrencies.includes(String(unitDto.unit.currency))
      ? String(unitDto.unit.currency)
      : "USD";

    return currenciesT(currency as any) || unitDto.unit.currency;
  };

  // Безопасное получение статуса
  const getUnitStatus = () => {
    if (!unitDto.unit.status) return "";

    const status = String(unitDto.unit.status).toUpperCase();
    const validStatuses = ["AVAILABLE", "RESERVED", "SOLD", "UNAVAILABLE"];

    if (validStatuses.includes(status)) {
      return t(`statuses.${status}` as any);
    }

    return "";
  };

  // Безопасное получение типа суммы
  const getAmountType = () => {
    if (!formattedNumber || !formattedNumber.type) return "";

    const type = String(formattedNumber.type);
    const validTypes = ["thousand", "million"];

    if (validTypes.includes(type)) {
      return amountT(type as any) || "";
    }

    return "";
  };

  // Функция для перехода на страницу юнита
  const navigateToUnitPage = () => {
    if (projectId && unitDto.unit.id) {
      router.push(
        isPublic
          ? `/p/${params.slug}/units/${unitDto.unit.slug}`
          : `/projects/${projectId}/units/${unitDto.unit.id}`
      );
    }
  };

  return (
    <div
      className={`${styles.unit} ${getStatusColor()}`}
      onClick={navigateToUnitPage}
    >
      <div className={`${styles.unitHeader}`}>
        <div className={styles.unitNumber}>
          {unitDto.unit.number.length > 10
            ? unitDto.unit.number.slice(0, 7) + "..."
            : unitDto.unit.number}
        </div>

        {unitDto.layout?.name && (
          <p className={styles.layoutName}>
            {unitDto.layout.name.length > 8
              ? unitDto.layout.name.slice(0, 8) + "..."
              : unitDto.layout.name}
          </p>
        )}
      </div>

      <p className={styles.unitPrice}>
        {priceAsNumber === 0 && getUnitStatus()}{" "}
        {priceAsNumber > 0 &&
          isValidNumber &&
          formattedNumber &&
          (getCurrencySymbol() +
            " " +
            formattedNumber.number +
            " " +
            getAmountType() ||
            "")}
      </p>

      <div className={`${styles.unitType}`}>
        {(unitDto.layout?.type || unitDto.layout?.area) && (
          <span className={styles.unitTypeText}>
            {unitDto.layout?.area && `${unitDto.layout.area} ${t("unit.sqm")}`}
          </span>
        )}

        {/* <IoGridOutline /> */}
      </div>
    </div>
  );
}
