import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { translateText } from "@/utils/aiTranslator";
import { z } from "zod";

const amenitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  icon: z.string().optional().default("default")
});

// Получение списка всех удобств
export async function GET() {
  try {
    const amenities = await prisma.amenity.findMany({
      orderBy: {
        name: "asc"
      }
    });

    return NextResponse.json(amenities);
  } catch (error) {
    console.error("Error fetching amenities:", error);
    return NextResponse.json(
      { error: "Failed to fetch amenities" },
      { status: 500 }
    );
  }
}

// Создание нового удобства
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("Received data:", JSON.stringify(data, null, 2));

    const validationResult = amenitySchema.safeParse(data);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error);
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error },
        { status: 400 }
      );
    }

    // Проверяем, существует ли удобство с таким именем
    const existingAmenity = await prisma.amenity.findUnique({
      where: { name: validationResult.data.name }
    });

    if (existingAmenity) {
      return NextResponse.json(
        { error: "Amenity with this name already exists" },
        { status: 400 }
      );
    }

    const dataToTranslate = {
      name: validationResult.data.name,
      description: validationResult.data.description
    };
    const translatedData = await translateText(dataToTranslate);

    const amenity = await prisma.amenity.create({
      data: {
        name: validationResult.data.name,
        description: validationResult.data.description ?? null,
        icon: validationResult.data.icon,
        translations: translatedData
      }
    });

    return NextResponse.json(amenity);
  } catch (error) {
    console.error("Error creating amenity:", error);
    return NextResponse.json(
      { error: "Failed to create amenity" },
      { status: 500 }
    );
  }
}
