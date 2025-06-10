import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Получаем агрегированные данные по ценам
    const priceStats = await prisma.unit.aggregate({
      where: { 
        status: "AVAILABLE",
        price: { 
          gt: 0 // Исключаем юниты с нулевой ценой
        }
      },
      _min: {
        price: true
      },
      _max: {
        price: true
      }
    });

    const min = priceStats._min.price;
    const max = priceStats._max.price;

    console.log('Price range from DB:', { min, max });

    if (!min || !max) {
      console.log('No valid price range found, using defaults');
      return NextResponse.json({
        min: 100000, // Минимальная цена по умолчанию - 100k
        max: 1000000 // Максимальная цена по умолчанию - 1M
      });
    }

    return NextResponse.json({ min, max });
  } catch (error) {
    console.error('Failed to get price range:', error);
    return NextResponse.json(
      { error: 'Failed to get price range' },
      { status: 500 }
    );
  }
} 