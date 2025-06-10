import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Схема валидации для создания/обновления сопоставления полей
const fieldMappingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mappings: z.record(z.string().min(1)),
  isDefault: z.boolean().optional(),
  isApproved: z.boolean().optional()
});

/**
 * GET /api/projects/:id/field-mappings
 * Получение списка сопоставлений полей для проекта
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Получаем ID проекта из параметров
    const { id: projectId } = params;
    
    // Проверка существования проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { error: "projectNotFound", message: "Project not found" },
        { status: 404 }
      );
    }

    // Получение всех сопоставлений полей для проекта
    const fieldMappings = await prisma.unitFieldMapping.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      data: fieldMappings
    });
  } catch (error) {
    console.error("Error fetching field mappings:", error);
    return NextResponse.json(
      { error: "serverError", message: "Server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/:id/field-mappings
 * Создание нового сопоставления полей
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Получаем ID проекта из параметров
    const { id: projectId } = params;
    
    // Проверка существования проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { error: "projectNotFound", message: "Project not found" },
        { status: 404 }
      );
    }

    // Получаем данные из запроса
    const body = await request.json();
    
    // Валидация данных
    const validationResult = fieldMappingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "validationError", message: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, mappings, isDefault = false, isApproved = false } = validationResult.data;

    // Если новая конфигурация устанавливается как дефолтная, сбрасываем флаг у других конфигураций
    if (isDefault) {
      await prisma.unitFieldMapping.updateMany({
        where: { projectId, isDefault: true },
        data: { isDefault: false }
      });
    }

    // Создаем новое сопоставление полей
    const newFieldMapping = await prisma.unitFieldMapping.create({
      data: {
        projectId,
        userId: session.user.id,
        name,
        mappings,
        isDefault,
        isApproved
      }
    });

    return NextResponse.json({
      data: newFieldMapping
    });
  } catch (error) {
    console.error("Error creating field mapping:", error);
    return NextResponse.json(
      { error: "serverError", message: "Server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/:id/field-mappings?id=:mappingId
 * Обновление существующего сопоставления полей
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Получаем ID проекта из параметров
    const { id: projectId } = params;
    
    // Получаем ID сопоставления полей из query параметров
    const { searchParams } = new URL(request.url);
    const mappingId = searchParams.get("id");
    
    if (!mappingId) {
      return NextResponse.json(
        { error: "missingParameter", message: "Mapping ID is required" },
        { status: 400 }
      );
    }
    
    // Проверка существования проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { error: "projectNotFound", message: "Project not found" },
        { status: 404 }
      );
    }
    
    // Проверка существования сопоставления полей
    const existingMapping = await prisma.unitFieldMapping.findUnique({
      where: { id: mappingId }
    });
    
    if (!existingMapping) {
      return NextResponse.json(
        { error: "mappingNotFound", message: "Field mapping not found" },
        { status: 404 }
      );
    }
    
    // Проверка прав доступа (только владелец или администратор может редактировать)
    if (existingMapping.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "forbidden", message: "You don't have permission to update this mapping" },
        { status: 403 }
      );
    }

    // Получаем данные из запроса
    const body = await request.json();
    
    // Валидация данных
    const validationResult = fieldMappingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "validationError", message: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, mappings, isDefault = false, isApproved } = validationResult.data;

    // Если конфигурация устанавливается как дефолтная, сбрасываем флаг у других конфигураций
    if (isDefault && !existingMapping.isDefault) {
      await prisma.unitFieldMapping.updateMany({
        where: { projectId, isDefault: true },
        data: { isDefault: false }
      });
    }

    // Обновляем сопоставление полей
    const updatedFieldMapping = await prisma.unitFieldMapping.update({
      where: { id: mappingId },
      data: {
        name,
        mappings,
        isDefault,
        ...(isApproved !== undefined ? { isApproved } : {})
      }
    });

    return NextResponse.json({
      data: updatedFieldMapping
    });
  } catch (error) {
    console.error("Error updating field mapping:", error);
    return NextResponse.json(
      { error: "serverError", message: "Server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/:id/field-mappings?id=:mappingId
 * Удаление сопоставления полей
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Получаем ID проекта из параметров
    const { id: projectId } = params;
    
    // Получаем ID сопоставления полей из query параметров
    const { searchParams } = new URL(request.url);
    const mappingId = searchParams.get("id");
    
    if (!mappingId) {
      return NextResponse.json(
        { error: "missingParameter", message: "Mapping ID is required" },
        { status: 400 }
      );
    }
    
    // Проверка существования проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { error: "projectNotFound", message: "Project not found" },
        { status: 404 }
      );
    }
    
    // Проверка существования сопоставления полей
    const existingMapping = await prisma.unitFieldMapping.findUnique({
      where: { id: mappingId }
    });
    
    if (!existingMapping) {
      return NextResponse.json(
        { error: "mappingNotFound", message: "Field mapping not found" },
        { status: 404 }
      );
    }
    
    // Проверка прав доступа (только владелец или администратор может удалять)
    if (existingMapping.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "forbidden", message: "You don't have permission to delete this mapping" },
        { status: 403 }
      );
    }

    // Удаляем сопоставление полей
    await prisma.unitFieldMapping.delete({
      where: { id: mappingId }
    });

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error("Error deleting field mapping:", error);
    return NextResponse.json(
      { error: "serverError", message: "Server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/:id/field-mappings/approve?id=:mappingId
 * Утверждение конфигурации сопоставления полей
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Получаем ID проекта из параметров
    const { id } = params;
    const projectId = id;
    
    // Получаем ID сопоставления полей из query параметров
    const { searchParams } = new URL(request.url);
    const mappingId = searchParams.get("id");
    const action = searchParams.get("action");
    
    if (!mappingId) {
      return NextResponse.json(
        { error: "missingParameter", message: "Mapping ID is required" },
        { status: 400 }
      );
    }
    
    if (action !== "approve") {
      return NextResponse.json(
        { error: "invalidAction", message: "Invalid action" },
        { status: 400 }
      );
    }
    
    // Проверка существования проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { error: "projectNotFound", message: "Project not found" },
        { status: 404 }
      );
    }
    
    // Проверка существования сопоставления полей
    const existingMapping = await prisma.unitFieldMapping.findUnique({
      where: { id: mappingId }
    });
    
    if (!existingMapping) {
      return NextResponse.json(
        { error: "mappingNotFound", message: "Field mapping not found" },
        { status: 404 }
      );
    }

    // Утверждаем конфигурацию
    const updatedMapping = await prisma.unitFieldMapping.update({
      where: { id: mappingId },
      data: { isApproved: true }
    });

    return NextResponse.json({
      data: updatedMapping
    });
  } catch (error) {
    console.error("Error approving field mapping:", error);
    return NextResponse.json(
      { error: "serverError", message: "Server error" },
      { status: 500 }
    );
  }
} 