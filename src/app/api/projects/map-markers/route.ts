import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      searchType = 'projects',
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
      locationId
    } = body;

    // Базовые условия для юнитов
    const unitConditions: any[] = [
      { status: "AVAILABLE" },
      { price: { gt: 0 } }
    ];

    // Добавляем фильтры по цене
    if (priceMin || priceMax) {
      const priceFilter: any = { gt: 0 };
      if (priceMin) priceFilter.gte = Number(priceMin);
      if (priceMax) priceFilter.lte = Number(priceMax);
      unitConditions[1].price = priceFilter;
    }

    // Создаем условия для layout
    const layoutConditions: any = {};
    
    // Добавляем тип недвижимости
    if (propertyType) {
      layoutConditions.type = propertyType;
    }

    // Добавляем площадь
    if (areaMin || areaMax) {
      layoutConditions.totalArea = {};
      if (areaMin) layoutConditions.totalArea.gte = Number(areaMin);
      if (areaMax) layoutConditions.totalArea.lte = Number(areaMax);
    }

    // Если есть условия для layout, добавляем их
    if (Object.keys(layoutConditions).length > 0) {
      unitConditions.push({
        layout: layoutConditions
      });
    }

    // Добавляем остальные фильтры для юнитов
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

    console.log('=== Final Unit Conditions ===', {
      unitConditions,
      layoutConditions
    });

    if (searchType === 'units') {
      // Для юнитов: группируем по проектам и возвращаем только необходимые данные
      const projects = await prisma.project.findMany({
        where: {
          units: {
            some: {
              AND: unitConditions
            }
          }
        },
        select: {
          id: true,
          location: {
            select: {
              latitude: true,
              longitude: true
            }
          },
          translations: {
            select: {
              name: true
            }
          },
          units: {
            where: {
              AND: unitConditions
            },
            select: {
              id: true,
              price: true,
              bedrooms: true,
              bathrooms: true,
              floor: true,
              area: true,
              media: true,
              layout: {
                select: {
                  type: true,
                  mainImage: true,
                  name: true,
                  bathrooms: true,
                  bedrooms: true,
                  totalArea: true
                }
              },
              building: {
                select: {
                  floors: true,
                  floorPlans: true
                }
              },
              project: {
                select: {
                  id: true,
                  translations: true,
                  location: true,
                  media: true,
                  developer: {
                    select: {
                      id: true,
                      translations: true,
                      logo: true
                    }
                  },
                  amenities: {
                    select: {
                      amenity: true
                    }
                  },
                  yield: true
                }
              }
            }
          }
        }
      });

      // Фильтруем проекты с координатами и форматируем данные
      const markers = projects
        .filter(p => p.location?.latitude && p.location?.longitude)
        .map(p => ({
          id: p.id,
          lat: p.location!.latitude,
          lng: p.location!.longitude,
          title: p.translations[0]?.name || "Untitled",
          type: "unit" as const,
          data: p.units.map(unit => ({
            ...unit,
            project: {
              ...unit.project,
              units: [] // Очищаем units чтобы избежать рекурсии
            }
          })),
          count: p.units.length
        }));

      return NextResponse.json({ markers });

    } else {
      // Для проектов: возвращаем только необходимые данные для маркеров
      const projects = await prisma.project.findMany({
        where: {
          units: {
            some: {
              AND: unitConditions
            }
          },
          ...(completion ? {
            buildingStatus: completion === 'ready' 
              ? "COMPLETED" 
              : completion === 'under_construction'
              ? "UNDER_CONSTRUCTION"
              : "PLANNING"
          } : {})
        },
        select: {
          id: true,
          location: {
            select: {
              latitude: true,
              longitude: true,
              country: true,
              city: true,
              district: true,
              address: true,
              beachDistance: true,
              centerDistance: true,
              createdAt: true,
              updatedAt: true
            }
          },
          translations: true,
          media: true,
          developer: {
            select: {
              id: true,
              translations: true,
              logo: true
            }
          },
          amenities: {
            select: {
              amenity: true
            }
          },
          units: {
            where: {
              AND: unitConditions
            },
            select: {
              id: true,
              price: true,
              bedrooms: true,
              bathrooms: true,
              area: true,
              status: true,
              layout: {
                select: {
                  id: true,
                  type: true
                }
              },
              createdAt: true,
              updatedAt: true
            }
          },
          yield: true
        }
      });

      // Фильтруем проекты с координатами и форматируем данные
      const markers = projects
        .filter(p => p.location?.latitude && p.location?.longitude)
        .map(p => {
          console.log('=== Processing project for marker ===', {
            projectId: p.id,
            projectName: p.translations[0]?.name,
            unitsCount: p.units.length,
            hasLocation: !!p.location,
            coordinates: {
              lat: p.location?.latitude,
              lng: p.location?.longitude
            },
            units: p.units.map(u => ({
              id: u.id,
              price: u.price,
              layout: u.layout ? {
                type: u.layout.type,
                id: u.layout.id
              } : null
            }))
          });

          const minPrice = p.units.reduce((min, unit) => {
            if (!unit.price) return min;
            return min === null || unit.price < min ? unit.price : min;
          }, null as number | null);

          return {
            id: p.id,
            lat: p.location!.latitude,
            lng: p.location!.longitude,
            title: p.translations[0]?.name || "Untitled",
            type: "project" as const,
            data: {
              ...p,
              location: p.location
            },
            price: minPrice
          };
        });

      console.log('=== Final markers ===', {
        totalProjects: projects.length,
        totalMarkers: markers.length,
        markersWithVillas: markers.filter(m => {
          const project = m.data as any;
          return project.units.some((u: any) => u.layout?.type === 'VILLA');
        }).length
      });

      return NextResponse.json({ markers });
    }

  } catch (error) {
    console.error('Map markers error:', error);
    return NextResponse.json(
      { error: 'Failed to get map markers' },
      { status: 500 }
    );
  }
} 