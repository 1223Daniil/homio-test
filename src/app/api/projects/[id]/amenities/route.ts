import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createAmenitySchema = z.object({
  amenityId: z.string().min(1)
});

const updateAmenitiesSchema = z.object({
  amenities: z.array(z.string())
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const awaitedParams = await params;
    const projectId = awaitedParams.id;
    const data = await req.json();

    // Валидация данных
    const validationResult = createAmenitySchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error },
        { status: 400 }
      );
    }

    // Проверяем существование проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Проверяем существование удобства
    const amenity = await prisma.amenity.findUnique({
      where: { id: validationResult.data.amenityId }
    });

    if (!amenity) {
      return NextResponse.json({ error: "Amenity not found" }, { status: 404 });
    }

    // Создаем связь между проектом и удобством
    const projectAmenity = await prisma.projectAmenity.create({
      data: {
        projectId,
        amenityId: validationResult.data.amenityId
      },
      include: {
        amenity: true
      }
    });

    return NextResponse.json(projectAmenity);
  } catch (error) {
    console.error("Error creating amenity:", error);
    return NextResponse.json(
      { error: "Failed to create amenity" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = awaitedParams.id;
    const data = await req.json();

    // Validate data
    const validationResult = updateAmenitiesSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error },
        { status: 400 }
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete all existing amenities for this project
    await prisma.projectAmenity.deleteMany({
      where: { projectId }
    });

    // Create new amenities
    await prisma.projectAmenity.createMany({
      data: validationResult.data.amenities.map(amenityId => ({
        projectId,
        amenityId
      }))
    });

    // Fetch updated project with amenities
    const updatedProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        amenities: {
          include: {
            amenity: true
          }
        }
      }
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error updating amenities:", error);
    return NextResponse.json(
      { error: "Failed to update amenities" },
      { status: 500 }
    );
  }
}
