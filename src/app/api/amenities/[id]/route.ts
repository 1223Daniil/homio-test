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

// Получение конкретного удобства
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const amenity = await prisma.amenity.findUnique({
      where: { id: awaitedParams.id },
      include: {
        projectAmenities: {
          include: {
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!amenity) {
      return NextResponse.json({ error: "Amenity not found" }, { status: 404 });
    }

    return NextResponse.json(amenity);
  } catch (error) {
    console.error("Error fetching amenity:", error);
    return NextResponse.json(
      { error: "Failed to fetch amenity" },
      { status: 500 }
    );
  }
}

// Обновление удобства
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("Received update data:", JSON.stringify(data, null, 2));

    const validationResult = amenitySchema.safeParse(data);

    console.log("validationResult", validationResult);

    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error);
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error },
        { status: 400 }
      );
    }

    // Проверяем существование удобства
    const existingAmenity = await prisma.amenity.findUnique({
      where: { id: awaitedParams.id }
    });

    if (!existingAmenity) {
      return NextResponse.json({ error: "Amenity not found" }, { status: 404 });
    }

    // Проверяем, не существует ли другое удобство с таким же именем
    if (validationResult.data.name !== existingAmenity.name) {
      const duplicateAmenity = await prisma.amenity.findUnique({
        where: { name: validationResult.data.name }
      });

      if (duplicateAmenity) {
        return NextResponse.json(
          { error: "Amenity with this name already exists" },
          { status: 400 }
        );
      }
    }

    const dataToTranslate = {
      name: validationResult.data.name,
      description: validationResult.data.description
    };
    const translatedData = await translateText(dataToTranslate);

    const updatedAmenity = await prisma.amenity.update({
      where: { id: awaitedParams.id },
      data: {
        name: validationResult.data.name,
        description: validationResult.data.description ?? null,
        icon: validationResult.data.icon,
        translations: translatedData
      },
      include: {
        projectAmenities: {
          include: {
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedAmenity);
  } catch (error) {
    console.error("Error updating amenity:", error);
    return NextResponse.json(
      { error: "Failed to update amenity" },
      { status: 500 }
    );
  }
}

// Удаление удобства
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Проверяем существование удобства
    const existingAmenity = await prisma.amenity.findUnique({
      where: { id: awaitedParams.id },
      include: {
        projectAmenities: true
      }
    });

    if (!existingAmenity) {
      return NextResponse.json({ error: "Amenity not found" }, { status: 404 });
    }

    // Если есть связанные проекты, не позволяем удалить удобство
    if (existingAmenity.projectAmenities.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete amenity that is used in projects" },
        { status: 400 }
      );
    }

    await prisma.amenity.delete({
      where: { id: awaitedParams.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting amenity:", error);
    return NextResponse.json(
      { error: "Failed to delete amenity" },
      { status: 500 }
    );
  }
}
