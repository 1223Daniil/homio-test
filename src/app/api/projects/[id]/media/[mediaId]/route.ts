import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE - удаление медиафайла
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; mediaId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, mediaId } = params;

    // Проверяем, что проект существует
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Проверяем права доступа (администратор)
    const isAdmin = session.user.role === "ADMIN";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    // Проверяем, что медиафайл существует
    const media = await prisma.projectMedia.findUnique({
      where: { id: mediaId },
      select: { id: true, projectId: true }
    });

    if (!media) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }

    if (media.projectId !== id) {
      return NextResponse.json(
        { error: "Media does not belong to this project" },
        { status: 403 }
      );
    }

    // Удаляем медиафайл
    await prisma.projectMedia.delete({
      where: { id: mediaId }
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

// PATCH - обновление описания медиафайла
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; mediaId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, mediaId } = params;
    const { description, title, thumbnailUrl } = await request.json();

    // Проверяем, что проект существует
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Проверяем права доступа (администратор)
    const isAdmin = session.user.role === "ADMIN";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    // Проверяем, что медиафайл существует
    const media = await prisma.projectMedia.findUnique({
      where: { id: mediaId },
      select: { id: true, projectId: true }
    });

    if (!media) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }

    if (media.projectId !== id) {
      return NextResponse.json(
        { error: "Media does not belong to this project" },
        { status: 403 }
      );
    }

    // Обновляем данные медиафайла
    const updateData: { description?: string; title?: string; thumbnailUrl?: string | null } = {};
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    if (title !== undefined) {
      updateData.title = title;
    }

    if (thumbnailUrl !== undefined) {
      updateData.thumbnailUrl = thumbnailUrl;
    }
    
    // Обновляем медиафайл
    const updatedMedia = await prisma.projectMedia.update({
      where: { id: mediaId },
      data: updateData
    });

    return NextResponse.json(updatedMedia);
  } catch (error) {
    console.error("Error updating media:", error);
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    );
  }
}
