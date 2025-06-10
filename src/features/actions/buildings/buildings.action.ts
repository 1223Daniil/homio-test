"use server";

import { prisma } from "@/lib/prisma";

/**
 * Получает основную информацию о здании и проекте по их ID
 * Включает информацию о разработчике с переводами и количество юнитов в здании
 *
 * @param {Object} params - Параметры запроса
 * @param {string} params.projectId - ID проекта
 * @param {string} params.buildingId - ID здания
 * @returns {Promise<{
 *   building: {
 *     id: string;
 *     name: string;
 *     floors: number;
 *     status: import('@prisma/client').ProjectStatus;
 *     description: string | null;
 *     imageUrl: string | null;
 *     createdAt: Date;
 *     updatedAt: Date;
 *     projectId: string;
 *     _count: { units: number };
 *   };
 *   project: {
 *     id: string;
 *     name: string | null;
 *     slug: string | null;
 *     description: string | null;
 *     type: import('@prisma/client').ProjectType;
 *     buildingStatus: import('@prisma/client').BuildingStatus;
 *     status: import('@prisma/client').ProjectStatus;
 *     translations: import('@prisma/client').ProjectTranslation[];
 *     developer: import('@prisma/client').Developer & {
 *       translations: import('@prisma/client').DeveloperTranslation[];
 *     };
 *   };
 * } | null>} Объект с информацией о здании и проекте или null, если здание или проект не найдены
 */
export const getBuildingBasicInfo = async ({
  projectId,
  buildingId
}: {
  projectId: string;
  buildingId: string;
}) => {
  try {
    const buildingWithProject = await prisma.building.findFirst({
      where: {
        id: buildingId,
        projectId: projectId
      },
      select: {
        id: true,
        name: true,
        floors: true,
        status: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        projectId: true,
        _count: {
          select: {
            units: true
          }
        }
      }
    });

    if (!buildingWithProject) {
      return null;
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        buildingStatus: true,
        status: true,
        translations: true,
        media: true,
        completionDate: true,
        phase: true,
        constructionStatus: true,
        developer: {
          include: {
            translations: true
          }
        }
      }
    });

    if (!project) {
      return null;
    }

    return {
      building: buildingWithProject,
      project
    };
  } catch (error) {
    console.error("Error fetching building basic info:", error);
    return null;
  }
};

export const getBuildingMinimalInfo = async ({
  projectId,
  buildingId
}: {
  projectId: string;
  buildingId: string;
}) => {
  try {
    const result = await prisma.$transaction(async tx => {
      const building = await tx.building.findFirst({
        where: {
          id: buildingId,
          projectId: projectId
        },
        select: {
          id: true,
          name: true,
          floors: true,
          status: true,
          _count: {
            select: {
              units: true
            }
          }
        }
      });

      if (!building) {
        return null;
      }

      const project = await tx.project.findUnique({
        where: {
          id: projectId
        },
        select: {
          id: true,
          name: true,
          status: true,
          developer: {
            include: {
              translations: true
            }
          }
        }
      });

      if (!project) {
        return null;
      }

      return { building, project };
    });

    return result;
  } catch (error) {
    console.error("Error fetching building minimal info:", error);
    return null;
  }
};

/**
 * Получает только количество юнитов в здании
 * Максимально оптимизированная функция для быстрого получения статистики
 */
export const getBuildingUnitsCount = async ({
  buildingId
}: {
  buildingId: string;
}) => {
  try {
    const result = await prisma.building.findUnique({
      where: {
        id: buildingId
      },
      select: {
        _count: {
          select: {
            units: true
          }
        }
      }
    });

    if (!result) {
      return 0;
    }

    return result._count.units;
  } catch (error) {
    console.error("Error fetching building units count:", error);
    return 0;
  }
};

/**
 * Получает информацию о разработчике с переводами для конкретного проекта
 */
export const getProjectDeveloperWithTranslations = async ({
  projectId
}: {
  projectId: string;
}) => {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId
      },
      select: {
        developer: {
          include: {
            translations: true
          }
        }
      }
    });

    if (!project || !project.developer) {
      return null;
    }

    return project.developer;
  } catch (error) {
    console.error("Error fetching project developer:", error);
    return null;
  }
};

/**
 * Получает список зданий для проекта с включенными планами этажей для каждого здания
 * @param projectId - ID проекта
 * @returns Массив зданий с их планами этажей
 */
export const getBuildingsWithFloorPlans = async (projectId: string) => {
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
