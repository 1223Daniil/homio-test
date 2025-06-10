import { UnitLayoutStatus, UnitLayoutType } from "@prisma/client";

import { NextResponse } from "next/server";
import axios from "axios";
import { encode } from "blurhash";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";
import { z } from "zod";

// Функция для генерации blurhash
async function generateBlurhash(url: string): Promise<string | null> {
  try {
    console.log(`Generating blurhash for URL: ${url}`);
    const imageResponse = await axios.get(url, {
      responseType: "arraybuffer"
    });

    const image = sharp(Buffer.from(imageResponse.data));
    const { data, info } = await image
      .raw()
      .ensureAlpha()
      .resize(32, 32, { fit: "inside" })
      .toBuffer({ resolveWithObject: true });

    const blurhash = await encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      4,
      4
    );

    console.log(`Generated blurhash: ${blurhash}`);
    return blurhash;
  } catch (error) {
    console.error(`Ошибка при создании blurhash для URL ${url}:`, error);
    return null;
  }
}

const layoutSchema = z.object({
  // Required fields
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(UnitLayoutType, { required_error: "Type is required" }),
  totalArea: z.number().min(0, "Total area must be greater than 0"),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),

  // Optional fields with defaults
  status: z.nativeEnum(UnitLayoutStatus).default("DRAFT"),
  order: z.number().int().min(0).default(0),

  // Basic information
  description: z.string().nullable(),
  slug: z.string().nullable(),

  // Dimensions and characteristics
  livingArea: z.number().min(0).nullable(),
  balconyArea: z.number().min(0).nullable(),
  ceilingHeight: z.number().min(0).nullable(),
  windowCount: z.number().int().min(0).nullable().optional(),
  orientation: z.string().nullable().optional(),
  energyClass: z.string().nullable().optional(),
  floor: z.number().int().min(0).nullable(),

  // Media files
  mainImage: z.string().nullable(),
  images: z.any().nullable(), // JSON array of images
  planImage: z.string().nullable(),
  tour3d: z.string().nullable(),

  // Additional information
  features: z.any().nullable(), // JSON array of features
  furniture: z.any().nullable(), // JSON array of furniture
  finishes: z.any().nullable(), // JSON array of finishes
  advantages: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),

  // Pricing
  basePrice: z.number().min(0).nullable(),
  currency: z.string().default("USD"),
  pricePerSqm: z.number().min(0).nullable(),
  maintenanceFee: z.number().min(0).nullable().optional(),

  // Features
  hasBalcony: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  hasStorage: z.boolean().default(false),
  hasFurnished: z.boolean().default(false),
  hasSmartHome: z.boolean().default(false),
  hasSecuritySystem: z.boolean().default(false),
  hasAirConditioning: z.boolean().default(false),
  hasHeating: z.boolean().default(false),
  hasWaterHeating: z.boolean().default(false),
  hasGas: z.boolean().default(false),
  hasInternet: z.boolean().default(false),
  hasCableTV: z.boolean().default(false),
  hasElevator: z.boolean().default(false),
  hasWheelchairAccess: z.boolean().default(false),
  hasPets: z.boolean().default(false),

  // SEO
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  seoKeywords: z.array(z.string()).default([])
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const layouts = await prisma.unitLayout.findMany({
      where: { projectId: awaitedParams.id },
      orderBy: { order: "asc" }
    });

    return NextResponse.json(layouts);
  } catch (error) {
    console.error("Error fetching layouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch layouts" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const body = await request.json();
    const validatedData = layoutSchema.parse(body);

    // Remove undefined values
    const data = Object.fromEntries(
      Object.entries(validatedData).filter(([_, v]) => v !== undefined)
    );

    // Если есть mainImage, генерируем blurhash
    let mainImageBlurhash: string | null = null;
    if (data.mainImage && typeof data.mainImage === "string") {
      try {
        mainImageBlurhash = await generateBlurhash(data.mainImage);
        console.log(`Generated blurhash for mainImage: ${mainImageBlurhash}`);
      } catch (error) {
        console.error("Error generating blurhash for mainImage:", error);
      }
    }

    const layout = await prisma.unitLayout.create({
      data: {
        ...data,
        projectId: awaitedParams.id,
        slug:
          validatedData.slug ||
          `${validatedData.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`
      }
    });

    // Если сгенерирован blurhash, сохраняем его в JSON поле images
    if (mainImageBlurhash && layout.mainImage) {
      // Создаем или получаем текущий массив images
      let images = layout.images
        ? typeof layout.images === "string"
          ? JSON.parse(layout.images)
          : layout.images
        : [];

      if (!Array.isArray(images)) {
        images = [];
      }

      // Добавляем информацию о mainImage с blurhash
      const mainImageInfo = {
        id: `main-${Date.now()}`,
        url: layout.mainImage,
        title: "Main Image",
        description: "",
        blurhash: mainImageBlurhash,
        isMain: true
      };

      // Проверяем, есть ли уже запись для главного изображения
      const mainImageIndex = images.findIndex(
        (img: any) => img.isMain === true
      );
      if (mainImageIndex >= 0) {
        // Обновляем существующую запись
        images[mainImageIndex] = {
          ...images[mainImageIndex],
          ...mainImageInfo
        };
      } else {
        // Добавляем новую запись
        images.push(mainImageInfo);
      }

      // Обновляем запись в базе данных
      await prisma.unitLayout.update({
        where: { id: layout.id },
        data: { images }
      });

      console.log("Updated layout with mainImage blurhash");
    }

    return NextResponse.json(layout);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join("."),
        message: err.message
      }));

      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    console.error("Error creating layout:", error);
    return NextResponse.json(
      { error: "Failed to create layout" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; layoutId: string }> }
) {
  try {
    const awaitedParams = await params;
    const body = await request.json();
    const validatedData = layoutSchema.parse(body);

    // Remove undefined values
    const data = Object.fromEntries(
      Object.entries(validatedData).filter(([_, v]) => v !== undefined)
    );

    // Если обновляется mainImage, генерируем blurhash
    let mainImageBlurhash: string | null = null;
    if (
      data.mainImage &&
      typeof data.mainImage === "string" &&
      (!data.mainImage.startsWith("/api/image-proxy/") ||
        data.mainImage.includes("storage.yandexcloud.net"))
    ) {
      try {
        mainImageBlurhash = await generateBlurhash(data.mainImage);
        console.log(
          `Generated blurhash for updated mainImage: ${mainImageBlurhash}`
        );
      } catch (error) {
        console.error("Error generating blurhash for mainImage:", error);
      }
    }

    const layout = await prisma.unitLayout.update({
      where: { id: awaitedParams.layoutId },
      data: {
        ...data,
        slug:
          validatedData.slug ||
          `${validatedData.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`
      }
    });

    // Если сгенерирован blurhash, сохраняем его в JSON поле images
    if (mainImageBlurhash && layout.mainImage) {
      // Получаем текущий массив images
      let images = layout.images
        ? typeof layout.images === "string"
          ? JSON.parse(layout.images)
          : layout.images
        : [];

      if (!Array.isArray(images)) {
        images = [];
      }

      // Проверяем, есть ли уже запись с этим URL
      const existingImageIndex = images.findIndex(
        (img: any) => img.url === layout.mainImage
      );

      if (existingImageIndex >= 0) {
        // Обновляем существующую запись, сохраняя все поля
        images[existingImageIndex] = {
          ...images[existingImageIndex],
          blurhash: mainImageBlurhash
        };
      } else {
        // Ищем главное изображение
        const mainImageIndex = images.findIndex(
          (img: any) => img.isMain === true
        );

        if (mainImageIndex >= 0) {
          // Обновляем существующее главное изображение
          images[mainImageIndex] = {
            ...images[mainImageIndex],
            url: layout.mainImage,
            blurhash: mainImageBlurhash
          };
        } else {
          // Добавляем новую запись
          images.push({
            id: `main-${Date.now()}`,
            url: layout.mainImage,
            title: "Main Image",
            description: "",
            blurhash: mainImageBlurhash,
            isMain: true
          });
        }
      }

      // Обновляем запись в базе данных
      await prisma.unitLayout.update({
        where: { id: layout.id },
        data: { images }
      });

      console.log("Updated layout with mainImage blurhash");
    }

    return NextResponse.json(layout);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join("."),
        message: err.message
      }));

      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    console.error("Error updating layout:", error);
    return NextResponse.json(
      { error: "Failed to update layout" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; layoutId: string }> }
) {
  try {
    const awaitedParams = await params;
    await prisma.unitLayout.delete({
      where: { id: awaitedParams.layoutId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting layout:", error);
    return NextResponse.json(
      { error: "Failed to delete layout" },
      { status: 500 }
    );
  }
}
