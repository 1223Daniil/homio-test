"use server";

import { prisma } from "@/lib/prisma";

/**
 * Форматирует цену, используя "М" для миллионов
 * @param price Цена для форматирования
 * @returns Отформатированная строка цены
 */
function formatPrice(price: number): string {
  if (!price) return "";

  // Если цена больше или равна миллиону
  if (price >= 1000000) {
    // Округляем до 2 знаков после запятой и добавляем "М"
    return (price / 1000000).toFixed(2).replace(/\.00$/, "") + "М";
  }

  // Для цен меньше миллиона просто возвращаем строку
  return price.toString();
}

/**
 * Получает 30 случайных проектов из базы данных
 */
export async function getRandomProjects() {
  try {
    // Получаем проекты с необходимыми связями
    const projects = await prisma.project.findMany({
      include: {
        developer: true,
        location: true,
        translations: true,
        media: true,
        pricing: true,
        units: {
          select: {
            price: true
          }
        }
      },
      take: 30, // Берем 30 проектов
      orderBy: {
        id: "asc"
      }
    });

    // Форматируем данные в нужную структуру
    return projects.map(project => {
      // Базовые данные
      const translation = project.translations?.[0];
      const projectImage = project.media?.[0]?.url || "";
      const developerImage = project.developer?.logo || "";

      // Получаем минимальную и максимальную цену юнитов
      let minPrice = 0;
      let maxPrice = 0;

      if (project.units && project.units.length > 0) {
        // Фильтруем юниты с ценой > 0
        const unitPrices = project.units
          .map(unit => unit.price)
          .filter(price => price && price > 0);

        if (unitPrices.length > 0) {
          minPrice = Math.min(...unitPrices);
          maxPrice = Math.max(...unitPrices);
        }
      }

      // Если нет юнитов или цен, используем базовую цену проекта
      if (minPrice === 0 && maxPrice === 0 && project.pricing?.basePrice) {
        minPrice = project.pricing.basePrice;
        maxPrice = project.pricing.basePrice * 1.5;
      }

      // Форматируем цену с использованием "М" для миллионов
      const price = {
        from: `${minPrice}`,
        to: `${maxPrice}`,
        currency: project.currency
      };

      // Местоположение
      const city = project.location?.city || "";
      const district = project.location?.district || "";
      const locationText = [city, district].filter(Boolean).join(", ");

      // Расстояние
      const beachDistance = project.location?.beachDistance;
      const distance = beachDistance ? beachDistance : "";

      // Результат
      return {
        ...project,
        price,
        distance,
        formattedData: {
          title: translation?.name || project.name || "",
          projectImage,
          developerImage,
          price,
          location: locationText,
          distance
        }
      };
    });
  } catch (error) {
    console.error("Error fetching random projects:", error);
    throw new Error("Не удалось получить случайные проекты");
  }
}
