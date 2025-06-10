import { Session } from "next-auth";
import { prisma } from "@/lib/prisma";

interface ProcessUnitImportParams {
  projectId: string;
  units: any[];
  fieldMapping: Record<string, string>;
  updateExisting: boolean;
  defaultBuildingId?: string | null;
  currency?: string | null;
  priceUpdateDate?: string | null;
  session: Session | null;
}

interface ProcessUnitImportResult {
  total: number;
  totalProcessed: number;
  created: number;
  updated: number;
  skipped: number;
  markedAsSold: number;
  warnings: string[];
  errors: string[];
}

/**
 * Process unit import with field mapping
 */
export async function processUnitImport({
  projectId,
  units,
  fieldMapping,
  updateExisting,
  defaultBuildingId,
  currency,
  priceUpdateDate,
  session
}: ProcessUnitImportParams): Promise<ProcessUnitImportResult> {
  // Get project and its buildings
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { buildings: true }
  });

  if (!project) {
    throw new Error(`Project with ID ${projectId} not found`);
  }

  // Добавляем логирование информации о проекте и параметрах импорта
  console.log("=== IMPORT STARTED ===");
  console.log(`Project: ${project.id} (${project.name || "Unnamed"})`);
  console.log(`Units to import: ${units.length}`);
  console.log(`Update existing: ${updateExisting}`);
  console.log(`Default building: ${defaultBuildingId}`);
  console.log("Field mapping:", fieldMapping);

  // Create a map of building names to building IDs
  const buildingMap = new Map<string, string>();
  project.buildings.forEach(building => {
    if (building.name) {
      buildingMap.set(building.name.toLowerCase(), building.id);
    }
  });

  // Логируем информацию о зданиях
  console.log(
    "Buildings in project:",
    Array.from(buildingMap.entries()).map(([name, id]) => `${name}: ${id}`)
  );

  // Results
  const results: ProcessUnitImportResult = {
    total: units.length,
    totalProcessed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    markedAsSold: 0,
    warnings: [],
    errors: []
  };

  // Process units in a transaction
  await prisma.$transaction(
    async tx => {
      for (const rawUnit of units) {
        try {
          // Apply field mapping
          const unit: Record<string, any> = {};
          for (const [sourceField, value] of Object.entries(rawUnit)) {
            const targetField = fieldMapping[sourceField];
            if (targetField && targetField !== "ignore") {
              unit[targetField] = value;
            }
          }

          // Логируем сопоставленные данные юнита
          console.log("\n--- Processing unit ---");
          console.log("Raw data:", rawUnit);
          console.log("Mapped data:", unit);

          // Check if unit has a unit number
          if (!unit.unit_number) {
            results.skipped++;
            results.errors.push(`Unit without unit_number skipped`);
            console.log("ERROR: Unit without unit_number skipped");
            continue;
          }

          // Проверяем layout_id, если он указан
          if (unit.layout_id) {
            console.log(
              `Checking layout_id: ${unit.layout_id} for unit ${unit.unit_number}`
            );

            // Сначала ищем планировку по id
            let layoutExists = await tx.unitLayout.findFirst({
              where: {
                id: unit.layout_id,
                projectId: projectId
              }
            });

            // Если не нашли по id, пробуем найти по имени
            if (!layoutExists) {
              console.log(
                `Layout with ID ${unit.layout_id} not found, trying to find by name...`
              );

              layoutExists = await tx.unitLayout.findFirst({
                where: {
                  name: unit.layout_id,
                  projectId: projectId
                }
              });

              if (layoutExists) {
                console.log(
                  `Layout found by name: ${layoutExists.id} (${layoutExists.name})`
                );
                // Заменяем layout_id на найденный id
                unit.layout_id = layoutExists.id;
              }
            }

            if (!layoutExists) {
              // Если layout не существует в текущем проекте, удаляем его из данных
              console.log(
                `WARNING: Layout with ID/name "${unit.layout_id}" not found in project ${projectId}`
              );

              // Получаем список всех доступных планировок для информации
              const availableLayouts = await tx.unitLayout.findMany({
                where: { projectId },
                select: { id: true, name: true }
              });

              console.log(
                `Available layouts in project: ${availableLayouts.map(l => `"${l.name}" (ID: ${l.id})`).join(", ") || "none"}`
              );

              const warningMessage = `Unit ${unit.unit_number}: layout with ID/name "${unit.layout_id}" not found in this project. Available layouts: ${availableLayouts.map(l => `"${l.name}"`).join(", ") || "none"}`;

              delete unit.layout_id;
              results.warnings.push(warningMessage);
            } else {
              console.log(
                `Layout found: ${layoutExists.id} (${layoutExists.name || "Unnamed"})`
              );
            }
          }

          // Find building ID
          let buildingId = defaultBuildingId;
          if (unit.building) {
            const buildingName = String(unit.building).toLowerCase();
            console.log(`Looking for building: "${buildingName}"`);

            if (buildingMap.has(buildingName)) {
              const mappedBuildingId = buildingMap.get(buildingName);
              if (mappedBuildingId) {
                buildingId = mappedBuildingId;
                console.log(`Building found by exact match: ${buildingId}`);
              }
            } else {
              // Try to find partial match
              console.log("Trying partial match for building name");
              for (const [name, id] of Array.from(buildingMap.entries())) {
                if (
                  buildingName.includes(name) ||
                  name.includes(buildingName)
                ) {
                  buildingId = id;
                  console.log(
                    `Building found by partial match: ${name} -> ${buildingId}`
                  );
                  break;
                }
              }
            }
          }

          // If no building found, use the first building of the project
          if (
            !buildingId &&
            project.buildings.length > 0 &&
            project.buildings[0]
          ) {
            buildingId = project.buildings[0].id;
            console.log(
              `No building specified, using first building: ${buildingId}`
            );
          }

          // Check if unit exists
          console.log(
            `Checking if unit ${unit.unit_number} exists in building ${buildingId}`
          );
          const existingUnit = await tx.unit.findFirst({
            where: {
              projectId,
              number: String(unit.unit_number),
              ...(buildingId ? { buildingId } : {})
            }
          });

          if (existingUnit) {
            console.log(
              `Unit ${unit.unit_number} exists with ID: ${existingUnit.id}`
            );
          } else {
            console.log(
              `Unit ${unit.unit_number} does not exist, will create new`
            );
          }

          // Parse numeric values
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

            // Convert string to number, removing commas and other non-numeric characters
            const priceString = String(value).replace(/[^\d.-]/g, "");
            const parsedPrice = parseFloat(priceString);

            return isNaN(parsedPrice) ? undefined : parsedPrice;
          };

          const basePrice = parsePrice(unit.base_price_excl_vat);
          const finalPrice = parsePrice(unit.final_price_incl_vat);
          const sellingPrice = parsePrice(unit.selling_price);
          const discountPrice = parsePrice(unit.discount_price);

          // Логируем обработанные цены
          console.log("Parsed prices:", {
            basePrice,
            finalPrice,
            sellingPrice,
            discountPrice
          });

          // Normalize floor number
          let floorNumber: number | undefined = undefined;
          if (unit.floor_number !== undefined) {
            const parsedFloor = parseInt(String(unit.floor_number), 10);
            if (!isNaN(parsedFloor)) {
              floorNumber = parsedFloor;
            }
          }

          // Determine availability status
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

          console.log(
            `Unit status: ${status}, Floor: ${floorNumber || "not specified"}`
          );

          if (existingUnit && updateExisting) {
            // Update existing unit
            console.log(`Updating existing unit ${existingUnit.id}`);
            const updateData = {
              ...(floorNumber !== undefined ? { floor: floorNumber } : {}),
              ...(buildingId ? { buildingId } : {}),
              ...(unit.layout_id ? { layoutId: unit.layout_id } : {}),
              status,
              price:
                basePrice || finalPrice || sellingPrice || existingUnit.price,
              ...(discountPrice !== undefined ? { discountPrice } : {}),
              ...(unit.unit_description
                ? { description: unit.unit_description }
                : {}),
              ...(unit.view_description ? { view: unit.view_description } : {}),
              ...(unit.area ? { area: parseFloat(String(unit.area)) } : {}),
              ...(unit.bedrooms
                ? { bedrooms: parseInt(String(unit.bedrooms), 10) }
                : {}),
              ...(unit.bathrooms
                ? { bathrooms: parseInt(String(unit.bathrooms), 10) }
                : {})
            };

            console.log("Update data:", updateData);

            await tx.unit.update({
              where: { id: existingUnit.id },
              data: updateData
            });

            console.log(`Unit ${unit.unit_number} updated successfully`);
            results.updated++;
          } else if (!existingUnit) {
            // Create new unit
            console.log(`Creating new unit ${unit.unit_number}`);
            const createData = {
              projectId,
              number: String(unit.unit_number),
              floor: floorNumber || 0,
              ...(buildingId ? { buildingId } : {}),
              ...(unit.layout_id ? { layoutId: unit.layout_id } : {}),
              status,
              price: basePrice || finalPrice || sellingPrice || 0,
              ...(discountPrice !== undefined ? { discountPrice } : {}),
              ...(unit.unit_description
                ? { description: unit.unit_description }
                : {}),
              ...(unit.view_description ? { view: unit.view_description } : {}),
              ...(unit.area ? { area: parseFloat(String(unit.area)) } : {}),
              ...(unit.bedrooms
                ? { bedrooms: parseInt(String(unit.bedrooms), 10) }
                : {}),
              ...(unit.bathrooms
                ? { bathrooms: parseInt(String(unit.bathrooms), 10) }
                : {})
            };

            console.log("Create data:", createData);

            await tx.unit.create({
              data: createData
            });

            console.log(`Unit ${unit.unit_number} created successfully`);
            results.created++;
          } else {
            // Skip if unit exists and updateExisting = false
            console.log(
              `Unit ${unit.unit_number} exists but updateExisting=false, skipping`
            );
            results.skipped++;
          }
        } catch (error) {
          console.error("Error processing unit:", error, rawUnit);
          results.errors.push(`Error processing unit: ${error}`);
          results.skipped++;
        }
      }
    },
    { timeout: 60000 }
  );

  // Обновляем totalProcessed
  results.totalProcessed = results.created + results.updated + results.skipped;

  // Логируем итоговые результаты
  console.log("\n=== IMPORT RESULTS ===");
  console.log(`Total units: ${results.total}`);
  console.log(`Processed: ${results.totalProcessed}`);
  console.log(`Created: ${results.created}`);
  console.log(`Updated: ${results.updated}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Marked as sold: ${results.markedAsSold}`);
  console.log(`Warnings: ${results.warnings.length}`);
  console.log(`Errors: ${results.errors.length}`);
  console.log("=== IMPORT COMPLETED ===");

  return results;
}
