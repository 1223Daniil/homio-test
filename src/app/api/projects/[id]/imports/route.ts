import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/projects/:id/imports
 * Получение истории импорта юнитов для проекта
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const projectId = awaitedParams.id;
    
    const session = await getServerSession(authOptions);
    
    // Проверка аутентификации
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
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
    
    // Получение параметров пагинации из запроса
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    try {
      // Получение истории импортов
      const imports = await prisma.unitImport.findMany({
        where: { projectId },
        orderBy: { importDate: "desc" },
        skip,
        take: limit,
      });
      
      // Получение общего количества записей для пагинации
      const total = await prisma.unitImport.count({
        where: { projectId }
      });
      
      // Получение информации о пользователях
      const userIds = imports
        .map(imp => imp.importedBy)
        .filter((id): id is string => id !== null);
      
      let users: { id: string; name: string | null; email: string }[] = [];
      if (userIds.length > 0) {
        users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true }
        });
      }
      
      const userMap = new Map(users.map(user => [user.id, user]));
      
      // Форматирование данных для ответа
      const formattedImports = imports.map(importRecord => {
        const user = importRecord.importedBy ? userMap.get(importRecord.importedBy) : null;
        
        return {
          id: importRecord.id,
          createdAt: importRecord.importDate,
          userId: importRecord.importedBy || null,
          userName: user ? (user.name || user.email || "Неизвестный пользователь") : "Неизвестный пользователь",
          status: "SUCCESS", // Статус по умолчанию
          totalRows: importRecord.totalUnits || 0,
          successCount: (importRecord.createdUnits || 0) + (importRecord.updatedUnits || 0),
          failedCount: importRecord.skippedUnits || 0,
          type: "UNITS",
          fileName: "Импорт юнитов" // Значение по умолчанию
        };
      });
      
      return NextResponse.json({
        imports: formattedImports,
        total,
        page,
        limit
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database error", details: dbError instanceof Error ? dbError.message : "Unknown error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching import history:", error);
    return NextResponse.json(
      { error: "Failed to fetch import history" },
      { status: 500 }
    );
  }
} 