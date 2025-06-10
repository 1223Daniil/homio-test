"use server";

import { prisma } from "@/lib/prisma";

export async function getUnitPricesRange() {
  try {
    const result = await prisma.$queryRaw<[{ min: number; max: number }]>`
      SELECT 
        MIN("price") as min,
        MAX("price") as max
      FROM "Unit"
      WHERE "price" IS NOT NULL
    `;

    const { min, max } = result[0];

    return { min, max };
  } catch (error) {
    console.error("Ошибка при получении диапазона цен:", error);

    return { min: 0, max: 0 };
  }
}
