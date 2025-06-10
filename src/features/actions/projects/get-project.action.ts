"use server";

import { prisma } from "@/lib/prisma";

export async function getProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      documents: true,
      media: true,
      location: true,
      translations: {
        select: {
          name: true,
          description: true,
          language: true
        }
      },
      buildings: {
        include: {
          media: true,
          units: {
            include: {
              media: true
            }
          }
        }
      },
      units: {
        include: {
          media: true
        }
      },
      developer: {
        include: {
          translations: true
        }
      },
      amenities: {
        include: {
          amenity: true
        }
      },
      pricing: true,
      yield: true,
      masterPlanPoints: true
    }
  });

  console.log(project?.translations);

  if (project?.class) {
    project.class = project.class.toLowerCase() as any;
  }

  return project;
}

export async function getProjectTranslations(id: string) {
  const translations = await prisma.projectTranslation.findMany({
    where: {
      projectId: id
    }
  });

  console.log(translations);

  return translations;
}

export async function getProjectAmenities(id: string) {
  const amenities = await prisma.projectAmenity.findMany({
    where: {
      projectId: id
    },
    include: {
      amenity: true
    }
  });

  console.log("amenities", amenities);

  return amenities;
}

export async function getProjectDeveloper(id: string) {
  const developer = prisma.developer.findUnique({
    where: {
      id
    },
    include: {
      translations: true
    }
  });

  return developer;
}

export async function getProjectMasterPlanPoints(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      completionDate: true,
      constructionStatus: true,
      phase: true
    }
  });

  const points = await prisma.masterPlanPoint.findMany({
    where: { projectId: id },
    include: {
      building: {
        include: {
          floorPlans: true,
          units: {
            include: {
              layout: true
            }
          }
        }
      }
    }
  });

  // Добавляем информацию о проекте к каждой точке
  const pointsWithProjectInfo = points.map(point => ({
    ...point,
    building: point.building
      ? {
          ...point.building,
          project: project
        }
      : null
  }));

  return pointsWithProjectInfo;
}

/**
 * Получает список зданий проекта с планами этажей
 */
export const getProjectBuildingsWithFloorPlans = async (projectId: string) => {
  try {
    const buildings = await prisma.building.findMany({
      where: {
        projectId
      },
      include: {
        floorPlans: true,
        units: {
          include: {
            layout: true
          }
        }
      }
    });

    return buildings;
  } catch (error) {
    console.error(
      `Error loading buildings with floor plans for project ${projectId}:`,
      error
    );
    return [];
  }
};

/**
 * Получает детальные данные о проекте для ProjectDetail компонента
 */
export const getProjectDetails = async (projectId: string) => {
  try {
    const projectDetails = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        documents: true,
        media: true,
        location: true,
        amenities: true,
        units: true
      }
    });

    return projectDetails;
  } catch (error) {
    console.error(
      `Error loading project details for project ${projectId}:`,
      error
    );
    return null;
  }
};
