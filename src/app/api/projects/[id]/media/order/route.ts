import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = params.id;
    const { media } = await request.json();

    if (!Array.isArray(media)) {
      return NextResponse.json(
        { error: "Invalid media data" },
        { status: 400 }
      );
    }

    // Проверяем, что проект существует
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, developerId: true }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Получаем информацию о пользователях, связанных с разработчиком проекта
    const developerUsers = await prisma.user.findMany({
      where: { developerId: project.developerId },
      select: { id: true }
    });

    // Проверяем права доступа (администратор или связан с разработчиком проекта)
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = developerUsers.some(user => user.id === session.user.id);

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    // Обрабатываем каждую категорию отдельно
    const mediaByCategory: Record<string, typeof media> = {};
    
    // Группируем медиа по категориям
    media.forEach(item => {
      if (!item || !item.id) {
        console.error("Invalid media item:", item);
        return;
      }
      
      const category = item.category || 'default';
      if (!mediaByCategory[category]) {
        mediaByCategory[category] = [];
      }
      mediaByCategory[category].push(item);
    });
    
    // Обновляем порядок для каждой категории
    const updatePromises: Promise<any>[] = [];
    
    Object.entries(mediaByCategory).forEach(([category, categoryMedia]) => {
      // Сортируем медиа в категории по порядку
      categoryMedia.sort((a, b) => {
        // Если порядок не указан, используем индекс в исходном массиве
        const orderA = typeof a.order === 'number' ? a.order : 0;
        const orderB = typeof b.order === 'number' ? b.order : 0;
        return orderA - orderB;
      });
      
      // Логируем для отладки
      console.log(`Updating order for category ${category}:`, 
        categoryMedia.map((item, index) => ({ id: item.id, oldOrder: item.order, newOrder: index }))
      );
      
      // Обновляем порядок для каждого элемента в категории
      categoryMedia.forEach((item, index) => {
        if (!item.id) {
          console.error("Media item without id:", item);
          return;
        }
        
        // Проверяем, изменился ли порядок или флаги
        const orderChanged = item.order !== index;
        const coverChanged = item.isCover !== undefined;
        const mainVideoChanged = item.isMainVideo !== undefined;
        
        // Обновляем только если что-то изменилось
        if (orderChanged || coverChanged || mainVideoChanged) {
          updatePromises.push(
            prisma.projectMedia.update({
              where: { id: item.id },
              data: {
                order: index,
                isCover: item.isCover === true,
                isMainVideo: item.isMainVideo === true
              }
            })
          );
        }
      });
    });

    // Выполняем все обновления
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(`Updated ${updatePromises.length} media items`);
    } else {
      console.log("No media items to update");
    }

    // Получаем обновленные медиа
    const updatedMedia = await prisma.projectMedia.findMany({
      where: { projectId },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' }
      ]
    });

    return NextResponse.json({ success: true, media: updatedMedia });
  } catch (error) {
    console.error("Error updating media order:", error);
    return NextResponse.json(
      { error: "Failed to update media order", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 