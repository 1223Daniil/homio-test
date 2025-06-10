import { prisma } from "@/lib/prisma";

/**
 * Получает проект по ID со всеми связанными данными
 */
export async function getProject(id: string) {
  try {
    console.log(`Fetching project with ID: ${id}`);

    // Получаем проект из базы данных
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        developer: true,
        location: true,
        amenities: true,
        media: true,
        propertyTypes: true,
        units: true,
        buildings: true,
        documents: true
      }
    });

    if (!project) {
      console.log(`Project with ID ${id} not found`);
      throw new Error(`Project with ID ${id} not found`);
    }

    console.log(`Project found: ${project.name}`);
    console.log(`Buildings count: ${project.buildings?.length || 0}`);

    // Для тестирования добавляем моковые данные для поэтажных планов
    // @ts-ignore - игнорируем ошибки типов для тестовых данных
    if (!project.buildings || project.buildings.length === 0) {
      console.log("No buildings found, adding mock building");
      // @ts-ignore
      project.buildings = [
        {
          id: "building-1",
          name: "Building 1",
          projectId: project.id
        }
      ];
    }

    // @ts-ignore
    const buildings = project.buildings || [];

    // Для каждого здания добавляем моковые этажи, если их нет
    for (let i = 0; i < buildings.length; i++) {
      const building = buildings[i];

      // @ts-ignore
      if (!building.floors || building.floors.length === 0) {
        console.log(
          `Adding mock floors to building ${building.name || building.id}`
        );

        const mockFloors = [
          {
            id: `floor-1-${building.id}`,
            number: 1,
            imageUrl: "/images/floor-plan-placeholder.jpg",
            svgData: JSON.stringify([
              {
                unitId: `unit-1-${building.id}`,
                svgPath: "M10,10 L90,10 L90,40 L10,40 Z"
              },
              {
                unitId: `unit-2-${building.id}`,
                svgPath: "M10,50 L90,50 L90,90 L10,90 Z"
              },
              {
                unitId: `unit-3-${building.id}`,
                svgPath: "M10,10 L40,10 L40,40 L10,40 Z"
              }
            ]),
            units: [
              {
                id: `unit-1-${building.id}`,
                number: "36",
                status: "AVAILABLE",
                floor: 1,
                bedrooms: 0,
                price: 4800000,
                area: 36,
                windowView: "sea"
              },
              {
                id: `unit-2-${building.id}`,
                number: "37",
                status: "RESERVED",
                floor: 1,
                bedrooms: 1,
                price: 6500000,
                area: 48,
                windowView: "city"
              },
              {
                id: `unit-3-${building.id}`,
                number: "38",
                status: "SOLD",
                floor: 1,
                bedrooms: 2,
                price: 8200000,
                area: 65,
                windowView: "garden"
              }
            ],
            areas: [
              {
                unitId: `unit-1-${building.id}`,
                svgPath: "M10,10 L90,10 L90,40 L10,40 Z",
                status: "AVAILABLE"
              },
              {
                unitId: `unit-2-${building.id}`,
                svgPath: "M10,50 L90,50 L90,90 L10,90 Z",
                status: "RESERVED"
              },
              {
                unitId: `unit-3-${building.id}`,
                svgPath: "M10,10 L40,10 L40,40 L10,40 Z",
                status: "SOLD"
              }
            ]
          },
          {
            id: `floor-2-${building.id}`,
            number: 2,
            imageUrl: "/images/floor-plan-placeholder.jpg",
            svgData: JSON.stringify([
              {
                unitId: `unit-4-${building.id}`,
                svgPath: "M10,10 L90,10 L90,40 L10,40 Z"
              },
              {
                unitId: `unit-5-${building.id}`,
                svgPath: "M10,50 L90,50 L90,90 L10,90 Z"
              }
            ]),
            units: [
              {
                id: `unit-4-${building.id}`,
                number: "42",
                status: "AVAILABLE",
                floor: 2,
                bedrooms: 1,
                price: 5200000,
                area: 42,
                windowView: "mountain"
              },
              {
                id: `unit-5-${building.id}`,
                number: "43",
                status: "UNAVAILABLE",
                floor: 2,
                bedrooms: 3,
                price: 9800000,
                area: 85,
                windowView: "sea"
              }
            ],
            areas: [
              {
                unitId: `unit-4-${building.id}`,
                svgPath: "M10,10 L90,10 L90,40 L10,40 Z",
                status: "AVAILABLE"
              },
              {
                unitId: `unit-5-${building.id}`,
                svgPath: "M10,50 L90,50 L90,90 L10,90 Z",
                status: "UNAVAILABLE"
              }
            ]
          },
          {
            id: `floor-3-${building.id}`,
            number: 3,
            imageUrl: "/images/floor-plan-placeholder.jpg",
            svgData: JSON.stringify([
              {
                unitId: `unit-6-${building.id}`,
                svgPath: "M10,10 L90,10 L90,90 L10,90 Z"
              }
            ]),
            units: [
              {
                id: `unit-6-${building.id}`,
                number: "BD28",
                status: "AVAILABLE",
                floor: 3,
                bedrooms: 0,
                price: 4800000,
                area: 36,
                windowView: "city"
              }
            ],
            areas: [
              {
                unitId: `unit-6-${building.id}`,
                svgPath: "M10,10 L90,10 L90,90 L10,90 Z",
                status: "AVAILABLE"
              }
            ]
          },
          {
            id: `floor-4-${building.id}`,
            number: 4,
            imageUrl: "/images/floor-plan-placeholder.jpg",
            svgData: JSON.stringify([]),
            units: [],
            areas: []
          },
          {
            id: `floor-5-${building.id}`,
            number: 5,
            imageUrl: "/images/floor-plan-placeholder.jpg",
            svgData: JSON.stringify([]),
            units: [],
            areas: []
          },
          {
            id: `floor-6-${building.id}`,
            number: 6,
            imageUrl: "/images/floor-plan-placeholder.jpg",
            svgData: JSON.stringify([]),
            units: [],
            areas: []
          }
        ];

        // Добавляем моковые данные к зданию
        // @ts-ignore
        building.floors = mockFloors;
      } else {
        // @ts-ignore
        console.log(
          `Building ${building.name || building.id} already has ${building.floors.length} floors`
        );
      }
    }

    return project;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
}

/**
 * Получает проект по slug со всеми связанными данными
 */
export async function getProjectBySlug(slug: string) {
  try {
    console.log(`Fetching project with slug: ${slug}`);

    // Получаем проект из базы данных по слагу
    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        developer: true,
        location: true,
        amenities: true,
        media: true,
        propertyTypes: true,
        units: true,
        buildings: true,
        documents: true
      }
    });

    if (!project) {
      console.log(`Project with slug ${slug} not found`);
      throw new Error(`Project with slug ${slug} not found`);
    }

    console.log(`Project found: ${project.name}`);
    console.log(`Buildings count: ${project.buildings?.length || 0}`);

    // Для тестирования добавляем моковые данные для поэтажных планов
    // @ts-ignore - игнорируем ошибки типов для тестовых данных
    if (!project.buildings || project.buildings.length === 0) {
      console.log("No buildings found, adding mock building");
      // @ts-ignore
      project.buildings = [
        {
          id: "building-1",
          name: "Building 1",
          projectId: project.id
        }
      ];
    }

    // @ts-ignore
    const buildings = project.buildings || [];

    // Для каждого здания добавляем моковые этажи, если их нет
    for (let i = 0; i < buildings.length; i++) {
      const building = buildings[i];

      if (!building) continue;

      // @ts-ignore
      if (!building.floors || building.floors.length === 0) {
        console.log(
          `Adding mock floors to building ${building.name || building.id}`
        );

        const mockFloors = [
          {
            id: `floor-1-${building.id}`,
            number: 1,
            imageUrl: "/images/floor-plan-placeholder.jpg",
            svgData: JSON.stringify([
              {
                unitId: `unit-1-${building.id}`,
                svgPath: "M10,10 L90,10 L90,40 L10,40 Z"
              },
              {
                unitId: `unit-2-${building.id}`,
                svgPath: "M10,50 L90,50 L90,90 L10,90 Z"
              },
              {
                unitId: `unit-3-${building.id}`,
                svgPath: "M10,10 L40,10 L40,40 L10,40 Z"
              }
            ]),
            units: [
              {
                id: `unit-1-${building.id}`,
                number: "36",
                status: "AVAILABLE",
                floor: 1,
                bedrooms: 0,
                price: 4800000,
                area: 36,
                windowView: "sea"
              },
              {
                id: `unit-2-${building.id}`,
                number: "37",
                status: "RESERVED",
                floor: 1,
                bedrooms: 1,
                price: 6500000,
                area: 48,
                windowView: "city"
              },
              {
                id: `unit-3-${building.id}`,
                number: "38",
                status: "SOLD",
                floor: 1,
                bedrooms: 2,
                price: 8200000,
                area: 65,
                windowView: "garden"
              }
            ],
            areas: [
              {
                unitId: `unit-1-${building.id}`,
                svgPath: "M10,10 L90,10 L90,40 L10,40 Z",
                status: "AVAILABLE"
              },
              {
                unitId: `unit-2-${building.id}`,
                svgPath: "M10,50 L90,50 L90,90 L10,90 Z",
                status: "RESERVED"
              },
              {
                unitId: `unit-3-${building.id}`,
                svgPath: "M10,10 L40,10 L40,40 L10,40 Z",
                status: "SOLD"
              }
            ]
          },
          {
            id: `floor-2-${building.id}`,
            number: 2,
            imageUrl: "/images/floor-plan-placeholder.jpg",
            svgData: JSON.stringify([
              {
                unitId: `unit-4-${building.id}`,
                svgPath: "M10,10 L90,10 L90,40 L10,40 Z"
              },
              {
                unitId: `unit-5-${building.id}`,
                svgPath: "M10,50 L90,50 L90,90 L10,90 Z"
              }
            ]),
            units: [
              {
                id: `unit-4-${building.id}`,
                number: "42",
                status: "AVAILABLE",
                floor: 2,
                bedrooms: 1,
                price: 5200000,
                area: 42,
                windowView: "mountain"
              },
              {
                id: `unit-5-${building.id}`,
                number: "43",
                status: "UNAVAILABLE",
                floor: 2,
                bedrooms: 3,
                price: 9800000,
                area: 85,
                windowView: "sea"
              }
            ],
            areas: [
              {
                unitId: `unit-4-${building.id}`,
                svgPath: "M10,10 L90,10 L90,40 L10,40 Z",
                status: "AVAILABLE"
              },
              {
                unitId: `unit-5-${building.id}`,
                svgPath: "M10,50 L90,50 L90,90 L10,90 Z",
                status: "UNAVAILABLE"
              }
            ]
          },
          {
            id: `floor-3-${building.id}`,
            number: 3,
            imageUrl: "/images/floor-plan-placeholder.jpg",
            svgData: JSON.stringify([
              {
                unitId: `unit-6-${building.id}`,
                svgPath: "M10,10 L90,10 L90,90 L10,90 Z"
              }
            ]),
            units: [
              {
                id: `unit-6-${building.id}`,
                number: "BD28",
                status: "AVAILABLE",
                floor: 3,
                bedrooms: 0,
                price: 4800000,
                area: 36,
                windowView: "city"
              }
            ],
            areas: [
              {
                unitId: `unit-6-${building.id}`,
                svgPath: "M10,10 L90,10 L90,90 L10,90 Z",
                status: "AVAILABLE"
              }
            ]
          },
          {
            id: `floor-4-${building.id}`,
            number: 4,
            imageUrl: "/images/floor-plan-placeholder.jpg",
            svgData: JSON.stringify([]),
            units: [],
            areas: []
          },
          {
            id: `floor-5-${building.id}`,
            number: 5,
            imageUrl: "/images/floor-plan-placeholder.jpg",
            svgData: JSON.stringify([]),
            units: [],
            areas: []
          },
          {
            id: `floor-6-${building.id}`,
            number: 6,
            imageUrl: "/images/floor-plan-placeholder.jpg",
            svgData: JSON.stringify([]),
            units: [],
            areas: []
          }
        ];

        // Добавляем моковые данные к зданию
        // @ts-ignore
        building.floors = mockFloors;
      } else {
        // @ts-ignore
        console.log(
          `Building ${building.name || building.id} already has ${
            Array.isArray(building.floors) ? building.floors.length : 0
          } floors`
        );
      }
    }

    return project;
  } catch (error) {
    console.error("Error fetching project by slug:", error);
    throw error;
  }
}
