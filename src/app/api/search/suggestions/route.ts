import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 1. Validation
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ suggestions: [] });
    }

    // 2. Processing
    const [projects, locations, developers] = await Promise.all([
      // Search in projects
      prisma.project.findMany({
        where: {
          OR: [
            {
              translations: {
                some: {
                  name: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              location: {
                OR: [
                  { address: { contains: query, mode: "insensitive" } },
                  { district: { contains: query, mode: "insensitive" } },
                  { city: { contains: query, mode: "insensitive" } },
                ],
              },
            },
          ],
        },
        include: {
          translations: true,
          location: true,
        },
        distinct: ['id'],
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      }),

      // Search in locations
      prisma.location.findMany({
        where: {
          OR: [
            { address: { contains: query, mode: "insensitive" } },
            { district: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
          ],
        },
        distinct: ['id'],
        orderBy: {
          id: 'desc',
        },
        take: 3,
      }),

      // Search in developers
      prisma.developer.findMany({
        where: {
          translations: {
            some: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        },
        include: {
          translations: true,
        },
        distinct: ['id'],
        orderBy: {
          id: 'desc',
        },
        take: 3,
      }),
    ]);

    // 3. Transform and deduplicate results
    const seenIds = new Set<string>();
    
    const suggestions = [
      // Project suggestions
      ...projects
        .filter(project => {
          if (seenIds.has(project.id)) return false;
          seenIds.add(project.id);
          return true;
        })
        .map((project) => ({
          id: project.id,
          type: "project" as const,
          title: project.translations[0]?.name || "Untitled",
          subtitle: project.location
            ? `${project.location.district}, ${project.location.city}`
            : undefined,
        })),

      // Location suggestions
      ...locations
        .filter(location => {
          if (seenIds.has(location.id)) return false;
          seenIds.add(location.id);
          return true;
        })
        .map((location) => ({
          id: location.id,
          type: "location" as const,
          title: location.address,
          subtitle: `${location.district}, ${location.city}`,
        })),

      // Developer suggestions
      ...developers
        .filter(developer => {
          if (seenIds.has(developer.id)) return false;
          seenIds.add(developer.id);
          return true;
        })
        .map((developer) => ({
          id: developer.id,
          type: "developer" as const,
          title: developer.translations[0]?.name || "Untitled",
        })),
    ];

    // 4. Response
    return NextResponse.json({ suggestions });
  } catch (error) {
    // 5. Error handling
    console.error("Search suggestions failed:", {
      error,
      context: "search_suggestions",
    });

    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
} 