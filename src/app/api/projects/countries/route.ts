import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/projects/countries
 * 
 * Retrieves a list of unique countries from all projects.
 * 
 * @returns {Array<string>} JSON response with an array of country names
 */
export async function GET() {
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
    if (countries.length === 0) {
      return NextResponse.json(['Thailand', 'Russia']);
    }

    // Сортируем страны по алфавиту
    countries.sort();

    return NextResponse.json(countries);
  } catch (error) {
    console.error("Error fetching project countries:", error);
    return NextResponse.json(
      { error: "Failed to fetch project countries" },
      { status: 500 }
    );
  }
} 