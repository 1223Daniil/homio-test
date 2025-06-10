import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { FloorPlan } from "@prisma/client";
import { IoGridOutline } from "react-icons/io5";
import { LayoutIcon } from "@/shared/components/MediaFilters/MediaFilters";
import { MdFormatListBulleted } from "react-icons/md";
import ProjectFloorPlanWrapper from "../ProjectFloorPlan/ProjectFloorPlanWrapper";
import ProjectUnitsGrid from "../ProjectUnitsGrid";
import ProjectUnitsList from "../ProjectUnitsList";
import styles from "./ProjectUnits.module.css";
import { useLayouts } from "@/hooks/useLayouts";
import { useTranslations } from "next-intl";

interface ProjectUnitsProps {
  floorPlans: FloorPlan[];
  buildingData?: any; // Добавляем данные о здании
  isPublic?: boolean;
}

const ProjectUnits = ({
  floorPlans,
  buildingData,
  isPublic = false
}: ProjectUnitsProps) => {
  const [activeFilter, setActiveFilter] = useState<string>("list");

  // Используем nullish coalescing для предотвращения undefined
  const safeFloorPlans = floorPlans || [];
  const firstImageUrl =
    safeFloorPlans.length > 0 && safeFloorPlans[0]?.imageUrl
      ? safeFloorPlans[0].imageUrl
      : null;

  const { selectedLayouts, clearLayouts } = useLayouts();

  const t = useTranslations("ProjectDetails.tabs.masterPlan.projectUnits");

  // Добавляем логирование для отладки
  console.log("ProjectUnits - Props:", { floorPlans, buildingData });
  console.log("ProjectUnits - selectedLayouts:", selectedLayouts);

  const allUnits = useMemo(() => {
    // Проверяем, есть ли выбранные планировки
    if (selectedLayouts && selectedLayouts.length > 0) {
      // Если есть выбранные планировки, используем их юниты
      return selectedLayouts.flatMap(layout => layout.units || []);
    } else if (buildingData && buildingData.layouts) {
      // Если нет выбранных планировок, но есть layouts в buildingData, используем их
      return buildingData.layouts.flatMap(layout => layout.units || []);
    }
    // Если нет ни выбранных планировок, ни layouts, возвращаем пустой массив
    return [];
  }, [selectedLayouts, buildingData]);

  // Добавляем логирование allUnits
  console.log("ProjectUnits - allUnits:", allUnits);

  useEffect(() => {
    return () => {
      // Очищаем выбранные планировки при размонтировании компонента
      clearLayouts();
    };
  }, [clearLayouts]);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  console.log("selectedLayouts", selectedLayouts);

  // Если нет ни выбранных планировок, ни данных о здании, показываем сообщение
  if (selectedLayouts?.length === 0) {
    return null;
  }

  // Определяем анимации
  const variants = {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  };

  console.log("buildingData", buildingData);

  return (
    <div>
      <div className={`${styles.header}`}>
        <div className={`${styles.title}`}>
          <p>
            {selectedLayouts.length > 1
              ? t("unitsCountMany", {
                  unitsCount: allUnits.length,
                  selectedLayoutsCount:
                    selectedLayouts.length || buildingData?.layouts?.length || 0
                })
              : t("unitsCount", {
                  unitsCount: allUnits.length,
                  selectedLayoutsCount:
                    selectedLayouts.length || buildingData?.layouts?.length || 0
                })}
          </p>

          <div className={`${styles.filters}`}>
            <button
              className={`${styles.filter} ${
                activeFilter === "list" ? styles.filterActive : ""
              }`}
              onClick={() => handleFilterClick("list")}
            >
              <MdFormatListBulleted />
              <span>{t("displayTypes.list")}</span>
              {activeFilter === "list" && (
                <motion.div
                  className="absolute inset-0 bg-[#717680] -z-10"
                  layoutId="filterBackground"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </button>

            <button
              className={`${styles.filter} ${
                activeFilter === "floorPlan" ? styles.filterActive : ""
              }`}
              onClick={() => handleFilterClick("floorPlan")}
            >
              <LayoutIcon />
              <span>{t("displayTypes.floorPlan")}</span>
              {activeFilter === "floorPlan" && (
                <motion.div
                  className="absolute inset-0 bg-[#717680] -z-10"
                  layoutId="filterBackground"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </button>

            <button
              className={`${styles.filter} ${
                activeFilter === "grid" ? styles.filterActive : ""
              }`}
              onClick={() => handleFilterClick("grid")}
            >
              <IoGridOutline />
              <span>{t("displayTypes.grid")}</span>
              {activeFilter === "grid" && (
                <motion.div
                  className="absolute inset-0 bg-[#717680] -z-10"
                  layoutId="filterBackground"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </button>
          </div>
        </div>

        <div className={`${styles.statuses}`}>
          {statuses.map(status => (
            <div key={status} className={`${styles.status}`}>
              <div className={`${styles.dot} ${styles[`dot${status}`]}`}></div>
              <p>{t(`statuses.${status.toUpperCase()}`)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.content}`}>
        <AnimatePresence mode="wait">
          {activeFilter === "list" && (
            <motion.div
              key="list"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={variants}
              transition={{ duration: 0.3 }}
            >
              <ProjectUnitsList
                buildingData={buildingData}
                isPublic={isPublic}
              />
            </motion.div>
          )}
          {activeFilter === "grid" && (
            <motion.div
              key="grid"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={variants}
              transition={{ duration: 0.3 }}
            >
              <ProjectUnitsGrid
                buildingData={buildingData}
                isPublic={isPublic}
              />
            </motion.div>
          )}
          {activeFilter === "floorPlan" && (
            <motion.div
              key="floorPlan"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={variants}
              transition={{ duration: 0.3 }}
            >
              <ProjectFloorPlanWrapper
                floorPlans={safeFloorPlans}
                buildingData={buildingData}
                isPublic={isPublic}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProjectUnits;

const statuses = ["Available", "Reserved", "Sold", "Unavailable"];
