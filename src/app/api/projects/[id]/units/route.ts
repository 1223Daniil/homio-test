import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    // First check if project exists
    const project = await prisma.project.findUnique({
      where: { id: awaitedParams.id },
      select: { id: true }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Then fetch units with proper fields
    const units = await prisma.unit.findMany({
      where: {
        projectId: awaitedParams.id
      },
      select: {
        id: true,
        name: true,
        number: true,
        floor: true,
        area: true,
        price: true,
        status: true,
        projectId: true,
        buildingId: true,
        bedrooms: true,
        bathrooms: true,
        layoutId: true,
        layout: true,
        media: true,
        description: true,
        view: true
      },
      orderBy: [{ floor: "desc" }, { number: "asc" }]
    });

    return NextResponse.json(units);
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const data = await request.json();

    const unit = await prisma.unit.create({
      data: {
        ...data,
        projectId: awaitedParams.id
      }
    });

    return NextResponse.json(unit);
  } catch (error) {
    console.error("Error creating unit:", error);
    return NextResponse.json(
      { error: "Failed to create unit" },
      { status: 500 }
    );
  }
}
