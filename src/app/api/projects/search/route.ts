import { NextRequest, NextResponse } from "next/server";

import { ProjectType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const PROJECTS_PER_PAGE = 3;

// Типы для параметров поиска
interface SearchParams {
  searchType: 'units' | 'projects';
  page: number;
  limit: number;
  sortBy?: 'price' | 'completion' | 'relevance';
  sortDirection?: 'asc' | 'desc';
  propertyType?: string;
  bedrooms?: string;
  bathrooms?: string;
  priceMin?: string | number;
  priceMax?: string | number;
  areaMin?: string | number;
  areaMax?: string | number;
  completion?: string;
  features?: string[];
  amenities?: string[];
  query?: string;
  projectId?: string;
  developerId?: string;
  locationId?: string;
}

// Helper function to build search query
async function buildSearchQuery(params: {
  propertyType?: string | undefined;
  bedrooms?: string | undefined;
  bathrooms?: string | undefined;
  priceMin?: string | number | undefined;
  priceMax?: string | number | undefined;
  areaMin?: string | number | undefined;
  areaMax?: string | number | undefined;
  completion?: string | undefined;
  features?: string[] | undefined;
  amenities?: string[] | undefined;
  query?: string | undefined;
  type?: string | undefined;
  projectId?: string | undefined;
  developerId?: string | undefined;
  locationId?: string | undefined;
}) {
  const {
    propertyType,
    bedrooms,
    bathrooms,
    priceMin,
    priceMax,
    areaMin,
    areaMax,
    completion,
    features,
    amenities,
    query,
    type,
    projectId,
    developerId,
    locationId
  } = params;

  // Debug log
  console.log("Search params:", JSON.stringify(params, null, 2));

  // Build unit filter conditions
  const unitConditions: any[] = [];
  
  // Add status condition only if we're searching for available units
  if (type === 'units') {
    unitConditions.push({ status: "AVAILABLE" });
  }
  
  // Проверяем наличие фильтров для юнитов
  const hasUnitFilters = bedrooms !== undefined || 
                       bathrooms !== undefined || 
                       priceMin !== undefined || 
                       priceMax !== undefined || 
                       areaMin !== undefined || 
                       areaMax !== undefined ||
                       propertyType !== undefined;

  // Добавляем проверку layoutId только если есть фильтры
  if (hasUnitFilters) {
    unitConditions.push({ layoutId: { not: null } });
  }
  
  // Add layout type condition if specified
  if (propertyType) {
    console.log('=== Property Type Debug ===', {
      propertyType,
      condition: {
        layout: { 
          type: propertyType 
        }
      }
    });
    
    unitConditions.push({
      layout: {
        type: propertyType
      }
    });
  }
  
  // Add bedrooms condition if specified
  if (bedrooms) {
    if (bedrooms === "st") {
      unitConditions.push({ bedrooms: 0 }); // Студии имеют 0 спален
    } else if (bedrooms === "4") {
      unitConditions.push({ bedrooms: { gte: 4 } });
    } else {
      unitConditions.push({ bedrooms: Number(bedrooms) });
    }
  }

  // Add bathrooms condition if specified
  if (bathrooms !== undefined) {
    // Если значение 4, используем gte
    if (bathrooms === "4") {
      unitConditions.push({ bathrooms: { gte: 4 } });
    } else {
      unitConditions.push({ bathrooms: Number(bathrooms) });
    }
  }

  // Add area range conditions if specified
  if (areaMin !== undefined || areaMax !== undefined) {
    const areaConditions: any[] = [];
    if (areaMin !== undefined) {
      areaConditions.push({ layout: { totalArea: { gte: Number(areaMin) } } });
    }
    if (areaMax !== undefined) {
      areaConditions.push({ layout: { totalArea: { lte: Number(areaMax) } } });
    }
    if (areaConditions.length > 0) {
      unitConditions.push({ AND: areaConditions });
    }
  }
  
  // Add price range conditions if specified
  const priceConditions: any[] = [];
  if (priceMin !== undefined) {
    priceConditions.push({ price: { gte: Number(priceMin) } });
  }
  if (priceMax !== undefined) {
    priceConditions.push({ price: { lte: Number(priceMax) } });
  }
  if (priceConditions.length > 0) {
    unitConditions.push({ AND: priceConditions });
  }

  // Build project filter conditions
  const projectConditions: any[] = [];
  
  // Add direct ID filters
  if (projectId) {
    projectConditions.push({ id: projectId });
  }
  if (developerId) {
    projectConditions.push({ developerId });
  }
  if (locationId) {
    projectConditions.push({ locationId });
  }
  
  // Add text search conditions
  if (query && !projectId && !developerId && !locationId) {
    projectConditions.push({
      OR: [
        {
          translations: {
            some: {
              name: {
                contains: query,
                mode: "insensitive" as const
              }
            }
          }
        },
        {
          location: {
            OR: [
              { address: { contains: query, mode: "insensitive" as const } },
              { district: { contains: query, mode: "insensitive" as const } },
              { city: { contains: query, mode: "insensitive" as const } }
            ]
          }
        }
      ]
    });
  }

  // Add completion status filter
  if (completion) {
    const statusMap = {
      ready: "COMPLETED",
      under_construction: "UNDER_CONSTRUCTION",
      off_plan: "PLANNING"
    };
    if (completion in statusMap) {
      projectConditions.push({ 
        buildingStatus: statusMap[completion as keyof typeof statusMap] 
      });
    }
  }

  // Add unit features filters
  const featureMapping: { [key: string]: string[] } = {
    'furnished': ['furnished', 'Furnished', 'hasFurnished'],
    'pet_friendly': ['pet_friendly', 'Pet Friendly', 'hasPets'],
    'sea_view': ['sea_view', 'Sea View', 'view'],
    'private_pool': ['private_pool', 'Private Pool'],
    'smart_home': ['Smart Home System', 'hasSmartHome'],
    'air_conditioning': ['Air Conditioning', 'hasAirConditioning'],
    'balcony': ['Balcony', 'hasBalcony'],
    'parking': ['Parking', 'hasParking'],
    'storage': ['Storage', 'hasStorage'],
    'security': ['Security System', 'hasSecuritySystem'],
    'heating': ['Heating', 'hasHeating'],
    'water_heating': ['Water Heating', 'hasWaterHeating'],
    'gas': ['Gas', 'hasGas'],
    'internet': ['Internet', 'hasInternet'],
    'cable_tv': ['Cable TV', 'hasCableTV'],
    'elevator': ['Elevator', 'hasElevator'],
    'wheelchair_access': ['Wheelchair Access', 'hasWheelchairAccess']
  };

  if (features?.length) {
    const featureConditions: any[] = [];

    features.forEach(feature => {
      const mappedFeatures = featureMapping[feature] || [feature];
      
      // Add condition for unit features
      featureConditions.push({
        OR: [
          // Check in features array
          {
            features: {
              some: {
                OR: mappedFeatures.map(f => ({
                  name: f
                }))
              }
            }
          },
          // Check in view field for sea_view
          ...(feature === 'sea_view' ? [{
            view: {
              contains: 'Sea View',
              mode: 'insensitive' as const
            }
          }] : []),
          // Check boolean fields in layout
          ...(mappedFeatures.find(f => f.startsWith('has')) ? [{
            layout: {
              [mappedFeatures.find(f => f.startsWith('has'))!]: true
            }
          }] : [])
        ]
      });
    });

    if (featureConditions.length > 0) {
      unitConditions.push({
        AND: featureConditions
      });
    }
  }

  // Add payment plan filters
  if (features?.includes('installment')) {
    projectConditions.push({
      paymentPlans: {
        some: {
          installments: {
            not: '[]'
          }
        }
      }
    });
  }

  // Add amenities filter
  if (amenities?.length) {
    projectConditions.push({
      amenities: {
        some: {
          amenity: {
            name: {
              in: amenities
            }
          }
        }
      }
    });
  }

  // Add unit filter to project conditions
  if (unitConditions.length > 0) {
    projectConditions.push({
      units: {
        some: {
          AND: unitConditions
        }
      }
    });
  }

  const where = projectConditions.length > 0 ? { AND: projectConditions } : {};

  // Debug log
  console.log("Search query:", JSON.stringify(where, null, 2));

  return where;
}

// Helper function to search projects
async function searchProjects(where: any, page = 1, limit = PROJECTS_PER_PAGE, bedrooms?: string, bathrooms?: string, priceMin?: string | number, priceMax?: string | number, features?: string[]) {
  try {
    // Проверяем наличие фильтров
    const hasFilters = bedrooms !== undefined || 
                      bathrooms !== undefined || 
                      priceMin !== undefined || 
                      priceMax !== undefined ||
                      features?.length > 0;

    // Build unit filter
    const unitFilter: any = { 
      status: "AVAILABLE",
      price: { gt: 0 } // Исключаем юниты с нулевой ценой
    };

    // Добавляем проверку layoutId только если есть фильтры
    if (hasFilters) {
      unitFilter.layoutId = { not: null };
    }

    const conditions: any[] = [];
    
    // Add bedrooms filter if specified
    if (bedrooms) {
      if (bedrooms === "st") {
        conditions.push({ bedrooms: 0 }); // Студии имеют 0 спален
      } else if (bedrooms === "4") {
        conditions.push({ bedrooms: { gte: 4 } });
      } else {
        conditions.push({ bedrooms: Number(bedrooms) });
      }
    }

    // Add bathrooms filter if specified
    if (bathrooms) {
      if (bathrooms === "4") {
        conditions.push({ bathrooms: { gte: 4 } });
      } else {
        conditions.push({ bathrooms: Number(bathrooms) });
      }
    }
    
    // Add price range filters if specified
    if (priceMin || priceMax) {
      const priceConditions: any[] = [];
      if (priceMin) {
        priceConditions.push({ price: { gte: Number(priceMin) } });
      }
      if (priceMax) {
        priceConditions.push({ price: { lte: Number(priceMax) } });
      }
      if (priceConditions.length > 0) {
        conditions.push({ AND: priceConditions });
      }
    }

    // Combine all conditions
    if (conditions.length > 0) {
      unitFilter.AND = conditions;
    }

    // Add unit filter to where condition
    where = {
      ...where,
      units: {
        some: unitFilter
      }
    };

    const [total, projects] = await Promise.all([
      // Get total count
      prisma.project.count({ where }),

      // Get paginated results
      prisma.project.findMany({
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
          buildings: true,
          units: {
            where: unitFilter
          },
          yield: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc"
        }
      })
    ]);

    // Debug log
    console.log(`Found ${total} projects`);

    return {
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error("Search projects error:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // 1. Get search params from URL
    const { searchParams } = new URL(request.url);
    const params = {
      propertyType: searchParams.get("propertyType") || undefined,
      bedrooms: searchParams.get("bedrooms") || undefined,
      bathrooms: searchParams.get("bathrooms") || undefined,
      priceMin: searchParams.get("priceMin") || undefined,
      priceMax: searchParams.get("priceMax") || undefined,
      areaMin: searchParams.get("areaMin") || undefined,
      areaMax: searchParams.get("areaMax") || undefined,
      completion: searchParams.get("completion") || undefined,
      features: searchParams.get("features")?.split(",") || undefined,
      amenities: searchParams.get("amenities")?.split(",") || undefined,
      query: searchParams.get("q") || undefined,
      type: searchParams.get("type") || undefined,
      projectId: searchParams.get("projectId") || undefined,
      developerId: searchParams.get("developerId") || undefined,
      locationId: searchParams.get("locationId") || undefined
    };

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || PROJECTS_PER_PAGE;

    // Debug log
    console.log("GET request params:", params);

    // 2. Build search query
    const where = await buildSearchQuery(params);

    // 3. Execute search
    const searchResult = await searchProjects(where, page, limit, params.bedrooms, params.bathrooms, params.priceMin, params.priceMax, params.features);

    // 4. Return response
    return NextResponse.json(searchResult);
  } catch (error) {
    console.error("Project search failed:", {
      error,
      context: "project_search",
      method: "GET"
    });

    return NextResponse.json(
      {
        error: "Failed to search projects",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      searchType = 'projects',
      page = 1,
      limit = PROJECTS_PER_PAGE,
      propertyType,
      bedrooms,
      bathrooms,
      priceMin,
      priceMax,
      areaMin,
      areaMax,
      completion,
      features,
      amenities,
      query,
      projectId,
      developerId,
      locationId,
      sortBy = 'relevance',
      sortDirection = 'asc'
    } = await request.json();

    // Определяем параметры сортировки для Prisma
    const getOrderBy = () => {
      if (searchType === 'units') {
        switch (sortBy) {
          case 'price':
            return { price: sortDirection as Prisma.SortOrder };
          case 'completion':
            return { 
              project: {
                buildingStatus: sortDirection as Prisma.SortOrder
              }
            };
          default:
            return { createdAt: 'desc' as Prisma.SortOrder };
        }
      } else {
        // Для проектов
        switch (sortBy) {
          case 'price':
            return { createdAt: sortDirection as Prisma.SortOrder }; // Временно используем createdAt
          case 'completion':
            return { buildingStatus: sortDirection as Prisma.SortOrder };
          default:
            return { createdAt: 'desc' as Prisma.SortOrder };
        }
      }
    };

    console.log('=== Sort Parameters ===', {
      sortBy,
      sortDirection,
      searchType,
      orderBy: getOrderBy()
    });

    // Базовые условия для юнитов
    const unitConditions: any[] = [
      { status: "AVAILABLE" },
      { price: { gt: 0 } } // Всегда исключаем юниты с нулевой ценой
    ];

    // Проверяем наличие фильтров для юнитов
    const hasUnitFilters = bedrooms !== undefined || 
                         bathrooms !== undefined || 
                         priceMin !== undefined || 
                         priceMax !== undefined || 
                         areaMin !== undefined || 
                         areaMax !== undefined ||
                         propertyType !== undefined;

    // Добавляем проверку layoutId только если есть фильтры
    if (hasUnitFilters) {
      unitConditions.push({ layoutId: { not: null } });
    }

    // Добавляем фильтр по типу, если указан
    if (propertyType) {
      unitConditions.push({
        layout: { type: propertyType }
      });
    }

    console.log('=== Unit Conditions Debug ===', {
      conditions: unitConditions,
      propertyType,
      hasUnitFilters
    });

    if (searchType === 'units') {
      // Добавляем фильтры по цене
      if (priceMin || priceMax) {
        const priceFilter: any = {};
        if (priceMin) priceFilter.gte = Number(priceMin);
        if (priceMax) priceFilter.lte = Number(priceMax);
        unitConditions.push({ price: priceFilter });
        
        console.log('=== Price Filter Applied for Units ===', {
          priceMin,
          priceMax,
          priceFilter
        });
      }

      // Добавляем фильтр по типу планировки
      if (propertyType) {
        unitConditions.push({
          layout: {
            type: propertyType
          }
        });
      }

      // Добавляем фильтр по дате сдачи
      if (completion) {
        const statusMap: Record<string, string> = {
          ready: "COMPLETED",
          under_construction: "UNDER_CONSTRUCTION",
          off_plan: "PLANNING"
        };
        
        if (completion in statusMap) {
          unitConditions.push({
            project: {
              buildingStatus: statusMap[completion as keyof typeof statusMap]
            }
          });
        }
      }

      if (bedrooms) {
        if (bedrooms === "st") {
          unitConditions.push({ bedrooms: 0 }); // Студии имеют 0 спален
        } else if (bedrooms === "4") {
          unitConditions.push({ bedrooms: { gte: 4 } });
        } else {
          unitConditions.push({ bedrooms: Number(bedrooms) });
        }
      }
      if (bathrooms) {
        if (bathrooms === "4") {
          unitConditions.push({ bathrooms: { gte: 4 } });
        } else {
          unitConditions.push({ bathrooms: Number(bathrooms) });
        }
      }
      if (areaMin) unitConditions.push({ layout: { totalArea: { gte: Number(areaMin) } } });
      if (areaMax) unitConditions.push({ layout: { totalArea: { lte: Number(areaMax) } } });

      console.log('=== Unit Search Conditions ===', {
        unitConditions,
        completion,
        price: { min: priceMin, max: priceMax }
      });

      const whereCondition: Prisma.UnitWhereInput = {
        AND: unitConditions,
        ...(projectId ? {
          project: {
            is: {
              id: projectId
            }
          }
        } : {})
      };

      console.log('=== Units Search - Where Condition ===', whereCondition);

      const units = await prisma.unit.findMany({
        where: whereCondition,
        include: {
          project: {
            include: {
              translations: true,
              media: true,
              location: true,
              developer: {
                include: {
                  translations: true
                }
              }
            }
          },
          building: {
            select: {
              floors: true,
              floorPlans: true
            }
          },
          features: true,
          media: true,
          layout: {
            select: {
              id: true,
              mainImage: true,
              name: true,
              type: true,
              bathrooms: true,
              bedrooms: true,
              totalArea: true,
            }
          }
        },
        orderBy: getOrderBy(),
        skip: (page - 1) * limit,
        take: limit
      });

      const totalCount = await prisma.unit.count({
        where: whereCondition
      });

      return NextResponse.json({
        units,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
      });

    } else {
      console.log('4. Searching projects...');
      
      // Базовые условия для проектов
      const projectConditions: any[] = [];
      
      // Базовые условия для юнитов
      const unitConditions: any[] = [
        { status: "AVAILABLE" },
        { price: { gt: 0 } } // Всегда исключаем юниты с нулевой ценой
      ];
      
      // Проверяем наличие фильтров для юнитов
      const hasUnitFilters = bedrooms !== undefined || 
                           bathrooms !== undefined || 
                           priceMin !== undefined || 
                           priceMax !== undefined || 
                           areaMin !== undefined || 
                           areaMax !== undefined ||
                           propertyType !== undefined;

      // Добавляем проверку layoutId только если есть фильтры
      if (hasUnitFilters) {
        unitConditions.push({ layoutId: { not: null } });
      }

      console.log('=== Price Filter Debug ===', {
        priceMin,
        priceMax,
        hasUnitFilters,
        initialUnitConditions: unitConditions
      });

      // Добавляем фильтры по цене
      if (priceMin || priceMax) {
        const priceFilter: any = { gt: 0 }; // Базовое условие
        if (priceMin) priceFilter.gte = Number(priceMin);
        if (priceMax) priceFilter.lte = Number(priceMax);
        unitConditions[1].price = priceFilter; // Обновляем существующий фильтр цены
        
        console.log('=== Updated Price Filter ===', {
          priceFilter,
          updatedUnitConditions: unitConditions
        });
      }

      // Добавляем фильтр по типу планировки к условиям юнитов
      if (propertyType) {
        unitConditions.push({
          layout: {
            type: propertyType
          }
        });
      }
      
      // Добавляем фильтр по количеству спален
      if (bedrooms) {
        if (bedrooms === "st") {
          unitConditions.push({ bedrooms: 0 }); // Студии имеют 0 спален
        } else if (bedrooms === "4") {
          unitConditions.push({ bedrooms: { gte: 4 } });
        } else {
          unitConditions.push({ bedrooms: Number(bedrooms) });
        }
      }

      if (bathrooms) {
        if (bathrooms === "4") {
          unitConditions.push({ bathrooms: { gte: 4 } });
        } else {
          unitConditions.push({ bathrooms: Number(bathrooms) });
        }
      }

      if (priceMin) unitConditions.push({ price: { gte: Number(priceMin) } });
      if (priceMax) unitConditions.push({ price: { lte: Number(priceMax) } });
      if (areaMin) unitConditions.push({ layout: { totalArea: { gte: Number(areaMin) } } });
      if (areaMax) unitConditions.push({ layout: { totalArea: { lte: Number(areaMax) } } });

      // Если есть условия для юнитов, добавляем их к условиям проекта
      if (hasUnitFilters) {
        projectConditions.push({
          units: {
            some: {
              AND: unitConditions
            }
          }
        });
      }

      // Добавляем фильтры по ID
      if (projectId) projectConditions.push({ id: projectId });
      if (developerId) projectConditions.push({ developerId });
      if (locationId) projectConditions.push({ locationId });

      // Добавляем фильтр по статусу строительства
      if (completion) {
        const statusMap = {
          ready: "COMPLETED",
          under_construction: "UNDER_CONSTRUCTION",
          off_plan: "PLANNING"
        };
        if (completion in statusMap) {
          projectConditions.push({ 
            buildingStatus: statusMap[completion as keyof typeof statusMap] 
          });
        }
      }

      // Добавляем фильтр по удобствам
      if (amenities?.length) {
        projectConditions.push({
          amenities: {
            some: {
              amenity: {
                name: {
                  in: amenities
                }
              }
            }
          }
        });
      }

      const whereCondition = {
        AND: projectConditions
      };

      console.log('5. Projects where condition:', JSON.stringify(whereCondition, null, 2));

      const [totalCount, projects] = await Promise.all([
        // Получаем общее количество
        prisma.project.count({ 
          where: whereCondition 
        }),

        // Получаем проекты с пагинацией
        prisma.project.findMany({
          where: whereCondition,
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
            buildings: true,
            units: {
              where: {
                AND: unitConditions
              }
            },
            yield: true
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: getOrderBy()
        })
      ]);

      console.log('6. Projects search result:', {
        totalCount,
        projectsFound: projects.length
      });

      return NextResponse.json({
        projects,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
      });
    }

  } catch (error) {
    console.error('Search error:', {
      error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Failed to perform search',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

function buildWhereClause(filters: any) {
  const where: any = {};
  const conditions: any[] = [];

  const {
    propertyType,
    bedrooms,
    bathrooms,
    priceMin,
    priceMax,
    areaMin,
    areaMax,
    query,
    projectId,
    developerId,
    locationId,
    completion
  } = filters;

  // Direct ID filters
  if (projectId) {
    return { id: projectId };
  }

  // Property type filter
  if (propertyType) {
    conditions.push({ type: propertyType });
  }

  // Units filters
  const unitsConditions: any[] = [];
  if (bedrooms) {
    unitsConditions.push({ bedrooms: Number(bedrooms) });
  }
  if (bathrooms) {
    unitsConditions.push({ bathrooms: Number(bathrooms) });
  }
  if (priceMin || priceMax) {
    const priceCondition: any = {};
    if (priceMin) priceCondition.gte = Number(priceMin);
    if (priceMax) priceCondition.lte = Number(priceMax);
    unitsConditions.push({ price: priceCondition });
  }

  if (unitsConditions.length > 0) {
    conditions.push({
      OR: [
        { units: { some: { OR: unitsConditions } } },
        { units: { none: {} } }
      ]
    });
  }

  // Area filter
  if (areaMin || areaMax) {
    const areaCondition: any = {};
    if (areaMin) areaCondition.gte = Number(areaMin);
    if (areaMax) areaCondition.lte = Number(areaMax);
    conditions.push({
      OR: [
        { totalLandArea: areaCondition },
        { totalLandArea: null }
      ]
    });
  }

  // Text search
  if (query) {
    conditions.push({
      OR: [
        {
          translations: {
            some: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } }
              ]
            }
          }
        },
        {
          location: {
            OR: [
              { address: { contains: query, mode: "insensitive" } },
              { district: { contains: query, mode: "insensitive" } },
              { city: { contains: query, mode: "insensitive" } }
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

  return where;
}
