"use server";

import { prisma } from "@/lib/prisma";

export async function getBedroomsRange() {
  try {
    const result = await prisma.$queryRaw<[{ min: number; max: number }]>`
      SELECT 
        MIN("bedrooms") as min,
        MAX("bedrooms") as max
      FROM "Unit"
      WHERE "bedrooms" IS NOT NULL
    `;

    const { min, max } = result[0];

    return { min, max };
  } catch (error) {
    console.error("Ошибка при получении диапазона bedrooms:", error);

    return { min: 0, max: 0 };
  }
}
