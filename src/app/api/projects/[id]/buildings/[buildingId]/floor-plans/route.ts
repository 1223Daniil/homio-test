import { NextRequest, NextResponse } from "next/server";

import { BuildingMediaCategory } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { handleBuildingFileUpload } from "@/lib/upload";
import { prisma } from "@/lib/prisma";

// Helper function to safely parse SVG data
function parseSvgData(svgData: string | null): any[] {
  if (!svgData) return [];

  try {
    // Check if the data is a JSON string or SVG string
    if (svgData.startsWith("[")) {
      return JSON.parse(svgData);
    } else if (svgData.startsWith("<svg")) {
      // If it's an SVG string, return empty array
      return [];
    } else {
      console.error("Invalid SVG data format");
      return [];
    }
  } catch (error) {
    console.error("Error parsing SVG data:", error);
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; buildingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ожидаем разрешения params, так как это Promise в Next.js 15
    const awaitedParams = await params;
    const { buildingId } = awaitedParams;

    // Ensure params are available
    if (!buildingId) {
      return NextResponse.json(
        { error: "Building ID is required" },
        { status: 400 }
      );
    }

    const floorPlans = await prisma.floorPlan.findMany({
      where: {
        buildingId
      },
      include: {
        units: true,
        areas: true
      },
      orderBy: {
        floorNumber: "asc"
      }
    });

    // Process floor plans to ensure valid SVG data
    const processedFloorPlans = floorPlans.map(fp => ({
      ...fp,
      svgData: JSON.stringify(parseSvgData(fp.svgData))
    }));

    return NextResponse.json(processedFloorPlans);
  } catch (error) {
    console.error("Error fetching floor plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch floor plans" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; buildingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ожидаем разрешения params, так как это Promise в Next.js 15
    const awaitedParams = await params;
    const { buildingId } = awaitedParams;

    const formData = await request.formData();
    const fileUrl = formData.get("fileUrl") as string;
    const floorNumber = parseInt(formData.get("floorNumber") as string);
    const fileName = (formData.get("fileName") as string) || "Floor plan";

    if (!fileUrl) {
      return NextResponse.json(
        { error: "No file URL provided" },
        { status: 400 }
      );
    }

    if (isNaN(floorNumber)) {
      return NextResponse.json(
        { error: "Invalid floor number" },
        { status: 400 }
      );
    }

    // Check if floor plan already exists - делаем более надежную проверку
    try {
      const existingFloorPlan = await prisma.floorPlan.findFirst({
        where: {
          buildingId: buildingId,
          floorNumber
        }
      });

      if (existingFloorPlan) {
        console.log(
          `Floor plan already exists for building ${buildingId}, floor ${floorNumber}`
        );
        return NextResponse.json(
          { error: "План этажа уже существует для этого этажа" },
          { status: 400 }
        );
      }

      try {
        // Create floor plan - оборачиваем в отдельный try-catch для отлова ошибок уникальности
        const floorPlan = await prisma.floorPlan.create({
          data: {
            buildingId: buildingId,
            floorNumber,
            imageUrl: fileUrl,
            name: `Floor ${floorNumber}`,
            status: "DRAFT"
          }
        });

        return NextResponse.json(floorPlan);
      } catch (dbError: any) {
        console.error("Database error creating floor plan:", dbError);

        // Проверяем, является ли ошибка нарушением ограничения уникальности
        if (
          dbError.code === "P2002" ||
          (dbError.message &&
            dbError.message.includes("Unique constraint failed"))
        ) {
          return NextResponse.json(
            { error: "План этажа с таким номером уже существует" },
            { status: 400 }
          );
        }

        // Другие ошибки базы данных
        return NextResponse.json(
          { error: "Не удалось создать план этажа: ошибка базы данных" },
          { status: 500 }
        );
      }
    } catch (checkError: any) {
      console.error("Error checking for existing floor plan:", checkError);
      return NextResponse.json(
        { error: "Не удалось проверить существующие планы этажей" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error creating floor plan:", {
      error,
      message: error instanceof Error ? error.message : "Неизвестная ошибка",
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: "Не удалось создать план этажа" },
      { status: 500 }
    );
  }
}
