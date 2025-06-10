import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const awaitedParams = await params;
    // Удаляем документ
    await prisma.projectDocument.delete({
      where: {
        id: awaitedParams.documentId,
        projectId: awaitedParams.id // Добавляем проверку projectId для безопасности
      }
    });

    // Получаем обновленный список документов
    const documents = await prisma.projectDocument.findMany({
      where: {
        projectId: awaitedParams.id
      }
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
