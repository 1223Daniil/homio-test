import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; amenityId: string }> }
) {
  try {
    const awaitedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId, amenityId } = awaitedParams;

    // Проверяем существование проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        amenities: {
          where: { id: amenityId }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.amenities.length) {
      return NextResponse.json({ error: "Amenity not found" }, { status: 404 });
    }

    // Удаляем удобство
    await prisma.projectAmenity.delete({
      where: { id: amenityId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting amenity:", error);
    return NextResponse.json(
      { error: "Failed to delete amenity" },
      { status: 500 }
    );
  }
}
