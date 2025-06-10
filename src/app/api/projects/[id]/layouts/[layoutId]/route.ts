import { UnitLayout, UnitLayoutStatus, UnitLayoutType } from "@prisma/client";

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { translateText } from "@/utils/aiTranslator";
import { z } from "zod";

const layoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(UnitLayoutType, { required_error: "Type is required" }),
  description: z.string().nullable(),
  status: z.nativeEnum(UnitLayoutStatus).default("DRAFT"),
  order: z.number().int().min(0).default(0),

  // Dimensions
  totalArea: z.number().min(0, "Total area must be greater than 0"),
  livingArea: z.number().min(0).nullable(),
  balconyArea: z.number().min(0).nullable(),
  ceilingHeight: z.number().min(0).nullable(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  windowCount: z.number().int().min(0).nullable().optional(),
  orientation: z.string().nullable().optional(),
  energyClass: z.string().nullable().optional(),

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

  // Pricing
  basePrice: z.number().min(0).nullable(),
  currency: z.string().default("USD"),
  pricePerSqm: z.number().min(0).nullable(),
  maintenanceFee: z.number().min(0).nullable().optional(),

  // Media
  mainImage: z.string().nullable(),
  images: z.any().nullable(),
  planImage: z.string().nullable(),
  tour3d: z.string().nullable(),

  // Additional Info
  features: z.any().nullable(),
  furniture: z.any().nullable(),
  finishes: z.any().nullable(),
  floor: z.number().int().min(0).nullable(),
  advantages: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),

  // SEO
  seoTitle: z.string(),
  seoDescription: z.string(),
  seoKeywords: z.array(z.string()).default([])
});

export async function GET(
  request: NextRequest,
  context: { params: { id: string; layoutId: string } }
) {
  const { id, layoutId } = context.params;

  const pathname = request.nextUrl.pathname;
  const pathSegments = pathname.split("/").filter(Boolean);
  const localeFromPath = pathSegments[0]?.length === 2 ? pathSegments[0] : null;

  const headerLanguage = request.headers.get("Accept-Language");

  const language = headerLanguage;

  console.log("Header language:", headerLanguage);
  console.log("Final language:", language);

  try {
    const layout = await prisma.unitLayout.findUnique({
      where: {
        id: layoutId,
        projectId: id
      },
      include: language
        ? {
            UnitLayoutTranslation: {
              where: {
                language,
                unitLayoutId: layoutId
              }
            }
          }
        : null
    });

    console.log("Layout", layout);

    if (!layout) {
      return NextResponse.json({ error: "Layout not found" }, { status: 404 });
    }

    const layoutWithTranslations = layout as any;

    const formattedLayout = {
      ...layout,
      name:
        layoutWithTranslations.UnitLayoutTranslation?.[0]?.name || layout.name,
      description:
        layoutWithTranslations.UnitLayoutTranslation?.[0]?.description ||
        layout.description,
      seoTitle:
        layoutWithTranslations.UnitLayoutTranslation?.[0]?.seoTitle ||
        layout.seoTitle,
      seoDescription:
        layoutWithTranslations.UnitLayoutTranslation?.[0]?.seoDescription ||
        layout.seoDescription,
      seoKeywords:
        layoutWithTranslations.UnitLayoutTranslation?.[0]?.seoKeywords ||
        layout.seoKeywords,
      tags:
        layoutWithTranslations.UnitLayoutTranslation?.[0]?.tags || layout.tags
    };

    return NextResponse.json(formattedLayout);
  } catch (error) {
    console.error("Error fetching layout:", error);
    return NextResponse.json(
      { error: "Failed to fetch layout" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string; layoutId: string } }
) {
  const { id, layoutId } = context.params;

  try {
    const body = await request.json();
    const data = layoutSchema.parse(body);

    console.log("Layout data", data);

    const dataToTranslate: any = {
      name: data.name,
      description: data.description,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription
    };

    if (data.seoKeywords.length > 0) {
      dataToTranslate.seoKeywords = data.seoKeywords.join(", ");
    }

    if (data.tags.length > 0) {
      dataToTranslate.tags = data.tags.join(", ");
    }

    const translations: any[] = await translateText(dataToTranslate);

    console.log("Translation", translations);

    const layout = await prisma.unitLayout.update({
      where: {
        id: layoutId,
        projectId: id
      },
      data: {
        ...data,
        slug: `${data.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`
      }
    });

    for (const translation of translations) {
      const { locale: language, ...rest } = translation;

      const seoKeywords =
        rest.seoKeywords && typeof rest.seoKeywords === "string"
          ? rest.seoKeywords.split(",").map((keyword: string) => keyword.trim())
          : [];

      const tags =
        rest.tags && typeof rest.tags === "string"
          ? rest.tags.split(",").map((tag: string) => tag.trim())
          : [];

      const { seoKeywords: _, tags: __, ...restWithoutArrays } = rest;

      const unitLayoutTranslation = await prisma.unitLayoutTranslation.upsert({
        where: {
          unitLayoutId_language: {
            unitLayoutId: layoutId,
            language
          }
        },
        update: {
          seoKeywords,
          tags,
          ...restWithoutArrays
        },
        create: {
          unitLayoutId: layoutId,
          language,
          seoKeywords,
          tags,
          ...restWithoutArrays
        }
      });

      console.log("Unit layout translation", unitLayoutTranslation);
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
  context: { params: { id: string; layoutId: string } }
) {
  const { id, layoutId } = context.params;

  try {
    await prisma.unitLayout.delete({
      where: {
        id: layoutId,
        projectId: id
      }
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
