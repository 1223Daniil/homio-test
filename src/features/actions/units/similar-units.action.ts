"use server";

import { SimilarUnitsFormValues } from "@/widgets/SimilarUnits/SimilarUnits";
import { prisma } from "@/lib/prisma";

export const getRandomUnits = async () => {
  try {
    const units = await prisma.unit.findMany({
      take: 30,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        layout: true,
        building: {
          select: {
            floors: true
          }
        },
        project: {
          select: {
            media: true,
            currency: true,
            type: true
          }
        }
      }
    });
    return units;
  } catch (error) {
    console.error("Ошибка при получении рандомных юнитов:", error);
    throw new Error(
      "Не удалось получить рандомные юниты. Пожалуйста, попробуйте позже."
    );
  }
};

export const getFilteredUnits = async (filters: SimilarUnitsFormValues) => {
  const { offDate, ...rest } = filters;

  try {
    const units = await prisma.unit.findMany({
      where: {
        ...rest,
        project: {
          completionDate: {
            gte: new Date(offDate)
          }
        }
      }
    });
    console.log(units);
    return units;
  } catch (error) {
    console.error("Ошибка при получении отфильтрованных юнитов:", error);
    throw new Error(
      "Не удалось получить отфильтрованные юниты. Пожалуйста, попробуйте позже."
    );
  }
};
