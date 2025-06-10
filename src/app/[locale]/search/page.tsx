import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProjectType } from "@prisma/client";
import type { ProjectWithRelations } from "./types";
import { PublicSearchPage } from "./PublicSearchPage";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { Pagination } from "@/components/ui/Pagination";


const PROJECTS_PER_PAGE = 3;

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function getPriceBoundaries() {
  const aggregations = await prisma.unit.aggregate({
    _min: {
      price: true
    },
    _max: {
      price: true
    },
    where: {
      status: "AVAILABLE",
      price: {
        gt: 0
      }
    }
  });

  return {
    min: Math.floor(aggregations._min.price || 150000),
    max: Math.ceil(aggregations._max.price || 333500000)
  };
}

export default async function SearchPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const currentPage = Number(searchParams.page) || 1;
  
  // Get total count for pagination
  const totalProjects = await prisma.project.count();
  const totalPages = Math.ceil(totalProjects / PROJECTS_PER_PAGE);

  // Get initial results with pagination
  const initialResults = await getInitialResults(searchParams, currentPage);

  // Get price boundaries from database
  const priceBoundaries = await getPriceBoundaries();

  // Конфигурация фильтров
  const filterConfig = {
    bedrooms: {
      min: 0,
      max: 4
    },
    prices: priceBoundaries
  };

  return (
    <ErrorBoundary>
      <PublicSearchPage 
        initialResults={initialResults}
        filterConfig={filterConfig}
        pagination={{
          currentPage,
          totalPages,
          baseUrl: `/${params.locale}/search`
        }}
      />
    </ErrorBoundary>
  );
}

async function getInitialResults(
  searchParams: { [key: string]: string | string[] | undefined },
  currentPage: number
): Promise<ProjectWithRelations[]> {
  try {
    // Debug log incoming parameters
    console.log("Search parameters:", searchParams);

    // Extract all search parameters
    const {
      propertyType,
      bedrooms,
      bathrooms,
      priceMin,
      priceMax,
      areaMin,
      areaMax,
      q: query,
      projectId,
      developerId,
      locationId,
      completion
    } = searchParams;

    // Build the where clause
    const where: any = {};
    const conditions: any[] = [];

    // If we have a direct ID filter, use it exclusively
    if (projectId) {
      return [(await prisma.project.findUnique({
        where: { id: projectId as string },
        include: {
          translations: true,
          location: true,
          media: true,
          developer: {
            include: {
              translations: true
            }
          },
          amenities: {
            include: {
              amenity: true
            }
          },
          units: true
        }
      }))!] as ProjectWithRelations[];
    }

    // Property type filter
    if (propertyType) {
      conditions.push({ type: propertyType as ProjectType });
    }

    // Units filters
    const unitsConditions: any[] = [
      { status: "AVAILABLE" },
      { price: { gt: 0 } }
    ];

    if (bedrooms) {
      unitsConditions.push({ bedrooms: Number(bedrooms) });
    }
    if (bathrooms) {
      unitsConditions.push({ bathrooms: Number(bathrooms) });
    }
    if (priceMin || priceMax) {
      if (priceMin) {
        unitsConditions.push({ price: { gte: Number(priceMin) } });
      }
      if (priceMax) {
        unitsConditions.push({ price: { lte: Number(priceMax) } });
      }
    }

    // Add units conditions if any exist
    if (unitsConditions.length > 0) {
      conditions.push({
        units: {
          some: {
            AND: unitsConditions
          }
        }
      });
    }

    // Area filter
    if (areaMin || areaMax) {
      const areaConditions: any[] = [];
      if (areaMin) {
        areaConditions.push({ totalLandArea: { gte: Number(areaMin) } });
      }
      if (areaMax) {
        areaConditions.push({ totalLandArea: { lte: Number(areaMax) } });
      }
      if (areaConditions.length > 0) {
        conditions.push({
          OR: [
            ...areaConditions,
            { totalLandArea: null }
          ]
        });
      }
    }

    // Text search
    if (query) {
      conditions.push({
        OR: [
          {
            translations: {
              some: {
                OR: [
                  { name: { contains: query as string, mode: "insensitive" } },
                  { description: { contains: query as string, mode: "insensitive" } }
                ]
              }
            }
          },
          {
            location: {
              OR: [
                { address: { contains: query as string, mode: "insensitive" } },
                { district: { contains: query as string, mode: "insensitive" } },
                { city: { contains: query as string, mode: "insensitive" } }
              ]
            }
          }
        ]
      });
    }

    // Build final where clause
    if (conditions.length > 0) {
      where.AND = conditions;
    }

    // Execute query with pagination
    return await prisma.project.findMany({
      where,
      include: {
        translations: true,
        location: true,
        media: true,
        developer: {
          include: {
            translations: true
          }
        },
        amenities: {
          include: {
            amenity: true
          }
        },
        units: true
      },
      orderBy: { createdAt: "desc" },
      take: PROJECTS_PER_PAGE,
      skip: (currentPage - 1) * PROJECTS_PER_PAGE
    }) as unknown as ProjectWithRelations[];
  } catch (error) {
    console.error("Failed to fetch initial results:", error);
    return [];
  }
}
