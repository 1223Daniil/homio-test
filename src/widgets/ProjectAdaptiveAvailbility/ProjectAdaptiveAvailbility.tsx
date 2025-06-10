import { Building, MasterPlanPoint } from "@prisma/client";

import AdaptiveAvailabilityBuildingsList from "@/shared/components/AdaptiveAvailabilityBuildingsList";
import AdaptiveMasterPlan from "@/shared/components/AdaptiveMasterPlan";
import styles from "./ProjectAdaptiveAvailbility.module.css";

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

interface BuildingWithFloorPlans extends Building {
  floorPlans: FloorPlan[];
  layouts?: any[];
  units?: any[];
}

interface Props {
  image: {
    url: string;
    alt: string;
  };
  points: MasterPlanPoint[];
  buildings: BuildingWithFloorPlans[];
  project: {
    id: string;
    offDate: string | null;
    phase: string | null;
    currency: string | null;
  };
}

const ProjectAdaptiveAvailbility = ({
  image,
  points,
  buildings,
  project
}: Props) => {
  // Маппим buildings, добавляем пустые массивы layouts и units, если их нет
  const enhancedBuildings = buildings.map(building => ({
    ...building,
    layouts: building.layouts || [],
    units: building.units || []
  }));

  return (
    <div className={`${styles.container}`}>
      <div className={`${styles.content}`}>
        <AdaptiveMasterPlan
          image={{
            url: image.url,
            alt: image.alt
          }}
          points={points}
        />

        <AdaptiveAvailabilityBuildingsList
          buildings={enhancedBuildings}
          project={{
            id: project.id,
            offDate: project.offDate || "",
            phase: project.phase || "",
            currency: project.currency || ""
          }}
        />
      </div>
    </div>
  );
};

export default ProjectAdaptiveAvailbility;
