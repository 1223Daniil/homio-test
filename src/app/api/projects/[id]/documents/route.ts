import { NextRequest, NextResponse } from "next/server";

import { DocumentCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const data = await request.json();

    if (!data.url || !data.type || !data.title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Создаем документ
    const document = await prisma.projectDocument.create({
      data: {
        projectId: awaitedParams.id,
        type: data.type,
        status: "ACTIVE",
        fileUrl: data.url,
        title: data.title,
        category: data.category as DocumentCategory
      }
    });

    // Добавляем логирование
    console.log("Created document:", document);

    // Получаем все документы проекта для логирования
    const allDocuments = await prisma.projectDocument.findMany({
      where: {
        projectId: awaitedParams.id
      }
    });
    console.log("All project documents:", allDocuments);

    return NextResponse.json(document);
  } catch (error) {
    console.error("Create document error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create document"
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    // Получаем документы проекта напрямую из таблицы ProjectDocument
    const documents = await prisma.projectDocument.findMany({
      where: {
        projectId: awaitedParams.id
      }
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { error: "Failed to get documents" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const data = await request.json();
    const { documents } = data as {
      documents: Array<{
        id: string;
        type: string;
        status: string;
        fileUrl: string;
        title: string | null;
        category: DocumentCategory;
      }>;
    };

    // Получаем текущие документы проекта
    const currentDocuments = await prisma.projectDocument.findMany({
      where: { projectId: awaitedParams.id }
    });

    // Создаем новые документы
    const newDocuments = documents.filter(
      doc => !currentDocuments.some(current => current.id === doc.id)
    );

    // Обновляем существующие документы
    const updatedDocuments = documents.filter(doc =>
      currentDocuments.some(current => current.id === doc.id)
    );

    // Удаляем документы, которых нет в новом списке
    const documentsToDelete = currentDocuments.filter(
      current => !documents.some(doc => doc.id === current.id)
    );

    // Выполняем все операции в транзакции
    const updatedProject = await prisma.$transaction(async tx => {
      // Удаляем старые документы
      if (documentsToDelete.length > 0) {
        await tx.projectDocument.deleteMany({
          where: {
            id: {
              in: documentsToDelete.map(doc => doc.id)
            }
          }
        });
      }

      // Обновляем существующие документы
      for (const doc of updatedDocuments) {
        await tx.projectDocument.update({
          where: { id: doc.id },
          data: {
            title: doc.title,
            fileUrl: doc.fileUrl,
            category: doc.category,
            type: doc.type,
            status: doc.status
          }
        });
      }

      // Создаем новые документы
      if (newDocuments.length > 0) {
        await tx.projectDocument.createMany({
          data: newDocuments.map(doc => ({
            ...doc,
            projectId: awaitedParams.id
          }))
        });
      }

      // Возвращаем обновленный проект со всеми документами
      return tx.project.findUnique({
        where: { id: awaitedParams.id },
        include: {
          documents: true,
          translations: true,
          media: true,
          amenities: true
        }
      });
    });

    if (!updatedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Documents update error:", error);
    return NextResponse.json(
      { error: "Failed to update documents" },
      { status: 500 }
    );
  }
}
