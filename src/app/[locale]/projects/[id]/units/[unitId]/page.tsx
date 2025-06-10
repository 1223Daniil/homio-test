import { getBuilding, getUnit } from "@/features/actions/units/get-unit.action";
import {
  getProjectAmenities,
  getProjectDeveloper,
  getProjectTranslations
} from "@/features/actions/projects/get-project.action";

import UnitDetailContent from "@/components/units/UnitDetailContent";
import { getBuildingBasicInfo } from "@/features/actions/buildings/buildings.action";
import { getLayoutById } from "@/features/actions/layouts/layouts.action";
import { getProject } from "@/lib/api/projects";
import { getRandomProjects } from "@/features/actions/projects/random-projects.action";
import { getRandomUnits } from "@/features/actions/units/similar-units.action";

export default async function UnitPage({
  params
}: {
  params: { id: string; unitId: string };
}) {
  const [
    unit,
    project,
    similarProjects,
    similarUnits,
    amenities,
    translations
  ] = await Promise.all([
    getUnit(params.unitId),
    getProject(params.id),
    getRandomProjects(),
    getRandomUnits(),
    getProjectAmenities(params.id),
    getProjectTranslations(params.id)
  ]);

  if (!unit || !project) {
    throw new Error("Unit or project not found");
  }

  const developer = await getProjectDeveloper(project.developerId);
  const building = unit.buildingId ? await getBuilding(unit.buildingId) : null;
  const layout = await getLayoutById({
    layoutId: unit.layoutId
  });
  const aboutBuilding = await getBuildingBasicInfo({
    projectId: project.id,
    buildingId: unit.buildingId
  });

  const preparedProject = {
    ...project,
    translations: translations || [],
    location: project.location || null,
    developer: developer
  };

  return (
    <UnitDetailContent
      unit={unit}
      project={preparedProject}
      building={building}
      similarProjects={similarProjects || []}
      similarUnits={similarUnits || []}
      amenities={amenities || []}
      developer={developer}
      layout={layout}
      aboutBuilding={aboutBuilding}
    />
  );
}
