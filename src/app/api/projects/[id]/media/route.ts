import { NextRequest, NextResponse } from "next/server";

import { MediaCategory } from "@prisma/client";
import axios from "axios";
import { encode } from "blurhash";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";
import { z } from "zod";

const createMediaSchema = z.object({
  title: z.string().optional(),
  url: z.string().min(1),
  type: z.string(),
  description: z.string().optional(),
  category: z.nativeEnum(MediaCategory).default(MediaCategory.BANNER),
  order: z.number().default(0),
  thumbnailUrl: z.string().nullable().optional()
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const rawData = await request.json();
    console.log("Raw request data:", rawData);

    // Валидация данных
    const validationResult = createMediaSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error);
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error },
        { status: 400 }
      );
    }

    const projectId = awaitedParams.id;

    // Проверяем существование проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Загружаем изображение по URL
    const imageResponse = await axios.get(validationResult.data.url, {
      responseType: "arraybuffer"
    });

    // Обрабатываем изображение с помощью Sharp
    const image = sharp(Buffer.from(imageResponse.data));
    const { data, info } = await image
      .raw()
      .ensureAlpha()
      .resize(32, 32, { fit: "inside" })
      .toBuffer({ resolveWithObject: true });

    const blurHash = await encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      4,
      4
    );

    const createData = {
      ...validationResult.data,
      projectId,
      blurhash: blurHash
    };
    console.log("Data being sent to database:", createData);

    // Исправляем типы для соответствия с ProjectMediaCreateInput
    const media = await prisma.projectMedia.create({
      data: {
        projectId,
        blurhash: blurHash,
        type: validationResult.data.type,
        order: validationResult.data.order,
        category: validationResult.data.category,
        url: validationResult.data.url,
        description: validationResult.data.description || null,
        title: validationResult.data.title || null,
        thumbnailUrl: validationResult.data.thumbnailUrl || null
      }
    });

    console.log("Created media in database:", media);
    return NextResponse.json(media);
  } catch (error) {
    console.error("Error creating media:", error);
    return NextResponse.json(
      { error: "Failed to create media" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const awaitedParams = await params;
  const { id } = awaitedParams;

  try {
    const media = await prisma.projectMedia.findMany({
      where: {
        projectId: id
      },
      orderBy: {
        order: "asc"
      }
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}
