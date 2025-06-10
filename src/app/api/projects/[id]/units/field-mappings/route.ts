import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Схема для создания маппинга полей
const CreateFieldMappingSchema = z.object({
  name: z.string().min(1, "Название не может быть пустым"),
  mappings: z.record(z.string()),
  isDefault: z.boolean().default(false)
});

/**
 * GET /api/projects/:id/units/field-mappings
 * Получение сохраненных маппингов полей для проекта
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const projectId = awaitedParams.id;

    // Проверка аутентификации
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "unauthorized", message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Проверяем существование проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { error: "notFound", message: `Project with ID ${projectId} not found` },
        { status: 404 }
      );
    }

    // Получаем маппинги полей для проекта
    const fieldMappings = await prisma.unitFieldMapping.findMany({
      where: {
        projectId,
        isApproved: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(fieldMappings);
  } catch (error) {
    return NextResponse.json(
      { error: "serverError", message: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/:id/units/field-mappings
 * Создание нового маппинга полей
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const projectId = awaitedParams.id;

    // Проверка аутентификации
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "unauthorized", message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Проверяем существование проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { error: "notFound", message: `Project with ID ${projectId} not found` },
        { status: 404 }
      );
    }

    // Получаем тело запроса
    const body = await request.json();

    // Валидируем данные
    const validationResult = CreateFieldMappingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "validationError", message: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, mappings, isDefault } = validationResult.data;

    // Если создается маппинг по умолчанию, сбрасываем флаг у других маппингов
    if (isDefault) {
      await prisma.unitFieldMapping.updateMany({
        where: {
          projectId,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      });
    }

    // Проверяем наличие пользователя в сессии и его существование в базе данных
    let userId = session.user?.id;
    
    // Если ID пользователя отсутствует или некорректен, ищем администратора или любого пользователя
    if (!userId) {
      // Ищем пользователя с ролью ADMIN
      const adminUser = await prisma.user.findFirst({
        where: {
          role: {
            name: "ADMIN"
          }
        }
      });
      
      // Если не нашли админа, берем первого попавшегося пользователя
      if (adminUser) {
        userId = adminUser.id;
      } else {
        const anyUser = await prisma.user.findFirst();
        if (!anyUser) {
          return NextResponse.json(
            { error: "userNotFound", message: "No users found in the database" },
            { status: 500 }
          );
        }
        userId = anyUser.id;
      }
    } else {
      // Проверяем существование пользователя с указанным ID
      const userExists = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!userExists) {
        // Если пользователь не найден, ищем администратора или любого пользователя
        const adminUser = await prisma.user.findFirst({
          where: {
            role: {
              name: "ADMIN"
            }
          }
        });
        
        if (adminUser) {
          userId = adminUser.id;
        } else {
          const anyUser = await prisma.user.findFirst();
          if (!anyUser) {
            return NextResponse.json(
              { error: "userNotFound", message: "No users found in the database" },
              { status: 500 }
            );
          }
          userId = anyUser.id;
        }
      }
    }

    // Создаем новый маппинг полей
    const fieldMapping = await prisma.unitFieldMapping.create({
      data: {
        projectId,
        userId,
        name,
        mappings,
        isDefault,
        isApproved: true // Автоматически утверждаем маппинг, созданный пользователем
      }
    });

    return NextResponse.json(fieldMapping);
  } catch (error) {
    return NextResponse.json(
      { error: "serverError", message: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/:id/units/field-mappings?mappingId=xxx
 * Удаление маппинга полей
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const projectId = awaitedParams.id;

    // Проверка аутентификации
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "unauthorized", message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Получаем ID маппинга из query параметров
    const { searchParams } = new URL(request.url);
    const mappingId = searchParams.get("mappingId");

    if (!mappingId) {
      return NextResponse.json(
        { error: "badRequest", message: "Missing mappingId parameter" },
        { status: 400 }
      );
    }

    // Проверяем существование маппинга
    const mapping = await prisma.unitFieldMapping.findFirst({
      where: {
        id: mappingId,
        projectId
      }
    });

    if (!mapping) {
      return NextResponse.json(
        { error: "notFound", message: `Field mapping with ID ${mappingId} not found` },
        { status: 404 }
      );
    }

    // Проверяем права доступа (только владелец или админ может удалить)
    if (mapping.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "forbidden", message: "You don't have permission to delete this mapping" },
        { status: 403 }
      );
    }

    // Удаляем маппинг
    await prisma.unitFieldMapping.delete({
      where: {
        id: mappingId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "serverError", message: "Server error", details: String(error) },
      { status: 500 }
    );
  }
} 