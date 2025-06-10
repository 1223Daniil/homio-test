import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  {
    params
  }: { params: Promise<{ id: string; buildingId: string; mediaId: string }> }
) {
  try {
    const awaitedParams = await params;
    await prisma.buildingMedia.delete({
      where: {
        id: awaitedParams.mediaId,
        buildingId: awaitedParams.buildingId
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
