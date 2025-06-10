import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  {
    params
  }: { params: Promise<{ id: string; unitId: string; mediaId: string }> }
) {
  try {
    const awaitedParams = await params;
    // Удаляем запись из таблицы UnitMedia
    await prisma.unitMedia.delete({
      where: {
        id: awaitedParams.mediaId,
        unitId: awaitedParams.unitId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
