import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processUnitImport } from "../utils";

/**
 * POST /api/projects/:id/units/import/process-pending?importId=:importId
 * Обработка ожидающего импорта после утверждения сопоставления полей
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверка аутентификации
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "unauthorized", message: "Not authenticated" },
        { status: 401 }
      );
    }

    const awaitedParams = await params;
    const projectId = awaitedParams.id;
    
    // Получаем ID импорта из query параметров
    const { searchParams } = new URL(request.url);
    const importId = searchParams.get("importId");
    
    if (!importId) {
      return NextResponse.json(
        { error: "missingParameter", message: "Import ID is required" },
        { status: 400 }
      );
    }
    
    // Проверка существования проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { buildings: true }
    });

    if (!project) {
      return NextResponse.json(
        { error: "projectNotFound", message: "Project not found" },
        { status: 404 }
      );
    }
    
    // Получаем импорт и связанное сопоставление полей
    const importRecord = await prisma.unitImport.findUnique({
      where: { id: importId },
      include: { fieldMapping: true }
    });
    
    if (!importRecord) {
      return NextResponse.json(
        { error: "importNotFound", message: "Import not found" },
        { status: 404 }
      );
    }
    
    // Проверяем, что сопоставление полей утверждено
    if (!importRecord.fieldMapping || !importRecord.fieldMapping.isApproved) {
      return NextResponse.json(
        { error: "mappingNotApproved", message: "Field mapping is not approved" },
        { status: 400 }
      );
    }
    
    // Парсим данные импорта
    let importData;
    try {
      const rawData = importRecord.rawData ? JSON.parse(importRecord.rawData.toString()) : {};
      importData = {
        data: Array.isArray(rawData.data) ? rawData.data : [],
        updateExisting: rawData.updateExisting !== false,
        defaultBuildingId: rawData.defaultBuildingId || null,
        currency: rawData.currency || null,
        priceUpdateDate: rawData.priceUpdateDate || null
      };
    } catch (error) {
      console.error("Error parsing import data:", error);
      return NextResponse.json(
        { error: "invalidData", message: "Invalid import data" },
        { status: 400 }
      );
    }
    
    // Проверяем наличие данных
    if (!importData.data || importData.data.length === 0) {
      return NextResponse.json(
        { error: "noData", message: "No data to import" },
        { status: 400 }
      );
    }
    
    // Обрабатываем импорт
    try {
      const result = await processUnitImport({
        projectId,
        units: importData.data,
        fieldMapping: importRecord.fieldMapping.mappings as Record<string, string>,
        updateExisting: importData.updateExisting,
        defaultBuildingId: importData.defaultBuildingId,
        currency: importData.currency,
        priceUpdateDate: importData.priceUpdateDate,
        session
      });
      
      // Обновляем статус импорта
      await prisma.unitImport.update({
        where: { id: importId },
        data: {
          processed: true,
          createdUnits: result.created,
          updatedUnits: result.updated,
          skippedUnits: result.skipped
        }
      });
      
      return NextResponse.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error("Error processing import:", error);
      return NextResponse.json(
        { error: "processingError", message: "Error processing import", details: String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in process-pending:", error);
    return NextResponse.json(
      { error: "serverError", message: "Server error" },
      { status: 500 }
    );
  }
} 