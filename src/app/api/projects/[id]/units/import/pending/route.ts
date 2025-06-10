import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/projects/:id/units/import/pending
 * Получение списка ожидающих импортов для проекта
 */
export async function GET(
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
    
    // Проверка существования проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { error: "projectNotFound", message: "Project not found" },
        { status: 404 }
      );
    }

    // Получаем все ожидающие импорты для проекта
    // Ожидающие импорты - это импорты, у которых есть связанное сопоставление полей,
    // которое не утверждено (isApproved = false)
    const pendingImports = await prisma.unitImport.findMany({
      where: {
        projectId,
        processed: false,
        fieldMapping: {
          isApproved: false
        }
      },
      include: {
        fieldMapping: true
      },
      orderBy: {
        importDate: "desc"
      }
    });

    // Преобразуем данные для ответа
    const formattedImports = await Promise.all(pendingImports.map(async (importItem) => {
      // Получаем образец данных (первые 5 записей)
      let sampleData = [];
      try {
        const rawData = importItem.rawData ? JSON.parse(importItem.rawData.toString()) : {};
        sampleData = Array.isArray(rawData.data) ? rawData.data.slice(0, 5) : [];
      } catch (error) {
        console.error("Error parsing raw data:", error);
        sampleData = [];
      }

      return {
        id: importItem.id,
        mappingId: importItem.fieldMappingId || "",
        createdAt: importItem.importDate,
        totalUnits: importItem.totalUnits,
        importedBy: importItem.importedBy || "system",
        sampleData
      };
    }));

    return NextResponse.json({
      data: formattedImports
    });
  } catch (error) {
    console.error("Error fetching pending imports:", error);
    return NextResponse.json(
      { error: "serverError", message: "Server error" },
      { status: 500 }
    );
  }
} 