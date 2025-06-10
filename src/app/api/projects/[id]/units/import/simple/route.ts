import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Проверка API токена
const API_TOKEN = process.env.UNITS_IMPORT_API_TOKEN || "9a7b3c5d1e8f2g4h6j0k";

// Схема валидации для простого импорта
const simpleImportSchema = z.object({
  data: z
    .array(
      z.object({
        unit_number: z.string(),
        floor_number: z.number().optional(),
        building: z.string().optional(),
        availability_status: z.string().optional(),
        selling_price: z.number().optional()
      })
    )
    .min(1, "At least one unit is required"),
  updateExisting: z.boolean().default(false),
  defaultBuildingId: z.string().nullable().optional(),
  currency: z.string().optional(),
  priceUpdateDate: z.string().optional()
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("Starting simple import process");

    // Проверка API токена
    const authHeader = request.headers.get("x-api-token");
    console.log("API token check:", {
      headerPresent: !!authHeader,
      envTokenPresent: !!API_TOKEN,
      isMatch: authHeader === API_TOKEN
    });

    if (!API_TOKEN || authHeader !== API_TOKEN) {
      console.log("Authentication failed: Invalid API token");
      return NextResponse.json(
        { error: "unauthorized", message: "Invalid API token" },
        { status: 401 }
      );
    }

    const awaitedParams = await params;
    const projectId = awaitedParams.id;
    console.log("Project ID from params:", projectId);

    // Проверяем существование проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { buildings: true }
    });

    if (!project) {
      console.log(`Project with ID ${projectId} not found`);
      return NextResponse.json(
        {
          error: "notFound",
          message: `Project with ID ${projectId} not found`
        },
        { status: 404 }
      );
    }

    console.log("Project found:", {
      projectId: project.id,
      buildingsCount: project.buildings?.length || 0
    });

    // Получаем тело запроса
    let body;
    try {
      body = await request.json();
      console.log("Request body parsed successfully");
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: "invalidJson", message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Валидируем данные
    const validationResult = simpleImportSchema.safeParse(body);
    console.log("Validation result:", {
      success: validationResult.success,
      errors: !validationResult.success ? validationResult.error.format() : null
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "validationError",
          message: "Invalid data",
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const {
      data,
      updateExisting,
      defaultBuildingId,
      currency,
      priceUpdateDate
    } = validationResult.data;
    console.log("Validated data:", {
      dataLength: data.length,
      updateExisting,
      defaultBuildingId,
      currency,
      priceUpdateDate
    });

    // Создаем карту зданий для быстрого поиска по имени
    const buildingMap = new Map<string, string>();
    project.buildings.forEach(building => {
      if (building.name) {
        buildingMap.set(building.name.toLowerCase(), building.id);
      }
    });

    // Результаты импорта
    const results = {
      totalProcessed: data.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[]
    };

    // Создаем запись об импорте
    const importRecord = await prisma.unitImport.create({
      data: {
        projectId,
        importedBy: "system",
        currency: currency || null,
        priceUpdateDate: priceUpdateDate ? new Date(priceUpdateDate) : null,
        totalUnits: data.length,
        createdUnits: 0,
        updatedUnits: 0,
        skippedUnits: 0,
        rawData: JSON.stringify(data),
        processed: true
      }
    });

    // Обрабатываем юниты в транзакции
    await prisma.$transaction(
      async tx => {
        for (const unit of data) {
          try {
            // Находим ID здания
            let buildingId = defaultBuildingId;
            if (unit.building) {
              const buildingName = String(unit.building).toLowerCase();
              if (buildingMap.has(buildingName)) {
                const mappedBuildingId = buildingMap.get(buildingName);
                if (mappedBuildingId) {
                  buildingId = mappedBuildingId;
                }
              }
            }

            // Если здание не найдено, используем первое здание проекта
            if (
              !buildingId &&
              project.buildings.length > 0 &&
              project.buildings[0]
            ) {
              buildingId = project.buildings[0].id;
            }

            // Определяем статус доступности
            let status: "AVAILABLE" | "RESERVED" | "SOLD" = "AVAILABLE";
            if (unit.availability_status) {
              const normalizedStatus = String(
                unit.availability_status
              ).toLowerCase();
              if (
                normalizedStatus.includes("sold") ||
                normalizedStatus === "sold out"
              ) {
                status = "SOLD";
              } else if (
                normalizedStatus.includes("reserved") ||
                normalizedStatus.includes("booked")
              ) {
                status = "RESERVED";
              }
            }

            // Проверяем, существует ли юнит
            const existingUnit = await tx.unit.findFirst({
              where: {
                projectId,
                number: String(unit.unit_number),
                ...(buildingId ? { buildingId } : {})
              }
            });

            if (existingUnit && updateExisting) {
              // Обновляем существующий юнит
              await tx.unit.update({
                where: { id: existingUnit.id },
                data: {
                  ...(unit.floor_number !== undefined
                    ? { floor: unit.floor_number }
                    : {}),
                  ...(buildingId ? { buildingId } : {}),
                  status,
                  ...(unit.selling_price !== undefined
                    ? { price: unit.selling_price }
                    : {})
                }
              });

              results.updated++;
            } else if (!existingUnit) {
              // Создаем новый юнит
              await tx.unit.create({
                data: {
                  projectId,
                  number: String(unit.unit_number),
                  floor: unit.floor_number || 0,
                  ...(buildingId ? { buildingId } : {}),
                  status,
                  price: unit.selling_price || 0
                }
              });

              results.created++;
            } else {
              // Пропускаем, если юнит существует и updateExisting = false
              results.skipped++;
            }
          } catch (error) {
            console.error("Error processing unit:", error, unit);
            results.errors.push(`Error processing unit: ${error}`);
            results.skipped++;
          }
        }

        // Обновляем запись об импорте
        await tx.unitImport.update({
          where: { id: importRecord.id },
          data: {
            createdUnits: results.created,
            updatedUnits: results.updated,
            skippedUnits: results.skipped
          }
        });
      },
      { timeout: 60000 }
    );

    return NextResponse.json({
      success: true,
      status: "processed",
      data: results
    });
  } catch (error) {
    console.error("Error in simple import:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      return NextResponse.json(
        {
          error: "serverError",
          message: "Server error",
          details: {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        },
        { status: 500 }
      );
    } else {
      console.error("Non-Error object thrown:", error);
      return NextResponse.json(
        {
          error: "serverError",
          message: "Server error",
          details: String(error)
        },
        { status: 500 }
      );
    }
  }
}
