import { NextRequest, NextResponse } from "next/server";

import { UnitStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { processUnitImport } from "./utils";
import { z } from "zod";

// API токен для автоматизированного импорта
const API_TOKEN = process.env.UNITS_IMPORT_API_TOKEN || "9a7b3c5d1e8f2g4h6j0k";

// Helper function to normalize field names (convert from any format to our standard format)
function normalizeFieldName(fieldName: string): string {
  // Convert to lowercase and remove spaces and special characters
  const normalized = fieldName
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[()]/g, "")
    .replace(/_+/g, "_");

  // Map common field names to our standard format
  const fieldMap: Record<string, string> = {
    unit_number: "unit_number",
    floor: "floor_number",
    floor_number: "floor_number",
    building: "building",
    availability_status: "availability_status",
    base_price_excl_vat: "base_price_excl_vat",
    base_price_excluding_vat: "base_price_excl_vat",
    final_price_incl_vat: "final_price_incl_vat",
    final_price_including_vat: "final_price_incl_vat",
    selling_price: "selling_price",
    discount_price: "discount_price",
    unit_description: "unit_description",
    comment: "comment",
    view: "view_description",
    view_description: "view_description",
    layout_id: "layout_id",
    ownership: "ownership"
  };

  return fieldMap[normalized] || normalized;
}

// Helper function to parse price values
function parsePrice(price: any): number | undefined {
  if (
    price === undefined ||
    price === null ||
    price === "" ||
    price === "NA" ||
    price === "N/A" ||
    price === "-"
  ) {
    return undefined;
  }

  if (typeof price === "number") {
    return price;
  }

  // Convert string to number, removing commas and other non-numeric characters
  const priceString = String(price).replace(/[^\d.-]/g, "");
  const parsedPrice = parseFloat(priceString);

  return isNaN(parsedPrice) ? undefined : parsedPrice;
}

// Keywords for smart field mapping
const FIELD_KEYWORDS: Record<string, string[]> = {
  unit_number: [
    "number",
    "unit number",
    "unit",
    "unit no",
    "no",
    "номер",
    "№",
    "unit id",
    "id"
  ],
  floor_number: [
    "floor",
    "этаж",
    "level",
    "floor number",
    "floor no",
    "storey",
    "story"
  ],
  building: ["building", "здание", "tower", "block", "корпус", "башня", "блок"],
  layout_id: [
    "layout",
    "layout id",
    "layout type",
    "type id",
    "plan id",
    "планировка"
  ],
  availability_status: [
    "status",
    "статус",
    "availability",
    "доступность",
    "unit status",
    "available"
  ],
  base_price_excl_vat: [
    "base price",
    "price excl vat",
    "price excluding vat",
    "base",
    "цена без ндс"
  ],
  final_price_incl_vat: [
    "final price",
    "price incl vat",
    "price including vat",
    "final",
    "цена с ндс"
  ],
  selling_price: [
    "selling price",
    "sale price",
    "price",
    "цена",
    "стоимость",
    "cost"
  ],
  discount_price: [
    "discount",
    "sale price",
    "скидка",
    "цена со скидкой",
    "special price",
    "promo price"
  ],
  unit_description: [
    "description",
    "desc",
    "описание",
    "unit description",
    "about"
  ],
  view_description: [
    "view",
    "вид",
    "окна",
    "window view",
    "unit view",
    "facing",
    "outlook"
  ],
  comment: [
    "comment",
    "note",
    "комментарий",
    "примечание",
    "заметка",
    "notes",
    "remarks"
  ],
  area: [
    "area",
    "площадь",
    "size",
    "total area",
    "total size",
    "sqm",
    "м²",
    "sq.m",
    "per sqm",
    "per m2",
    "m2",
    "square meter",
    "square meters",
    "sq meter",
    "sq meters",
    "квм",
    "кв.м",
    "кв м"
  ],
  bedrooms: [
    "bedrooms",
    "beds",
    "спальни",
    "комнаты",
    "bed",
    "br",
    "bedroom",
    "bd"
  ],
  bathrooms: [
    "bathrooms",
    "baths",
    "ванные",
    "санузлы",
    "bath",
    "ba",
    "bathroom",
    "wc",
    "toilet"
  ],
  ownership: [
    "ownership",
    "владение",
    "own type",
    "тип владения",
    "tenure",
    "freehold",
    "leasehold"
  ]
};

/**
 * Find matching field based on header name
 * Uses multiple strategies to find the best match
 */
const findMatchingField = (header: string): string | null => {
  // Normalize the header by removing special characters and extra spaces
  const normalizedHeader = header
    .toLowerCase()
    .replace(/[^a-zа-я0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  // First try exact matches
  for (const [field, keywords] of Object.entries(FIELD_KEYWORDS)) {
    const normalizedKeywords = keywords.map(k =>
      k
        .toLowerCase()
        .replace(/[^a-zа-я0-9\s]/gi, " ")
        .replace(/\s+/g, " ")
        .trim()
    );

    if (normalizedKeywords.includes(normalizedHeader)) {
      return field;
    }
  }

  // Then try partial matches
  for (const [field, keywords] of Object.entries(FIELD_KEYWORDS)) {
    // Sort keywords by length (descending) to match longer phrases first
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

    if (
      sortedKeywords.some(keyword => {
        const normalizedKeyword = keyword
          .toLowerCase()
          .replace(/[^a-zа-я0-9\s]/gi, " ")
          .replace(/\s+/g, " ")
          .trim();

        // Check if the header contains the keyword or vice versa
        return (
          normalizedHeader.includes(normalizedKeyword) ||
          normalizedKeyword.includes(normalizedHeader)
        );
      })
    ) {
      return field;
    }
  }

  // Try matching by word parts
  const headerWords = normalizedHeader.split(" ");
  for (const [field, keywords] of Object.entries(FIELD_KEYWORDS)) {
    for (const keyword of keywords) {
      const keywordWords = keyword
        .toLowerCase()
        .replace(/[^a-zа-я0-9\s]/gi, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ");

      // Check if any word from the header matches any word from the keyword
      if (
        headerWords.some(hw =>
          keywordWords.some(
            kw => hw === kw || kw.includes(hw) || hw.includes(kw)
          )
        )
      ) {
        return field;
      }
    }
  }

  return null;
};

// Define validation schema for unit data in the new format
const UnitSchema = z.object({}).catchall(z.any()); // Accept any fields, we'll normalize them later

// Define schema for the import request
const ImportRequestSchema = z.object({
  projectId: z.string().optional(),
  currency: z.string().optional(),
  priceUpdateDate: z.string().optional(),
  data: z.array(UnitSchema),
  updateExisting: z.boolean().default(true),
  defaultBuildingId: z.string().nullable().optional(),
  apiKey: z.string().optional()
});

// Схема валидации для автоматического импорта
const automatedImportSchema = z.object({
  data: z.array(z.record(z.any())).min(1, "At least one unit is required"),
  updateExisting: z.boolean().default(false),
  defaultBuildingId: z.string().nullable().optional(),
  currency: z.string().optional(),
  priceUpdateDate: z.string().optional(),
  fieldMappingId: z.string().optional()
});

// Функция для создания версии юнита
async function createUnitVersion(
  tx: any,
  unit: any,
  unitId: string,
  importId: string,
  buildingId: string,
  status: UnitStatus,
  metadata?: any
) {
  return tx.unitVersion.create({
    data: {
      unitId,
      importId,
      number: String(unit.unit_number),
      floor: unit.floor_number || 0,
      buildingId,
      price: parsePrice(
        unit.base_price_excl_vat ||
          unit.final_price_incl_vat ||
          unit.selling_price
      ),
      pricePerSqm: parsePrice(unit.price_per_sqm),
      status,
      area: unit.area ? parseFloat(String(unit.area)) : null,
      description: unit.unit_description,
      windowView: unit.view_description,
      metadata: metadata || {
        originalData: unit
      }
    }
  });
}

// Функция для обработки импорта юнитов
async function processImport(
  projectId: string,
  data: any[],
  updateExisting: boolean,
  defaultBuildingId?: string | null,
  currency?: string,
  priceUpdateDate?: string
) {
  // Результаты импорта
  const results = {
    totalProcessed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    markedAsSold: 0,
    warnings: [] as string[],
    errors: [] as string[]
  };

  try {
    // Получаем проект и его здания
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { buildings: true }
    });

    if (!project) {
      results.errors.push(`Project with ID ${projectId} not found`);
      return results;
    }

    // Создаем карту зданий для быстрого поиска по имени
    const buildingMap = new Map<string, string>();
    project.buildings.forEach(building => {
      if (building.name) {
        buildingMap.set(building.name.toLowerCase(), building.id);
      }
    });

    // Получаем пользователя с ролью ADMIN для использования в качестве userId
    const adminUser = await prisma.user.findFirst({
      where: {
        role: {
          name: "ADMIN"
        }
      }
    });

    // Если не нашли админа, используем первого пользователя
    const firstUser = adminUser || (await prisma.user.findFirst());

    if (!firstUser) {
      results.errors.push("No users found in the database");
      return results;
    }

    // Создаем запись об импорте
    let importRecord;
    try {
      importRecord = await prisma.unitImport.create({
        data: {
          projectId,
          importedBy: firstUser.id,
          currency: currency || null,
          priceUpdateDate: priceUpdateDate ? new Date(priceUpdateDate) : null,
          totalUnits: data.length,
          createdUnits: 0,
          updatedUnits: 0,
          skippedUnits: 0,
          rawData: JSON.stringify(data)
        }
      });
    } catch (createError) {
      results.errors.push(
        `Error creating import record: ${createError instanceof Error ? createError.message : String(createError)}`
      );
      return results;
    }

    // Обрабатываем юниты в транзакции
    try {
      await prisma.$transaction(
        async tx => {
          // 1. Создаем Map из импортируемых юнитов для быстрого поиска
          const importUnitMap = new Map();
          data.forEach(unit => {
            if (unit.unit_number) {
              importUnitMap.set(String(unit.unit_number), unit);
            }
          });

          console.log("Import units map size:", importUnitMap.size);

          // 2. Получаем все существующие активные юниты проекта
          const existingUnits = await tx.unit.findMany({
            where: {
              projectId,
              status: {
                not: "SOLD"
              }
            }
          });

          console.log("Existing active units:", existingUnits.length);

          // 3. Помечаем отсутствующие юниты как проданные
          for (const existingUnit of existingUnits) {
            if (!importUnitMap.has(existingUnit.number)) {
              console.log(
                `Marking unit ${existingUnit.number} as SOLD (not found in import)`
              );

              // Обновляем статус юнита
              const updatedUnit = await tx.unit.update({
                where: { id: existingUnit.id },
                data: {
                  status: "SOLD",
                  updatedAt: new Date()
                }
              });

              // Создаем версию для юнита со статусом SOLD
              await createUnitVersion(
                tx,
                {
                  unit_number: existingUnit.number,
                  floor_number: existingUnit.floor,
                  building: existingUnit.buildingId,
                  status: "SOLD"
                },
                existingUnit.id,
                importRecord.id,
                existingUnit.buildingId,
                "SOLD",
                {
                  originalData: existingUnit,
                  changes: {
                    before: existingUnit,
                    after: updatedUnit
                  },
                  updateType: "UPDATE"
                }
              );

              results.markedAsSold++;
            }
          }

          // 4. Обрабатываем импортируемые юниты
          for (const unit of data) {
            try {
              // Проверяем наличие номера юнита
              if (!unit.unit_number) {
                results.skipped++;
                results.errors.push(`Unit without unit_number skipped`);
                continue;
              }

              // Находим ID здания
              let buildingId = defaultBuildingId;
              if (unit.building) {
                const buildingName = String(unit.building).toLowerCase();
                if (buildingMap.has(buildingName)) {
                  const mappedBuildingId = buildingMap.get(buildingName);
                  if (mappedBuildingId) {
                    buildingId = mappedBuildingId;
                  }
                } else {
                  // Пытаемся найти частичное совпадение
                  for (const [name, id] of Array.from(buildingMap.entries())) {
                    if (
                      buildingName.includes(name) ||
                      name.includes(buildingName)
                    ) {
                      buildingId = id;
                      break;
                    }
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

              // Если здание все еще не найдено, пропускаем юнит
              if (!buildingId) {
                results.skipped++;
                results.errors.push(
                  `Unit ${unit.unit_number} skipped: no building found`
                );
                continue;
              }

              // Проверяем существование здания
              const buildingExists = await tx.building.findUnique({
                where: { id: buildingId }
              });

              if (!buildingExists) {
                results.skipped++;
                results.errors.push(
                  `Unit ${unit.unit_number} skipped: building with ID ${buildingId} not found`
                );
                continue;
              }

              // Проверяем layout_id, если он указан
              if (unit.layout_id) {
                try {
                  // Сначала ищем планировку по id
                  let layoutExists = await tx.unitLayout.findFirst({
                    where: {
                      id: unit.layout_id,
                      projectId: projectId
                    }
                  });

                  // Если не нашли по id, пробуем найти по имени
                  if (!layoutExists) {
                    layoutExists = await tx.unitLayout.findFirst({
                      where: {
                        name: unit.layout_id,
                        projectId: projectId
                      }
                    });

                    if (layoutExists) {
                      // Заменяем layout_id на найденный id
                      unit.layout_id = layoutExists.id;
                    }
                  }

                  // Если планировка не найдена, устанавливаем null
                  if (!layoutExists) {
                    unit.layout_id = null;

                    // Получаем список всех доступных планировок для информации
                    const availableLayouts = await tx.unitLayout.findMany({
                      where: { projectId },
                      select: { id: true, name: true }
                    });

                    const warningMessage = `Unit ${unit.unit_number}: layout with ID/name "${unit.layout_id}" not found in this project. Available layouts: ${availableLayouts.map(l => `"${l.name}"`).join(", ") || "none"}`;
                    results.warnings.push(warningMessage);
                  }
                } catch (error) {
                  // В случае ошибки при поиске планировки, устанавливаем null
                  unit.layout_id = null;
                  results.warnings.push(
                    `Error finding layout for unit ${unit.unit_number}: ${error.message}`
                  );
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

              // Парсим числовые значения
              const parsePrice = (value: any): number | undefined => {
                if (
                  value === undefined ||
                  value === null ||
                  value === "" ||
                  value === "NA" ||
                  value === "N/A" ||
                  value === "-"
                ) {
                  return undefined;
                }

                if (typeof value === "number") {
                  return value;
                }

                // Преобразуем строку в число, удаляя запятые и другие нечисловые символы
                const priceString = String(value).replace(/[^\d.-]/g, "");
                const parsedPrice = parseFloat(priceString);

                return isNaN(parsedPrice) ? undefined : parsedPrice;
              };

              const basePrice = parsePrice(unit.base_price_excl_vat);
              const finalPrice = parsePrice(unit.final_price_incl_vat);
              const sellingPrice = parsePrice(unit.selling_price);
              const discountPrice = parsePrice(unit.discount_price);

              // Нормализуем номер этажа
              let floorNumber: number | undefined = undefined;
              if (unit.floor_number !== undefined) {
                const parsedFloor = parseInt(String(unit.floor_number), 10);
                if (!isNaN(parsedFloor)) {
                  floorNumber = parsedFloor;
                }
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

              if (existingUnit && updateExisting) {
                // Обновляем существующий юнит

                // Генерируем слаг для юнита
                const unitNumber = String(unit.unit_number);
                const floor = floorNumber || existingUnit.floor;
                const uniqueSuffix = Math.random().toString(36).substring(2, 7);
                const slugBase = `floor-${floor}-unit-${unitNumber}-${uniqueSuffix}`;

                const updatedUnit = await tx.unit.update({
                  where: { id: existingUnit.id },
                  data: {
                    ...(floorNumber !== undefined
                      ? { floor: floorNumber }
                      : {}),
                    ...(buildingId ? { buildingId } : {}),
                    ...(unit.layout_id ? { layoutId: unit.layout_id } : {}),
                    status,
                    slug: slugBase,
                    price:
                      basePrice ||
                      finalPrice ||
                      sellingPrice ||
                      existingUnit.price,
                    ...(discountPrice !== undefined ? { discountPrice } : {}),
                    ...(unit.unit_description
                      ? { description: unit.unit_description }
                      : {}),
                    ...(unit.view_description
                      ? { view: unit.view_description }
                      : {}),
                    ...(unit.area
                      ? { area: parseFloat(String(unit.area)) }
                      : {}),
                    ...(unit.bedrooms
                      ? { bedrooms: parseInt(String(unit.bedrooms), 10) }
                      : {}),
                    ...(unit.bathrooms
                      ? { bathrooms: parseInt(String(unit.bathrooms), 10) }
                      : {})
                  }
                });

                // Создаем версию для обновленного юнита
                await createUnitVersion(
                  tx,
                  unit,
                  existingUnit.id,
                  importRecord.id,
                  buildingId,
                  status,
                  {
                    originalData: existingUnit,
                    changes: {
                      before: existingUnit,
                      after: updatedUnit
                    },
                    updateType: "UPDATE"
                  }
                );

                results.updated++;
              } else if (!existingUnit) {
                // Создаем новый юнит

                // Генерируем слаг для юнита
                const unitNumber = String(unit.unit_number);
                const floor = floorNumber || 0;
                const uniqueSuffix = Math.random().toString(36).substring(2, 7);
                const slugBase = `floor-${floor}-unit-${unitNumber}-${uniqueSuffix}`;

                const newUnit = await tx.unit.create({
                  data: {
                    projectId,
                    number: String(unit.unit_number),
                    floor: floorNumber || 0,
                    slug: slugBase,
                    ...(buildingId ? { buildingId } : {}),
                    ...(unit.layout_id ? { layoutId: unit.layout_id } : {}),
                    status,
                    price: basePrice || finalPrice || sellingPrice || 0,
                    ...(discountPrice !== undefined ? { discountPrice } : {}),
                    ...(unit.unit_description
                      ? { description: unit.unit_description }
                      : {}),
                    ...(unit.view_description
                      ? { view: unit.view_description }
                      : {}),
                    ...(unit.area
                      ? { area: parseFloat(String(unit.area)) }
                      : {}),
                    ...(unit.bedrooms
                      ? { bedrooms: parseInt(String(unit.bedrooms), 10) }
                      : {}),
                    ...(unit.bathrooms
                      ? { bathrooms: parseInt(String(unit.bathrooms), 10) }
                      : {})
                  }
                });

                // Создаем версию для нового юнита
                await createUnitVersion(
                  tx,
                  unit,
                  newUnit.id,
                  importRecord.id,
                  buildingId,
                  status,
                  {
                    originalData: unit,
                    isInitialVersion: true,
                    createType: "CREATE"
                  }
                );

                results.created++;
              } else {
                // Пропускаем, если юнит существует и updateExisting = false
                results.skipped++;
              }
            } catch (error) {
              results.errors.push(
                `Error processing unit: ${error instanceof Error ? error.message : String(error)}`
              );
              results.skipped++;
            }
          }

          // Обновляем запись об импорте
          await tx.unitImport.update({
            where: { id: importRecord.id },
            data: {
              createdUnits: results.created,
              updatedUnits: results.updated,
              skippedUnits: results.skipped,
              processed: true
            }
          });

          // Обновляем totalProcessed
          results.totalProcessed =
            results.created + results.updated + results.skipped;
        },
        { timeout: 60000 }
      );
    } catch (transactionError) {
      results.errors.push(
        `Transaction error: ${transactionError instanceof Error ? transactionError.message : String(transactionError)}`
      );
    }

    return results;
  } catch (error) {
    console.error("Error processing import:", error);
    throw error;
  }
}

/**
 * Создает автоматическое сопоставление полей на основе заголовков
 */
async function createAutoFieldMapping(
  projectId: string,
  data: any[],
  userId: string = "system"
): Promise<string> {
  // Получаем все заголовки из первого объекта
  if (!data || data.length === 0) {
    throw new Error("No data provided for field mapping");
  }

  const headers = Object.keys(data[0]);

  // Создаем сопоставление полей
  const mappings: Record<string, string> = {};

  headers.forEach(header => {
    // Пытаемся найти соответствующее поле
    const matchedField = findMatchingField(header);
    if (matchedField) {
      mappings[header] = matchedField;
    } else {
      // Если не нашли соответствия, игнорируем поле
      mappings[header] = "ignore";
    }
  });

  try {
    // Получаем пользователя с ролью ADMIN для использования в качестве userId
    const adminUser = await prisma.user.findFirst({
      where: {
        role: {
          name: "ADMIN"
        }
      }
    });

    // Если не нашли админа, используем первого пользователя
    const firstUser = adminUser || (await prisma.user.findFirst());

    if (!firstUser) {
      throw new Error("No users found in the database");
    }

    // Создаем запись сопоставления полей с корректным userId
    const fieldMapping = await prisma.unitFieldMapping.create({
      data: {
        projectId,
        userId: firstUser.id, // Используем ID существующего пользователя
        name: `Auto-generated mapping ${new Date().toLocaleString()}`,
        mappings,
        isDefault: false,
        isApproved: false
      }
    });

    return fieldMapping.id;
  } catch (error) {
    console.error("Error creating field mapping:", error);
    throw error;
  }
}

/**
 * POST /api/projects/:id/units/import
 * Импорт юнитов
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const projectId = awaitedParams.id;

    // Проверяем API токен для автоматизированного импорта
    const authHeader = request.headers.get("x-api-token");
    const isAutomatedImport = !!authHeader;

    if (isAutomatedImport) {
      if (!API_TOKEN || authHeader !== API_TOKEN) {
        return NextResponse.json(
          { error: "unauthorized", message: "Invalid API token" },
          { status: 401 }
        );
      }
    } else {
      // Проверка аутентификации для обычного импорта
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json(
          { error: "unauthorized", message: "Not authenticated" },
          { status: 401 }
        );
      }
    }

    // Проверяем существование проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { buildings: true }
    });

    if (!project) {
      return NextResponse.json(
        {
          error: "notFound",
          message: `Project with ID ${projectId} not found`
        },
        { status: 404 }
      );
    }

    // Получаем тело запроса
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "invalidJson", message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Валидируем данные в зависимости от типа импорта
    let validationResult;
    try {
      if (isAutomatedImport) {
        validationResult = automatedImportSchema.safeParse(body);
      } else {
        validationResult = ImportRequestSchema.safeParse(body);
      }

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
    } catch (validationError) {
      return NextResponse.json(
        {
          error: "validationError",
          message: "Error during validation",
          details: String(validationError)
        },
        { status: 400 }
      );
    }

    const {
      data,
      updateExisting,
      defaultBuildingId,
      currency,
      priceUpdateDate,
      fieldMappingId
    } = validationResult.data;

    // Для автоматизированного импорта проверяем сопоставление полей
    if (isAutomatedImport) {
      let fieldMapping;
      let fieldMappingId2 = fieldMappingId;

      if (fieldMappingId) {
        // Если указан ID сопоставления, используем его
        fieldMapping = await prisma.unitFieldMapping.findFirst({
          where: {
            id: fieldMappingId,
            projectId
          }
        });

        if (!fieldMapping || fieldMapping.isApproved === false) {
          return NextResponse.json(
            {
              error: "mappingNotFound",
              message: "Field mapping not found or not approved"
            },
            { status: 404 }
          );
        }
      } else {
        // Иначе ищем сопоставление по умолчанию для проекта
        fieldMapping = await prisma.unitFieldMapping.findFirst({
          where: {
            projectId,
            isDefault: true,
            isApproved: true
          }
        });

        if (!fieldMapping) {
          // Если нет утвержденного сопоставления по умолчанию, создаем новое и ожидаем утверждения
          try {
            // Получаем пользователя с ролью ADMIN для использования в качестве userId
            const adminUser = await prisma.user.findFirst({
              where: {
                role: {
                  name: "ADMIN"
                }
              }
            });

            // Если не нашли админа, используем первого пользователя
            const firstUser = adminUser || (await prisma.user.findFirst());

            if (!firstUser) {
              return NextResponse.json(
                {
                  error: "userNotFound",
                  message: "No users found in the database"
                },
                { status: 500 }
              );
            }

            // Создаем запись импорта
            const importRecord = await prisma.unitImport.create({
              data: {
                projectId,
                importedBy: firstUser.id, // Используем ID существующего пользователя
                currency: currency || null,
                priceUpdateDate: priceUpdateDate
                  ? new Date(priceUpdateDate)
                  : null,
                totalUnits: data.length,
                createdUnits: 0,
                updatedUnits: 0,
                skippedUnits: 0,
                rawData: JSON.stringify(body),
                processed: false
              }
            });

            // Создаем автоматическое сопоставление полей
            try {
              fieldMappingId2 = await createAutoFieldMapping(
                projectId,
                data,
                firstUser.id
              );

              // Связываем импорт с сопоставлением полей
              await prisma.unitImport.update({
                where: { id: importRecord.id },
                data: {
                  fieldMappingId: fieldMappingId2
                }
              });

              return NextResponse.json({
                success: true,
                status: "pending_approval",
                message: "Import is pending approval of field mapping",
                importId: importRecord.id,
                fieldMappingId: fieldMappingId2
              });
            } catch (mappingError) {
              console.error("Error creating auto field mapping:", mappingError);

              // Удаляем созданную запись импорта, чтобы не оставлять "висящие" записи
              await prisma.unitImport.delete({
                where: { id: importRecord.id }
              });

              return NextResponse.json(
                {
                  error: "mappingError",
                  message: "Error creating field mapping",
                  details: String(mappingError)
                },
                { status: 500 }
              );
            }
          } catch (error) {
            console.error("Error creating pending import:", error);
            return NextResponse.json(
              {
                error: "pendingImportError",
                message: "Error creating pending import",
                details: String(error)
              },
              { status: 500 }
            );
          }
        }
      }
    }

    // Обрабатываем импорт
    try {
      // Для автоматизированного импорта используем processUnitImport из utils.ts
      if (isAutomatedImport) {
        const session = await getServerSession(authOptions);

        // Получаем сопоставление полей
        const fieldMapping = await prisma.unitFieldMapping.findFirst({
          where: {
            id: fieldMappingId,
            projectId
          }
        });

        if (!fieldMapping) {
          return NextResponse.json(
            { error: "mappingNotFound", message: "Field mapping not found" },
            { status: 404 }
          );
        }

        const result = await processUnitImport({
          projectId,
          units: data,
          fieldMapping: fieldMapping.mappings as Record<string, string>,
          updateExisting,
          defaultBuildingId,
          currency,
          priceUpdateDate,
          session
        });

        return NextResponse.json({
          success: true,
          total: data.length,
          processed: result.totalProcessed || 0,
          created: result.created,
          updated: result.updated,
          skipped: result.skipped,
          markedAsSold: result.markedAsSold,
          warnings: result.warnings || [],
          errors: result.errors
        });
      } else {
        // Для обычного импорта используем стандартную логику
        try {
          const result = await processImport(
            projectId,
            data,
            updateExisting,
            defaultBuildingId,
            currency,
            priceUpdateDate
          );

          return NextResponse.json({
            success: true,
            total: data.length,
            processed: result.totalProcessed || 0,
            created: result.created,
            updated: result.updated,
            skipped: result.skipped,
            markedAsSold: result.markedAsSold,
            warnings: result.warnings || [],
            errors: result.errors
          });
        } catch (error) {
          console.error("Error processing import:", error);
          return NextResponse.json(
            {
              success: false,
              error: "Failed to process import",
              message: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
          );
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json(
          {
            error: "serverError",
            message: "Server error",
            details: {
              name: error.name,
              message: error.message
            }
          },
          { status: 500 }
        );
      } else {
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
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "serverError",
          message: "Server error",
          details: {
            name: error.name,
            message: error.message
          }
        },
        { status: 500 }
      );
    } else {
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
