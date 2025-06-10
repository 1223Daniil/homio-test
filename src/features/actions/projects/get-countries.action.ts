"use server";

import { prisma } from "@/lib/prisma";

/**
 * Получает список уникальных стран из проектов
 * @returns {Promise<string[]>} Список стран
 */
export async function getProjectCountries(): Promise<string[]> {
  try {
    // Запрашиваем уникальные страны из таблицы Location, связанной с проектами
    const locations = await prisma.location.findMany({
      where: {
        // Убедимся, что location принадлежит какому-то проекту
        project: {
          isNot: null
        }
      },
      select: {
        country: true
      },
      distinct: ['country']
    });

    // Преобразуем результат в массив строк с названиями стран
    const countries = locations.map(location => location.country);

    // Если в результате массив пустой, возвращаем хотя бы дефолтные значения
    // if (countries.length === 0) {
    //   return ['Thailand', 'Russia'];
    // }

    // Сортируем страны по алфавиту
    countries.sort();

    return countries;
  } catch (error) {
    console.error("Error fetching project countries:", error);
    // В случае ошибки возвращаем дефолтные значения
    return ['Thailand', 'Russia'];
  }
} 