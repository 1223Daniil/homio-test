import {
  PrismaClient,
  ProjectType,
  ProjectStatus,
  UnitStatus
} from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const TOTAL_PROJECTS = 100;
const MIN_UNITS = 50;
const MAX_UNITS = 200;
const MIN_FLOORS = 8;
const MAX_FLOORS = 30;

async function generateProject(developerId: string) {
  const projectName = faker.company.name() + " " + faker.location.street();

  // Сначала создаем локацию
  const location = await prisma.location.create({
    data: {
      country: "Thailand",
      city: "Phuket",
      district: faker.helpers.arrayElement([
        "Bangtao",
        "Surin",
        "Kamala",
        "Patong",
        "Kata",
        "Karon",
        "Rawai",
        "Chalong"
      ]),
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
      beachDistance: faker.number.float({
        min: 0.1,
        max: 5.0,
        fractionDigits: 1
      }),
      centerDistance: faker.number.float({
        min: 1.0,
        max: 15.0,
        fractionDigits: 1
      })
    }
  });

  // Создаем проект
  const project = await prisma.project.create({
    data: {
      name: projectName,
      slug: projectName.toLowerCase().replace(/\s+/g, "-"),
      type: faker.helpers.arrayElement(Object.values(ProjectType)),
      status: faker.helpers.arrayElement(Object.values(ProjectStatus)),
      developer: {
        connect: {
          id: developerId
        }
      },
      location: {
        connect: {
          id: location.id
        }
      },
      translations: {
        create: [
          {
            language: "en",
            name: projectName,
            description: faker.lorem.paragraph()
          },
          {
            language: "ru",
            name: projectName,
            description: faker.lorem.paragraph()
          }
        ]
      }
    }
  });

  // Создаем pricing
  const projectPricing = await prisma.projectPricing.create({
    data: {
      projectId: project.id,
      basePrice: faker.number.int({ min: 3000000, max: 15000000 }),
      currency: "THB",
      pricePerSqm: faker.number.int({ min: 50000, max: 200000 }),
      maintenanceFee: faker.number.float({
        min: 30,
        max: 100,
        fractionDigits: 1
      }),
      maintenanceFeePeriod: "MONTHLY"
    }
  });

  // Создаем yield
  const projectYield = await prisma.projectYield.create({
    data: {
      projectId: project.id,
      guaranteed: faker.number.float({ min: 5, max: 8, fractionDigits: 1 }),
      potential: faker.number.float({ min: 8, max: 12, fractionDigits: 1 }),
      occupancy: faker.number.float({ min: 70, max: 95, fractionDigits: 1 }),
      years: "5"
    }
  });

  return {
    ...project,
    pricing: projectPricing,
    yield: projectYield
  };
}

export async function seedProjects() {
  console.log("🌱 Seeding projects...");

  // Get all developers
  const developers = await prisma.developer.findMany();

  if (!developers.length) {
    throw new Error("No developers found. Please seed developers first.");
  }

  // Create projects
  for (let i = 0; i < TOTAL_PROJECTS; i++) {
    const developerId = developers[i % developers.length].id;

    // Check if project with this name already exists
    const projectName = faker.company.name() + " " + faker.location.street();
    const existingProject = await prisma.projectTranslation.findFirst({
      where: { name: projectName },
      include: { project: true }
    });

    if (existingProject) {
      console.log(`Project "${projectName}" already exists, skipping...`);
      continue;
    }

    const projectData = await generateProject(developerId);
    const project = await prisma.project.create({
      data: {
        type: "RESIDENTIAL",
        name: "Demo Project",
        slug: "demo-project",
        status: "ACTIVE",
        developer: {
          connect: {
            id: developerId
          }
        },
        location: {
          create: {
            country: "Thailand",
            city: "Phuket",
            district: "Bangtao",
            latitude: 7.9519,
            longitude: 98.2989,
            beachDistance: 500,
            centerDistance: 2000
          }
        },
        translations: {
          create: [
            {
              language: "en",
              name: "Demo Project",
              description: "English description"
            },
            {
              language: "ru",
              name: "Демо Проект",
              description: "Russian description"
            }
          ]
        }
      }
    });

    // Создаем pricing отдельно после создания проекта
    const pricing = await prisma.projectPricing.create({
      data: {
        projectId: project.id,
        basePrice: 5000000,
        currency: "THB",
        pricePerSqm: 100000
      }
    });

    console.log(`Created project with ID: ${project.id}`);

    // Create units for the project
    const unitsCount = faker.number.int({ min: MIN_UNITS, max: MAX_UNITS });
    const totalFloors = faker.number.int({ min: MIN_FLOORS, max: MAX_FLOORS });
    const unitsPerFloor = Math.ceil(unitsCount / totalFloors);
    let totalProjectUnits = 0;

    // Получаем pricing для расчета цен юнитов
    const projectPricing = await prisma.projectPricing.findUnique({
      where: { projectId: project.id }
    });

    const basePrice = projectPricing?.basePrice || 5000000; // Дефолтная цена если нет pricing

    // Сначала создаем здание
    const building = await prisma.building.create({
      data: {
        name: "Main Building",
        floors: totalFloors,
        status: "ACTIVE",
        projectId: project.id
      }
    });

    // Создаем юниты для здания
    for (let floor = 1; floor <= totalFloors; floor++) {
      for (
        let unit = 1;
        unit <= unitsPerFloor && totalProjectUnits < unitsCount;
        unit++
      ) {
        const unitType = faker.helpers.arrayElement([
          {
            type: "Studio",
            size: 35,
            bedrooms: 0,
            bathrooms: 1,
            priceMultiplier: 0.7
          },
          {
            type: "1-Bedroom",
            size: 45,
            bedrooms: 1,
            bathrooms: 1,
            priceMultiplier: 0.85
          },
          {
            type: "2-Bedroom",
            size: 65,
            bedrooms: 2,
            bathrooms: 2,
            priceMultiplier: 1
          },
          {
            type: "3-Bedroom",
            size: 85,
            bedrooms: 3,
            bathrooms: 2,
            priceMultiplier: 1.3
          }
        ]);

        const unitNumber = `${floor.toString().padStart(2, "0")}${unit
          .toString()
          .padStart(2, "0")}`;

        // Увеличиваем цену на верхних этажах
        const floorMultiplier = 1 + (floor / totalFloors) * 0.3;

        await prisma.unit.create({
          data: {
            projectId: project.id,
            buildingId: building.id,
            name: `${unitType.type} ${unitNumber}`,
            price: Math.round(
              basePrice * unitType.priceMultiplier * floorMultiplier
            ),
            floor,
            status:
              Math.random() > 0.3 ? UnitStatus.AVAILABLE : UnitStatus.RESERVED,
            number: unitNumber,
            area: unitType.size,
            bathrooms: unitType.bathrooms,
            bedrooms: unitType.bedrooms
          }
        });

        totalProjectUnits++;
      }
    }

    console.log(`Created ${totalProjectUnits} units for project ${project.id}`);
  }

  console.log("✅ Projects seeding completed");
}

export default seedProjects;
