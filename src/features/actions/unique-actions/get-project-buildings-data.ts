"use server";

import { prisma } from "@/lib/prisma";

export async function getProjectBuildingsData(projectId: string) {
  // Получаем все здания проекта
  const buildings = await prisma.building.findMany({
    where: { projectId },
    select: {
      project: {
        select: {
          id: true,
          currency: true
        }
      },
      id: true,
      name: true,
      floors: true,
      status: true,
      description: true,
      imageUrl: true,
      units: {
        include: {
          layout: true
        }
      },
      floorPlans: {
        select: {
          id: true,
          floorNumber: true,
          name: true,
          imageUrl: true,
          imageBlurhash: true,
          svgData: true,
          description: true,
          status: true,
          order: true
        },
        orderBy: {
          floorNumber: "asc"
        }
      }
    }
  });

  if (!buildings.length) {
    // Вместо ошибки возвращаем пустой массив
    return [];
  }

  // Для каждого здания получаем информацию о планировках и юнитах
  const buildingsWithLayoutStats = await Promise.all(
    buildings.map(async building => {
      // Получаем все юниты здания
      const units = await prisma.unit.findMany({
        where: {
          projectId,
          buildingId: building.id
        },
        select: {
          id: true,
          price: true,
          layoutId: true,
          slug: true,
          status: true,
          number: true,
          floor: true
        }
      });

      // Получаем все уникальные layoutId из юнитов
      const layoutIds = Array.from(
        new Set(
          units
            .filter(unit => unit.layoutId !== null)
            .map(unit => unit.layoutId as string)
        )
      );

      // Если нет планировок, возвращаем здание с пустым массивом планировок
      if (layoutIds.length === 0) {
        return {
          ...building,
          layouts: []
        };
      }

      // Получаем информацию о планировках
      const layouts = await prisma.unitLayout.findMany({
        where: {
          id: {
            in: layoutIds
          }
        },
        select: {
          id: true,
          name: true,
          type: true,
          totalArea: true,
          bedrooms: true,
          bathrooms: true,
          floor: true,
          mainImage: true,
          mainImageBlurhash: true,
          currency: true
        }
      });

      // Для каждой планировки находим минимальную и максимальную цену юнитов
      const layoutsWithPriceRange = layouts.map(layout => {
        // Фильтруем юниты по текущей планировке
        const layoutUnits = units.filter(unit => unit.layoutId === layout.id);

        // Находим минимальную и максимальную цену
        let minPrice: number | null = null;
        let maxPrice: number | null = null;

        if (layoutUnits.length > 0) {
          const prices = layoutUnits.map(unit => unit.price);
          const nonZeroPrices = prices.filter(price => price > 0);
          minPrice =
            nonZeroPrices.length > 0 ? Math.min(...nonZeroPrices) : null;
          maxPrice = Math.max(...prices);
        }

        // Считаем количество юнитов с данной планировкой
        const unitsCount = layoutUnits.length;

        return {
          ...layout,
          minPrice,
          maxPrice,
          unitsCount,
          units: layoutUnits
        };
      });

      // Возвращаем здание с информацией о планировках
      return {
        ...building,
        layouts: layoutsWithPriceRange
      };
    })
  );

  return buildingsWithLayoutStats;
}
