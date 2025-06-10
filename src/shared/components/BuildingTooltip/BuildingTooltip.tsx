import { formatNumberType, formatPrice } from "@/utils/formatPrice";

import { IoIosArrowForward } from "react-icons/io";
import styles from "./BuildingTooltip.module.css";
import { useLayouts } from "@/hooks/useLayouts";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

interface IProps {
  building: any;
  buildingData?: any;
}

const BuildingTooltip = ({ building, buildingData }: IProps) => {
  const { addLayout, clearLayouts } = useLayouts();

  const t = useTranslations("ProjectDetails.tabs.masterPlan.buildingTooltip");
  const currencyT = useTranslations("projects.currency.symbols");
  const amountT = useTranslations("Amounts");

  // Получаем валюту проекта из buildingData или используем дефолтное значение
  const projectCurrency = useMemo(() => {
    return buildingData?.project?.currency || "USD";
  }, [buildingData]);

  // Проверка существования здания
  if (!building) {
    return (
      <div className={`${styles.tooltip}`}>
        <div className={`${styles.header}`}>
          <h4>{t("notSpecified")}</h4>
        </div>
      </div>
    );
  }

  // Расчёт общего количества юнитов в здании
  const totalUnits = useMemo(() => {
    // Если у здания есть свойство _count и в нём есть units, используем его
    if (building._count?.units) {
      return building._count.units;
    }

    // Если у здания есть массив units, используем его длину
    if (Array.isArray(building.units)) {
      return building.units.length;
    }

    // Суммируем количество юнитов из всех планировок
    let count = 0;
    if (Array.isArray(building.layouts)) {
      building.layouts.forEach((layout: any) => {
        if (layout.unitsCount) {
          count += layout.unitsCount;
        }
      });
    }

    return count;
  }, [building]);

  // Определение общего количества этажей
  const totalFloors = useMemo(() => {
    // Если у здания есть floors, используем его
    if (typeof building.floors === "number") {
      return building.floors;
    }

    // Если у здания есть floorPlans, находим максимальный номер этажа
    if (Array.isArray(building.floorPlans) && building.floorPlans.length > 0) {
      return Math.max(
        ...building.floorPlans.map((plan: any) => plan.floorNumber)
      );
    }

    // Если у здания есть units с номерами этажей, находим максимальный
    if (Array.isArray(building.units) && building.units.length > 0) {
      const floors = building.units
        .map((unit: any) => unit.floor)
        .filter((floor: any) => floor !== null && floor !== undefined);

      if (floors.length > 0) {
        return Math.max(...floors);
      }
    }

    return 0;
  }, [building]);

  // Получаем layouts из units здания
  const layouts = useMemo(() => {
    // Проверяем, есть ли у здания юниты
    if (!Array.isArray(building.units) || building.units.length === 0) {
      return [];
    }

    // Создаем карту для группировки юнитов по layoutId
    const layoutMap = new Map();

    // Группируем юниты по layoutId
    building.units.forEach((unit: any) => {
      if (unit.layout) {
        const layoutId = unit.layout.id;

        if (!layoutMap.has(layoutId)) {
          // Добавляем все необходимые поля для корректной работы
          layoutMap.set(layoutId, {
            ...unit.layout,
            unitsCount: 1,
            minPrice: unit.price,
            maxPrice: unit.price,
            units: [unit], // Добавляем массив units с первым юнитом
            currency: projectCurrency,
            bedrooms: unit.layout.bedrooms || 0,
            bathrooms: unit.layout.bathrooms || 0,
            totalArea: unit.layout.totalArea || 0,
            mainImage: unit.layout.mainImage || unit.layout.imageUrl || ""
          });
        } else {
          const layoutData = layoutMap.get(layoutId);
          layoutData.unitsCount += 1;

          // Добавляем юнит в массив units
          layoutData.units.push(unit);

          // Обновляем минимальную цену, если текущая цена меньше
          if (
            unit.price &&
            (!layoutData.minPrice || unit.price < layoutData.minPrice)
          ) {
            layoutData.minPrice = unit.price;
          }

          // Обновляем максимальную цену, если текущая цена больше
          if (
            unit.price &&
            (!layoutData.maxPrice || unit.price > layoutData.maxPrice)
          ) {
            layoutData.maxPrice = unit.price;
          }
        }
      }
    });

    // Преобразуем карту в массив
    return Array.from(layoutMap.values());
  }, [building, projectCurrency]);

  const handleClickLayout = (layout: any) => {
    clearLayouts();

    // Добавляем логирование структуры layout перед добавлением в стор
    console.log("Adding layout to store:", layout);

    addLayout(layout);

    // Прокрутка к элементу с id="availability" после небольшой задержки
    setTimeout(() => {
      const availabilityElement = document.getElementById("availability");
      if (availabilityElement) {
        availabilityElement.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }, 100);
  };

  // Проверяем наличие layouts
  const hasLayouts = layouts.length > 0;

  const currency = building.project?.currency;

  console.log(currency);

  return (
    <div className={`${styles.tooltip}`}>
      <div className={`${styles.header}`}>
        <h4>{building.name || t("notSpecified")}</h4>

        <div className={`${styles.facts}`}>
          <div className={`${styles.fact}`}>
            <p className={`${styles.factLabel}`}>{t("floors")}</p>
            <p className={`${styles.factValue}`}>{totalFloors}</p>
          </div>

          <div className={`${styles.fact}`}>
            <p className={`${styles.factLabel}`}>{t("units")}</p>
            <p className={`${styles.factValue}`}>{totalUnits}</p>
          </div>

          <div className={`${styles.fact}`}>
            <p className={`${styles.factLabel}`}>{t("layouts")}</p>
            <p className={`${styles.factValue}`}>
              {hasLayouts ? layouts.length : 0}
            </p>
          </div>

          <div className={`${styles.fact} ${styles.dateFact}`}>
            <p className={`${styles.factLabel}`}>{t("completionDate")}</p>
            <p className={`${styles.factValue}`}>
              {building.completionDate || building.project?.completionDate}
            </p>
          </div>
        </div>
      </div>

      {hasLayouts ? (
        <div className={`${styles.layoutsList}`}>
          {layouts.map((layout: any, index: number) => {
            const minFormattedPrice = formatNumberType(layout.minPrice);

            return (
              <button
                onClick={() => handleClickLayout(layout)}
                className={`${styles.layout}`}
                key={index}
                suppressHydrationWarning
              >
                <div className={`${styles.layoutContent}`}>
                  <div className={`${styles.unitsCount}`}>
                    <span>{layout.unitsCount}</span>
                  </div>

                  <p className={`${styles.layoutData}`}>
                    <span className={`${styles.layoutType}`}>
                      {layout.name.length > 20
                        ? layout.name.slice(0, 17) + "..."
                        : layout.name}
                    </span>{" "}
                    <span className={`${styles.layoutPrice}`}>
                      {t("from")}{" "}
                      {currencyT(currency as keyof typeof currencyT)}
                      {minFormattedPrice.number}
                      {amountT(minFormattedPrice.type as keyof typeof amountT)}
                    </span>
                  </p>
                </div>

                <IoIosArrowForward className={`${styles.arrow}`} />
              </button>
            );
          })}
        </div>
      ) : (
        <div className={`${styles.noLayouts}`}>
          <p>{t("noLayouts")}</p>
        </div>
      )}
    </div>
  );
};

export default BuildingTooltip;
