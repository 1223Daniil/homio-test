import styles from "./ProjectFloorsList.module.css";
import { useTranslations } from "next-intl";

interface ProjectFloorsListProps {
  floors: number[];
  setActiveFloor: (floor: number | null) => void;
  unitsPerFloor: Record<number, number>;
  maxFloor: number;
  activeFloor?: number | null;
}

const FloorItem = ({
  floor,
  maxFloor,
  unitsCount,
  isActive,
  onClick
}: {
  floor: number;
  maxFloor: number;
  unitsCount: number;
  isActive: boolean;
  onClick: () => void;
}) => {
  const t = useTranslations("ProjectDetails.tabs.masterPlan.floorsList");

  return (
    <button
      className={`${styles.floor} ${isActive ? styles.activeFloor : ""}`}
      onClick={onClick}
    >
      <div
        className={`${styles.floorButton} ${isActive ? styles.selectedFloorButton : ""}`}
      >
        {t("floor")} {floor}
      </div>
      <p className={styles.unitsCount}>
        {t("units")} {unitsCount}
      </p>
    </button>
  );
};

const ProjectFloorsList = ({
  floors,
  setActiveFloor,
  unitsPerFloor,
  maxFloor,
  activeFloor
}: ProjectFloorsListProps) => {
  const sortedFloors = [...floors].sort((a, b) => a - b);

  return (
    <div className={styles.floors}>
      {sortedFloors.map((floor, index) => (
        <FloorItem
          key={index}
          floor={floor}
          maxFloor={maxFloor}
          unitsCount={unitsPerFloor[floor] || 0}
          isActive={activeFloor === floor}
          onClick={() => setActiveFloor(floor)}
        />
      ))}
    </div>
  );
};

export default ProjectFloorsList;
