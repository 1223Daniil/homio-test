"use server";

import { prisma } from "@/lib/prisma";

interface HeroSearchFiltersData {
  bedrooms: { min: number; max: number };
  prices: { min: number; max: number };
}

export const getHeroSearchFiltersData =
  async (): Promise<HeroSearchFiltersData> => {
    try {
      const result = await prisma.$queryRaw<
        [
          {
            min_bedrooms: number;
            max_bedrooms: number;
            min_price: number;
            max_price: number;
          }
        ]
      >`
      SELECT 
        MIN(CASE WHEN "bedrooms" IS NOT NULL THEN "bedrooms" ELSE NULL END) as min_bedrooms,
        MAX(CASE WHEN "bedrooms" IS NOT NULL THEN "bedrooms" ELSE NULL END) as max_bedrooms,
        MIN(CASE WHEN "price" IS NOT NULL THEN "price" ELSE NULL END) as min_price,
        MAX(CASE WHEN "price" IS NOT NULL THEN "price" ELSE NULL END) as max_price
      FROM "Unit"
    `;

      const { min_bedrooms, max_bedrooms, min_price, max_price } = result[0];

      return {
        bedrooms: { min: min_bedrooms || 0, max: max_bedrooms || 0 },
        prices: { min: min_price || 0, max: max_price || 0 }
      };
    } catch (error) {
      console.error("Ошибка при получении данных для фильтров:", error);

      return {
        bedrooms: { min: 0, max: 0 },
        prices: { min: 0, max: 0 }
      };
    }
  };
