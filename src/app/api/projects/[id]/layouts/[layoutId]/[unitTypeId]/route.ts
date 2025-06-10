import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { UnitLayoutType, UnitLayoutStatus } from "@prisma/client";

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
  windowCount: z.number().int().min(0).nullable(),
  orientation: z.string().nullable(),
  energyClass: z.string().nullable(),
  
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
  maintenanceFee: z.number().min(0).nullable(),

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
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  seoKeywords: z.array(z.string()).default([])
});

export async function GET(
  request: Request,
  context: { params: { id: string; layoutId: string } }
) {
  const { id, layoutId } = context.params;
  
  try {
    const layout = await prisma.unitLayout.findFirst({
      where: {
        id: layoutId,
        projectId: id,
      },
    });

    if (!layout) {
      return NextResponse.json(
        { error: "Layout not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(layout);
  } catch (error) {
    console.error("Error fetching layout:", error);
    return NextResponse.json(
      { error: "Failed to fetch layout" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: { id: string; layoutId: string } }
) {
  const { id, layoutId } = context.params;
  
  try {
    const body = await request.json();
    const validatedData = layoutSchema.parse(body);

    // Remove undefined values
    const data = Object.fromEntries(
      Object.entries(validatedData).filter(([_, v]) => v !== undefined)
    );

    const layout = await prisma.unitLayout.update({
      where: {
        id: layoutId,
      },
      data: {
        ...data,
        projectId: id,
      },
    });

    return NextResponse.json(layout);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
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
      },
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