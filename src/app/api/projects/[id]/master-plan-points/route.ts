import { NextRequest, NextResponse } from "next/server";

import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

// GET - получение точек
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await context.params;
    const { id } = awaitedParams;
    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Получаем информацию о проекте
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        completionDate: true,
        constructionStatus: true,
        phase: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const points = await prisma.masterPlanPoint.findMany({
      where: { projectId: id },
      include: {
        building: {
          include: {
            floorPlans: true,
            units: {
              include: {
                layout: true
              }
            }
          }
        }
      }
    });

    // Добавляем информацию о проекте к каждой точке
    const pointsWithProjectInfo = points.map(point => ({
      ...point,
      building: point.building
        ? {
            ...point.building,
            project: project
          }
        : null
    }));

    return NextResponse.json(pointsWithProjectInfo);
  } catch (error) {
    console.error("Error fetching master plan points:", error);
    return NextResponse.json(
      { error: "Failed to fetch master plan points" },
      { status: 500 }
    );
  }
}

// POST - создание/обновление точек
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await context.params;
    const { id } = awaitedParams;
    await requireRole([UserRole.ADMIN, UserRole.DEVELOPER]);

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const points = await request.json();
    if (!Array.isArray(points)) {
      return NextResponse.json(
        { error: "Points must be an array" },
        { status: 400 }
      );
    }

    // Delete existing points
    await prisma.masterPlanPoint.deleteMany({
      where: { projectId: id }
    });

    // Create new points
    const createdPoints = await prisma.masterPlanPoint.createMany({
      data: points.map(point => ({
        ...point,
        projectId: id
      }))
    });

    return NextResponse.json(createdPoints);
  } catch (error) {
    console.error("Error updating master plan points:", error);
    return NextResponse.json(
      { error: "Failed to update master plan points" },
      { status: 500 }
    );
  }
}
