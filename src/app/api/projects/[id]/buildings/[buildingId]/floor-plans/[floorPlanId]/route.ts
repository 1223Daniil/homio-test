import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  {
    params
  }: { params: { id: string; buildingId: string; floorPlanId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure params are properly typed and available
    const { floorPlanId, buildingId } = params;
    if (!floorPlanId || !buildingId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Проверяем существование плана этажа
    const floorPlan = await prisma.floorPlan.findUnique({
      where: {
        id: floorPlanId,
        buildingId: buildingId
      }
    });

    if (!floorPlan) {
      return NextResponse.json(
        { error: "Floor plan not found", id: floorPlanId, buildingId },
        { status: 404 }
      );
    }

    // Получаем URL изображения для возможного удаления соответствующей записи BuildingMedia
    const imageUrl = floorPlan.imageUrl;

    // Удаляем сам план этажа
    await prisma.floorPlan.delete({
      where: {
        id: floorPlanId,
        buildingId: buildingId
      }
    });

    // Находим и удаляем соответствующий BuildingMedia, если он существует
    if (imageUrl) {
      const buildingMedia = await prisma.buildingMedia.findFirst({
        where: {
          buildingId: buildingId,
          url: imageUrl
        }
      });

      if (buildingMedia) {
        // Логируем перед удалением для отладки
        console.log(
          `Deleting associated BuildingMedia with ID: ${buildingMedia.id}`
        );

        try {
          await prisma.buildingMedia.delete({
            where: {
              id: buildingMedia.id,
              buildingId: buildingId
            }
          });
        } catch (mediaDeleteError) {
          // Если не удалось удалить медиа, просто логируем ошибку, но не прерываем операцию
          console.error(
            "Failed to delete associated BuildingMedia:",
            mediaDeleteError
          );
        }
      } else {
        console.log(`No associated BuildingMedia found for URL: ${imageUrl}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Error deleting floor plan:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to delete floor plan" },
      { status: 500 }
    );
  }
}
