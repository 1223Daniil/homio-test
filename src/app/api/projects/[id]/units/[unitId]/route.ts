import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { translateText } from "@/utils/aiTranslator";
import { z } from "zod";

const updateUnitSchema = z.object({
  name: z.string().min(0).optional(),
  description: z.string().min(0).optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  floor: z.number().min(0).optional(),
  area: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD"]).optional(),
  layoutId: z.string().nullable().optional(),
  buildingId: z.string().optional(),
  layoutPlan: z.string().nullable().optional(),
  translations: z
    .object({
      name: z.string().min(0).optional(),
      description: z.string().min(0).optional()
    })
    .optional()
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  try {
    const awaitedParams = await params;
    const { id, unitId } = awaitedParams;
    const { searchParams } = new URL(request.url);
    const include = searchParams.get("include")?.split(",") || [];

    const unit = await prisma.unit.findUnique({
      where: {
        id: unitId
      },
      include: {
        media: include.includes("media"),
        layout: include.includes("layout"),
        floorPlan: include.includes("floorPlan"),
        building: include.includes("building")
          ? {
              include: {
                media: {
                  where: {
                    category: {
                      in: ["FLOOR_PLANS", "LAYOUT_PLANS"]
                    }
                  }
                }
              }
            }
          : false,
        project: include.includes("project")
          ? {
              include: {
                translations: true,
                media: true,
                location: true,
                PurchaseConditions: true,
                paymentStages: true,
                agentCommissions: true,
                cashbackBonuses: true,
                additionalExpenses: true
              }
            }
          : false
      }
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    if (unit.projectId !== id) {
      return NextResponse.json(
        { error: "Unit does not belong to this project" },
        { status: 400 }
      );
    }

    return NextResponse.json(unit);
  } catch (error) {
    console.error("Error fetching unit:", error);
    return NextResponse.json(
      { error: "Failed to fetch unit" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  try {
    const awaitedParams = await params;
    const { id, unitId } = awaitedParams;

    const data = await request.json();

    // Убедимся, что строковые поля никогда не будут null
    const sanitizedData = {
      ...data,
      name: data.name || "",
      description: data.description || "",
      translations: data.translations
        ? {
            ...data.translations,
            name: data.translations.name || "",
            description: data.translations.description || ""
          }
        : undefined
    };

    // Validate data using schema
    const validationResult = updateUnitSchema.safeParse(sanitizedData);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation error", details: validationResult.error },
        { status: 400 }
      );
    }

    // Check if unit exists and belongs to the project
    const existingUnit = await prisma.unit.findUnique({
      where: { id: unitId }
    });

    if (!existingUnit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    if (existingUnit.projectId !== id) {
      return NextResponse.json(
        { error: "Unit does not belong to this project" },
        { status: 400 }
      );
    }

    // Создаем объект с необходимыми данными
    const updateFields: Record<string, any> = {};

    // Названия полей, которые мы хотим обновить
    const fieldsToUpdate = [
      "name",
      "description",
      "bedrooms",
      "bathrooms",
      "floor",
      "area",
      "price",
      "status",
      "buildingId"
    ];

    // Добавляем только те поля, которые есть в запросе
    for (const field of fieldsToUpdate) {
      if (field in sanitizedData && sanitizedData[field] !== undefined) {
        updateFields[field] = sanitizedData[field];
      }
    }

    // Обрабатываем layoutId и layoutPlan
    if (sanitizedData.layoutId !== undefined) {
      console.log("Setting layoutId to:", sanitizedData.layoutId);
      if (sanitizedData.layoutId === null) {
        updateFields.layout = {
          disconnect: true
        };
      } else {
        updateFields.layout = {
          connect: {
            id: sanitizedData.layoutId
          }
        };
      }
    }

    // Обрабатываем buildingId
    if (sanitizedData.buildingId !== undefined) {
      console.log("Setting buildingId to:", sanitizedData.buildingId);
      if (sanitizedData.buildingId === null) {
        updateFields.building = {
          disconnect: true
        };
      } else {
        updateFields.building = {
          connect: {
            id: sanitizedData.buildingId
          }
        };
      }
    }

    // Получаем переводы
    if (sanitizedData.translations) {
      try {
        // Преобразуем переводы в формат JSON для сохранения
        const translationsArray = Array.isArray(sanitizedData.translations)
          ? sanitizedData.translations
          : [
              {
                locale: "en",
                name:
                  sanitizedData.translations.name || sanitizedData.name || "",
                description:
                  sanitizedData.translations.description ||
                  sanitizedData.description ||
                  ""
              },
              {
                locale: "ru",
                name:
                  sanitizedData.translations.name || sanitizedData.name || "",
                description:
                  sanitizedData.translations.description ||
                  sanitizedData.description ||
                  ""
              }
            ];

        console.log(
          "Extracted JSON string:",
          JSON.stringify(translationsArray)
        );

        // Закомментируем эту часть кода, чтобы сохранить текущую работоспособность API-маршрута
        // updateFields.translations = translationsArray;
      } catch (error) {
        console.error("Error processing translations:", error);
      }
    }

    // Update unit with validated data
    const updatedUnit = await prisma.unit.update({
      where: { id: unitId },
      data: updateFields,
      include: {
        project: {
          include: {
            media: true,
            amenities: true,
            location: true,
            yield: true
          }
        },
        building: {
          include: {
            media: true
          }
        }
      }
    });

    return NextResponse.json(updatedUnit);
  } catch (error) {
    console.error("Error updating unit:", error);
    return NextResponse.json(
      {
        error: "Failed to update unit",
        details: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : null
            : null
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  try {
    const awaitedParams = await params;
    const { id, unitId } = awaitedParams;
    const data = await request.json();

    // Проверяем, что данные не пустые
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400
      });
    }

    // Мы уже проверили длину массива выше, поэтому entries[0] существует
    const entry = entries[0] as [string, unknown];
    const field = entry[0];
    const value = entry[1];

    console.log("Updating unit field:", { field, value });

    // Специальная обработка для полей, требующих связывания с другими таблицами
    if (field === "layoutId") {
      const updateData =
        value === null
          ? { layout: { disconnect: true } }
          : { layout: { connect: { id: value as string } } };

      const unit = await prisma.unit.update({
        where: { id: unitId },
        data: updateData,
        include: {
          project: {
            include: {
              location: true,
              media: true,
              amenities: true,
              yield: true
            }
          },
          building: {
            include: {
              media: true
            }
          }
        }
      });

      console.log("Updated unit:", unit);
      return new Response(JSON.stringify(unit));
    }

    // Специальная обработка для поля buildingId
    if (field === "buildingId") {
      const updateData =
        value === null
          ? { building: { disconnect: true } }
          : { building: { connect: { id: value as string } } };

      const unit = await prisma.unit.update({
        where: { id: unitId },
        data: updateData,
        include: {
          project: {
            include: {
              location: true,
              media: true,
              amenities: true,
              yield: true
            }
          },
          building: {
            include: {
              media: true
            }
          }
        }
      });

      console.log("Updated unit with new building:", unit);
      return new Response(JSON.stringify(unit));
    }

    const unit = await prisma.unit.update({
      where: {
        id: unitId
      },
      data: {
        [field]: value
      },
      include: {
        project: {
          include: {
            location: true,
            media: true,
            amenities: true,
            yield: true
          }
        },
        building: {
          include: {
            media: true
          }
        }
      }
    });

    console.log("Updated unit:", unit);
    return new Response(JSON.stringify(unit));
  } catch (error) {
    console.error("Error updating unit:", error);

    if (error instanceof Error) {
      return new Response(
        JSON.stringify({
          error: "Failed to update unit",
          details: error.message
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ error: "Failed to update unit" }), {
      status: 500
    });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  try {
    const awaitedParams = await params;
    const { id, unitId } = awaitedParams;

    // Проверяем существование юнита
    const unit = await prisma.unit.findUnique({
      where: { id: unitId }
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    if (unit.projectId !== id) {
      return NextResponse.json(
        { error: "Unit does not belong to this project" },
        { status: 400 }
      );
    }

    // Удаляем юнит
    await prisma.unit.delete({
      where: { id: unitId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting unit:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to delete unit", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete unit" },
      { status: 500 }
    );
  }
}
