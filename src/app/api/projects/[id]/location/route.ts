import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("DATA", data);
    const { location } = data;

    // Создаем локацию и связываем с проектом в одной транзакции
    const updatedProject = await prisma.$transaction(async tx => {
      const newLocation = await tx.location.create({
        data: {
          country: location.country,
          city: location.city,
          district: location.district,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          beachDistance: location.beachDistance,
          centerDistance: location.centerDistance
        }
      });

      console.log("New location created:", newLocation);

      // Обновляем проект, связывая его с новой локацией
      const updatedProject = await tx.project.update({
        where: { id: awaitedParams.id },
        data: { locationId: newLocation.id },
        include: {
          location: true,
          media: true,
          documents: true,
          amenities: true
        }
      });

      console.log("Project updated with new location:", updatedProject);

      return updatedProject;
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Failed to create location:", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const awaitedParams = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { location } = data;

    if (!location || typeof location !== "object") {
      return NextResponse.json(
        { error: "Данные о локации обязательны" },
        { status: 400 }
      );
    }

    // Получаем проект для проверки locationId
    const project = await prisma.project.findUnique({
      where: { id: awaitedParams.id },
      select: { locationId: true }
    });

    console.log("project", project);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let updatedProject;

    if (project.locationId) {
      // Если у проекта уже есть местоположение, обновляем его
      const updatedLocation = await prisma.location.update({
        where: { id: project.locationId },
        data: {
          country: location.country,
          city: location.city,
          district: location.district,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          beachDistance: location.beachDistance,
          centerDistance: location.centerDistance
        }
      });

      // Получаем обновленный проект со всеми связанными данными
      updatedProject = await prisma.project.findUnique({
        where: { id: awaitedParams.id },
        include: {
          location: true,
          media: true,
          documents: true,
          amenities: true
        }
      });
    } else {
      // Если у проекта нет местоположения, создаем новое и связываем с проектом
      updatedProject = await prisma.$transaction(async tx => {
        const newLocation = await tx.location.create({
          data: {
            country: location.country,
            city: location.city,
            district: location.district,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            beachDistance: location.beachDistance,
            centerDistance: location.centerDistance
          }
        });

        return tx.project.update({
          where: { id: awaitedParams.id },
          data: { locationId: newLocation.id },
          include: {
            location: true,
            media: true,
            documents: true,
            amenities: true
          }
        });
      });
    }

    console.log("Updated project:", updatedProject);

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Failed to update location:", {
      error,
      projectId: awaitedParams.id,
      context: "location_update",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      {
        error: "Failed to update location",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Сначала получаем проект для получения locationId
    const project = await prisma.project.findUnique({
      where: { id: awaitedParams.id },
      select: { locationId: true }
    });

    if (!project?.locationId) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    const location = await prisma.location.findUnique({
      where: { id: project.locationId }
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error("Failed to fetch location:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}
