import { FloorPlan } from "@prisma/client";
import ProjectFloorPlan from "./ProjectFloorPlan";

interface ProjectFloorPlanWrapperProps {
  floorPlans: FloorPlan[];
  buildingData?: any;
  isPublic?: boolean;
}

const ProjectFloorPlanWrapper = ({
  floorPlans,
  buildingData,
  isPublic = false
}: ProjectFloorPlanWrapperProps) => {
  const validFloorPlans = floorPlans || [];

  return (
    <ProjectFloorPlan
      floorPlans={validFloorPlans}
      showFloorSelector={false}
      showTooltips={true}
      buildingData={buildingData}
      isPublic={isPublic}
    />
  );
};

export default ProjectFloorPlanWrapper;
