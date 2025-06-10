import { NextRequest, NextResponse } from "next/server";

import { ProjectStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateBuildingSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  floors: z.number().min(1).optional(),
  status: z.nativeEnum(ProjectStatus).optional()
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; buildingId: string }> }
) {
  try {
    const awaitedParams = await params;
    const { id: projectId, buildingId } = awaitedParams;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Проверяем существование проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Получаем здание с проверкой принадлежности к проекту
    const building = await prisma.building.findUnique({
      where: {
        id: buildingId
      },
      include: {
        media: true,
        floorPlans: true,
        units: {
          include: {
            media: true
          }
        }
      }
    });

    if (!building) {
      return NextResponse.json(
        { error: "Building not found" },
        { status: 404 }
      );
    }

    if (building.projectId !== projectId) {
      return NextResponse.json(
        { error: "Building does not belong to this project" },
        { status: 400 }
      );
    }

    return NextResponse.json(building);
  } catch (error) {
    console.error("Get building error:", error);
    return NextResponse.json(
      { error: "Failed to fetch building" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; buildingId: string }> }
) {
  try {
    const awaitedParams = await params;
    const { id: projectId, buildingId } = awaitedParams;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Проверяем существование проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Проверяем существование здания
    const existingBuilding = await prisma.building.findUnique({
      where: { id: buildingId }
    });

    if (!existingBuilding) {
      return NextResponse.json(
        { error: "Building not found" },
        { status: 404 }
      );
    }

    // Проверяем принадлежность здания к проекту
    if (existingBuilding.projectId !== projectId) {
      return NextResponse.json(
        { error: "Building does not belong to this project" },
        { status: 400 }
      );
    }

    const data = await req.json();
    console.log("Received data:", data);

    // Валидация данных
    const validationResult = updateBuildingSchema.safeParse(data);
    if (!validationResult.success) {
      console.log("Validation error:", validationResult.error);
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error },
        { status: 400 }
      );
    }

    try {
      // Обновляем здание
      const updatedBuilding = await prisma.building.update({
        where: {
          id: buildingId,
          projectId: projectId
        },
        data: {
          ...(validationResult.data.name !== undefined && {
            name: validationResult.data.name
          }),
          ...(validationResult.data.description !== undefined && {
            description: validationResult.data.description
          }),
          ...(validationResult.data.floors !== undefined && {
            floors: validationResult.data.floors
          }),
          ...(validationResult.data.status !== undefined && {
            status: validationResult.data.status
          })
        },
        include: {
          media: true
        }
      });

      return NextResponse.json(updatedBuilding);
    } catch (error) {
      console.error("Database update error:", error);
      return NextResponse.json(
        { error: "Failed to update building" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Failed to update building" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; buildingId: string }> }
) {
  try {
    const awaitedParams = await params;
    const { id: projectId, buildingId } = awaitedParams;
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Проверяем существование проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Проверяем существование здания и его принадлежность к проекту
    const building = await prisma.building.findUnique({
      where: { id: buildingId },
      select: { projectId: true }
    });

    if (!building) {
      return NextResponse.json({ error: "Building not found" }, { status: 404 });
    }

    if (building.projectId !== projectId) {
      return NextResponse.json(
        { error: "Building does not belong to this project" },
        { status: 400 }
      );
    }

    // Удаляем здание (каскадное удаление настроено в схеме Prisma)
    await prisma.building.delete({
      where: {
        id: buildingId,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete building error:", error);
    return NextResponse.json(
      { error: "Failed to delete building" },
      { status: 500 }
    );
  }
}
