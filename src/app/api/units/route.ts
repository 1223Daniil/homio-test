import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");

    const units = await prisma.unit.findMany({
      take: limit,
      include: {
        media: true,
        project: {
          include: {
            developer: {
              include: {
                translations: true
              }
            },
            location: true,
            purchaseConditions: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      where: {
        status: "AVAILABLE"
      }
    });

    // Форматируем данные для UnitCard
    const formattedUnits = units.map(unit => ({
      id: unit.id,
      number: unit.number,
      status: unit.status,
      area: unit.area,
      price: unit.price,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      layoutPlan: unit.layoutPlan,
      media: unit.media.map(media => ({
        id: media.id,
        url: media.url,
        category: media.category
      })),
      project: {
        id: unit.project.id,
        name: unit.project.name,
        developer: {
          name: unit.project.developer.translations[0]?.name,
          logo:
            unit.project.developer.logo || "/images/developer-placeholder.png"
        },
        location: unit.project.location
          ? {
              address: `${unit.project.location.district}, ${unit.project.location.city}`,
              beachDistance: unit.project.location.beachDistance,
              latitude: unit.project.location.latitude,
              longitude: unit.project.location.longitude
            }
          : null
      }
    }));

    return NextResponse.json(formattedUnits);
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    );
  }
}
