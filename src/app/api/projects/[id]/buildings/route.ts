import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/projects/:id/buildings
 * Получение списка зданий проекта
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Проверка аутентификации
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const awaitedParams = await params;
    const projectId = awaitedParams.id;
    
    // Проверка существования проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }
    
    // Получение списка зданий
    const buildings = await prisma.building.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: { units: true }
        }
      }
    });
    
    return NextResponse.json(buildings);
    
  } catch (error) {
    console.error("Error fetching buildings:", error);
    return NextResponse.json(
      { error: "Failed to fetch buildings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/:id/buildings
 * Создание нового здания в проекте
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Проверка аутентификации
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const awaitedParams = await params;
    const projectId = awaitedParams.id;
    
    // Проверка существования проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }
    
    const body = await request.json();

    const building = await prisma.building.create({
      data: {
        name: body.name,
        floors: body.floors,
        status: body.status,
        description: body.description,
        projectId: projectId
      }
    });

    return NextResponse.json(building);
  } catch (error) {
    console.error("Error creating building:", error);
    return NextResponse.json(
      { error: "Failed to create building" },
      { status: 500 }
    );
  }
}
