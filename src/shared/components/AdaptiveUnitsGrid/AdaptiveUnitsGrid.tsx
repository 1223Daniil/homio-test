import { Unit, UnitLayout } from "@prisma/client";

import { UnitItem } from "../AdaptiveUnitsList/AdaptiveUnitsList";
import styles from "./AdaptiveUnitsGrid.module.css";
import { useState } from "react";

interface Props {
  floors: number;
  layouts: (UnitLayout & { units: Unit[] })[];
  project: {
    id: string;
    currency: string;
    offDate: string;
  };
}

const AdaptiveUnitsGrid = ({ floors, layouts, project }: Props) => {
  const [selectedUnit, setSelectedUnit] = useState<{
    unit: string;
    layout: string;
  } | null>(null);

  const unitsWithBedrooms =
    layouts?.flatMap(layout => {
      return layout.units.map(unit => {
        return {
          ...unit,
          layoutBedrooms: layout.bedrooms,
          mainImage: layout.mainImage ?? "",
          layoutName: layout.name,
          layoutType: layout.type,
          layoutTotalArea: layout.totalArea
        };
      });
    }) || [];

  return (
    <div
      className={`${styles.container} ${
        selectedUnit?.unit && selectedUnit?.layout
          ? styles.containerSelectedUnit
          : ""
      }`}
    >
      <BuildingFloors floors={floors} />

      <Grid
        units={unitsWithBedrooms}
        floors={floors}
        selectedUnit={selectedUnit}
        setSelectedUnit={setSelectedUnit}
      />

      <div className={`${styles.unitItem}`}>
        {selectedUnit?.unit &&
          selectedUnit?.layout &&
          (() => {
            const selectedUnitData = unitsWithBedrooms.find(
              unit => unit.id === selectedUnit.unit
            );
            if (!selectedUnitData) return null;

            return (
              <UnitItem
                unit={selectedUnitData}
                layout={{
                  image: selectedUnitData.mainImage || "",
                  name: selectedUnitData.layoutName || "",
                  type: selectedUnitData.layoutType || "",
                  totalArea: selectedUnitData.layoutTotalArea || 0
                }}
                project={{
                  id: project.id,
                  currency: project.currency,
                  offDate: project.offDate
                }}
              />
            );
          })()}
      </div>
    </div>
  );
};

export default AdaptiveUnitsGrid;

interface BuildingFloorsProps {
  floors: number;
}

function BuildingFloors({ floors }: BuildingFloorsProps) {
  return (
    <div className={`${styles.buildingFloors}`}>
      {Array.from({ length: floors }).map((_, index) => (
        <button key={index} className={`${styles.buildingFloor}`}>
          <div className={`${styles.buildingFloorContent}`}>
            <p>Floor {index + 1}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

interface ExtendedUnit extends Unit {
  layoutBedrooms?: number;
  mainImage?: string;
  layoutName?: string;
  layoutType?: string;
  layoutTotalArea?: number;
}

interface GridProps {
  units: ExtendedUnit[];
  floors: number;
  selectedUnit: {
    unit: string;
    layout: string;
  } | null;
  setSelectedUnit: (
    unit: {
      unit: string;
      layout: string;
    } | null
  ) => void;
}

function Grid({ units, floors, selectedUnit, setSelectedUnit }: GridProps) {
  const unitsByFloor = units.reduce<Record<number, ExtendedUnit[]>>(
    (acc, unit) => {
      const floor = unit.floor || 0;
      if (!acc[floor]) {
        acc[floor] = [];
      }
      acc[floor].push(unit);
      return acc;
    },
    {}
  );

  const availableFloors = Object.keys(unitsByFloor)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className={`${styles.grid}`}>
      {availableFloors.map(floor => {
        const unitsOnFloor = unitsByFloor[floor] || [];

        if (unitsOnFloor.length === 0) {
          return null;
        }

        return (
          <div
            key={floor}
            className={`${styles.gridLine}`}
            style={{
              gridTemplateColumns: `repeat(${unitsOnFloor.length}, 1fr)`
            }}
          >
            <div className={styles.floorLabel}>Этаж {floor}</div>
            {unitsOnFloor.map(unit => {
              console.log(unit);

              return (
                <button
                  key={unit.id}
                  className={`${styles.gridItem} ${
                    selectedUnit?.unit === unit.id ? styles.gridItemActive : ""
                  }`}
                  onClick={() =>
                    setSelectedUnit({
                      unit: unit.id,
                      layout: unit.layoutId || ""
                    })
                  }
                >
                  {unit.layoutBedrooms !== undefined && (
                    <p>
                      {unit.layoutBedrooms === 0 ? "St" : unit.layoutBedrooms}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
