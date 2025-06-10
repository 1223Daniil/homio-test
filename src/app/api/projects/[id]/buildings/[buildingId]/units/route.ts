import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; buildingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get floor number from query params
    const { searchParams } = new URL(request.url);
    const floor = searchParams.get("floor");

    // Ensure params are properly typed and available
    const buildingId = params.buildingId;
    if (!buildingId) {
      return NextResponse.json(
        { error: "Building ID is required" },
        { status: 400 }
      );
    }

    // Base query with type-safe params
    const where = {
      buildingId,
      ...(floor ? { floor: parseInt(floor) } : {})
    };

    const units = await prisma.unit.findMany({
      where,
      orderBy: [{ floor: "asc" }, { number: "asc" }],
      include: {
        layout: true
      }
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
