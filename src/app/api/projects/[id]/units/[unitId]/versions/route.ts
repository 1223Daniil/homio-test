import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/projects/:id/units/:unitId/versions
 * Получение истории версий юнита
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; unitId: string } }
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

    const { id: projectId, unitId } = params;
    
    // Проверка существования юнита в проекте
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        projectId
      }
    });

    if (!unit) {
      return NextResponse.json(
        { error: "unitNotFound", message: "Unit not found in this project" },
        { status: 404 }
      );
    }

    // Получение параметров пагинации из запроса
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Получение общего количества версий
    const totalCount = await prisma.unitVersion.count({
      where: { unitId }
    });

    // Получение версий юнита с пагинацией
    const versions = await prisma.unitVersion.findMany({
      where: { unitId },
      orderBy: { versionDate: "desc" },
      skip,
      take: limit,
      include: {
        import: {
          select: {
            importDate: true,
            importedBy: true,
            currency: true,
            priceUpdateDate: true
          }
        }
      }
    });

    // Получение предыдущих версий для расчета изменений
    const versionIds = versions.map(v => v.id);
    const allVersions = await prisma.unitVersion.findMany({
      where: { unitId },
      orderBy: { versionDate: "desc" }
    });

    // Форматирование данных для ответа с расчетом изменений
    const formattedVersions = versions.map(version => {
      // Найти предыдущую версию
      const currentIndex = allVersions.findIndex(v => v.id === version.id);
      const previousVersion = currentIndex < allVersions.length - 1 ? allVersions[currentIndex + 1] : null;
      
      // Рассчитать изменения
      const changes = previousVersion ? {
        price: version.price !== previousVersion.price ? {
          from: previousVersion.price,
          to: version.price,
          diff: version.price && previousVersion.price 
            ? version.price - previousVersion.price 
            : null,
          percentDiff: version.price && previousVersion.price && previousVersion.price !== 0
            ? ((version.price - previousVersion.price) / previousVersion.price) * 100
            : null
        } : null,
        status: version.status !== previousVersion.status ? {
          from: previousVersion.status,
          to: version.status
        } : null,
        area: version.area !== previousVersion.area ? {
          from: previousVersion.area,
          to: version.area
        } : null
      } : null;

      return {
        id: version.id,
        versionDate: version.versionDate,
        number: version.number,
        floor: version.floor,
        buildingId: version.buildingId,
        price: version.price,
        status: version.status,
        area: version.area,
        description: version.description,
        windowView: version.windowView,
        import: {
          id: version.importId,
          date: version.import.importDate,
          importedBy: version.import.importedBy,
          currency: version.import.currency
        },
        changes
      };
    });

    return NextResponse.json({
      data: formattedVersions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching unit versions:", error);
    
    let errorMessage = "An unexpected error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: "unknown", message: errorMessage },
      { status: 500 }
    );
  }
} 