import {
  getBuilding,
  getUnitBySlug
} from "@/features/actions/units/get-unit.action";
import { getProject, getProjectBySlug } from "@/lib/api/projects";
import {
  getProjectAmenities,
  getProjectDeveloper,
  getProjectTranslations
} from "@/features/actions/projects/get-project.action";

import { ProjectWithRelations } from "@/types/project";
import UnitDetailPublicContent from "@/components/units/UnitDetailContentPublic";
import { getLayoutById } from "@/features/actions/layouts/layouts.action";
import { getRandomProjects } from "@/features/actions/projects/random-projects.action";
import { getRandomUnits } from "@/features/actions/units/similar-units.action";
import { prisma } from "@/lib/prisma";

// Функция для получения данных о доходности проекта
async function getProjectYield(projectId: string) {
  if (!projectId) return null;

  const projectYield = await prisma.projectYield.findUnique({
    where: {
      projectId
    }
  });

  return projectYield;
}

export default async function UnitPage({
  params
}: {
  params: { locale: string; slug: string; unitSlug: string };
}) {
  console.log("Unit page params:", params); // Логируем параметры для отладки

  if (!params.slug || !params.unitSlug) {
    throw new Error("Missing required URL parameters");
  }

  try {
    const project = await getProjectBySlug(params.slug);
    console.log("Project loaded:", !!project);

    if (!project || !project.id) {
      throw new Error(`Project not found for slug: ${params.slug}`);
    }

    const [unit, similarProjects, similarUnits] = await Promise.all([
      getUnitBySlug(params.unitSlug),
      getRandomProjects(),
      getRandomUnits()
    ]);
    console.log("Unit loaded:", !!unit);
    console.log("Unit layoutId:", unit?.layoutId);

    if (!unit) {
      throw new Error(`Unit not found for slug: ${params.unitSlug}`);
    }

    const [amenities, translations, projectYield] = await Promise.all([
      getProjectAmenities(project.id),
      getProjectTranslations(project.id),
      getProjectYield(project.id)
    ]);
    console.log("Amenities, translations, yield loaded");

    const developer = await getProjectDeveloper(project.developerId);
    console.log("Developer loaded:", !!developer);

    const building = unit.buildingId
      ? await getBuilding(unit.buildingId)
      : null;
    console.log("Building loaded:", !!building);

    let layout = unit.layoutId
      ? await getLayoutById({
          layoutId: unit.layoutId
        })
      : null;
    console.log("Layout loaded:", !!layout);

    // Подготавливаем проект с необходимыми свойствами
    const preparedProject = {
      ...project,
      translations: translations || [],
      location: project.location || null,
      developer: developer,
      yield: projectYield,
      amenities: amenities || []
    } as ProjectWithRelations;

    const preparedSimilarProjects = (similarProjects?.map(p => ({
      ...p,
      yield: null,
      amenities: [],
      media: p.media || [],
      location: p.location || null
    })) || []) as ProjectWithRelations[];

    if (layout) {
      layout.description =
        layout.UnitLayoutTranslation.find(t => t.language === params.locale)
          ?.description || layout.description;
    }

    return (
      <UnitDetailPublicContent
        unit={unit as any}
        project={preparedProject as any}
        building={building as any}
        similarProjects={preparedSimilarProjects as any}
        similarUnits={similarUnits || ([] as any)}
        amenities={amenities || ([] as any)}
        developer={developer as any}
        layout={layout as any}
      />
    );
  } catch (error) {
    console.error(
      "Error in UnitPage:",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}
