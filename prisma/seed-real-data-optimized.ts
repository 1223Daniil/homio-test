import { PrismaClient, ProjectStatus, ProjectType, UnitStatus, MediaCategory, UnitMediaCategory, Prisma } from "@prisma/client";
import * as data from "./exported-data.json";
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Константы для генерации данных
const ITERATIONS = 5; // Количество итераций для каждого девелопера
const UNITS_PER_BUILDING = 20;
const FLOORS_PER_BUILDING = 8;

// Реальные изображения для проектов
const PROJECT_IMAGES = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1000"
];

// Реальные изображения для зданий
const BUILDING_IMAGES = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1000"
];

// Реальные изображения для юнитов
const UNIT_IMAGES = [
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1000",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1000",
  "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1000"
];

interface UnitMedia {
  type: string;
  url: string;
  title: string;
  description: string;
  category: UnitMediaCategory;
  order: number;
}

interface UnitFeature {
  name: string;
  value?: string;
}

interface Unit {
  projectId: string;
  buildingId: string;
  name: string;
  price: number;
  currencyId: string;
  floor: number;
  status: UnitStatus;
  number: string;
  area: number;
  bathrooms: number;
  bedrooms: number;
  view: string;
  location: string;
  coordinates: string;
  unitType: string;
  furniturePackage: boolean;
  features: UnitFeature[];
  media: UnitMedia[];
}

type UnitCreateInput = Prisma.UnitCreateInput;
type UnitFeatureCreateInput = Prisma.UnitFeatureCreateInput;
type UnitMediaCreateInput = Prisma.UnitMediaCreateInput;

// Генератор юнитов
async function createUnits(
  projectId: string,
  buildingId: string,
  totalUnits: number,
  basePrice: number,
  floors: number,
  currencyId: string
): Promise<UnitCreateInput[]> {
  const units: UnitCreateInput[] = [];
  const unitsPerFloor = Math.ceil(totalUnits / floors);
  const unitTypes = [
    {
      type: "Studio",
      size: 35,
      bedrooms: 0,
      bathrooms: 1,
      priceMultiplier: 0.7,
      features: [
        "Smart Home System",
        "Built-in Wardrobe",
        "Air Conditioning"
      ]
    },
    {
      type: "1-Bedroom",
      size: 45,
      bedrooms: 1,
      bathrooms: 1,
      priceMultiplier: 0.85,
      features: [
        "Balcony",
        "Kitchen Island",
        "Walk-in Closet",
        "Smart Home System"
      ]
    },
    {
      type: "2-Bedroom",
      size: 65,
      bedrooms: 2,
      bathrooms: 2,
      priceMultiplier: 1,
      features: [
        "Sea View",
        "Private Pool",
        "Maid's Room",
        "Smart Home System"
      ]
    },
    {
      type: "3-Bedroom",
      size: 85,
      bedrooms: 3,
      bathrooms: 2,
      priceMultiplier: 1.3,
      features: [
        "Panoramic View",
        "Private Pool",
        "Garden",
        "Smart Home System"
      ]
    }
  ];

  for (let floor = 1; floor <= floors; floor++) {
    for (let unit = 1; unit <= unitsPerFloor && units.length < totalUnits; unit++) {
      const unitType = unitTypes[Math.floor(Math.random() * unitTypes.length)];
      const unitNumber = `${floor.toString().padStart(2, "0")}${unit.toString().padStart(2, "0")}`;
      const floorMultiplier = 1 + (floor / floors) * 0.3;
      const price = Math.round(basePrice * unitType.priceMultiplier * floorMultiplier);

      const createdUnit = await prisma.unit.create({
        data: {
          project: { connect: { id: projectId } },
          building: { connect: { id: buildingId } },
          name: `${unitType.type} ${unitNumber}`,
          price,
          currency: currencyId ? { connect: { id: currencyId } } : undefined,
          floor,
          status: Math.random() > 0.3 ? UnitStatus.AVAILABLE : UnitStatus.RESERVED,
          number: unitNumber,
          area: unitType.size,
          bathrooms: unitType.bathrooms,
          bedrooms: unitType.bedrooms,
          view: floor > floors / 2 ? "Sea View" : "City View",
          location: `Building ${buildingId}, Floor ${floor}`,
          coordinates: `{x: ${Math.random()}, y: ${Math.random()}}`,
          unitType: unitType.type,
          furniturePackage: Math.random() > 0.5,
          features: {
            create: unitType.features.map(feature => ({
              name: feature
            }))
          },
          media: {
            create: UNIT_IMAGES.map((url, index) => ({
              type: "image",
              url,
              title: `${unitType.type} Interior ${index + 1}`,
              description: `Beautiful interior view of ${unitType.type} unit`,
              category: UnitMediaCategory.GALLERY,
              order: index
            }))
          }
        }
      });

      units.push(createdUnit);
    }
  }

  return units;
}

// Основная функция сидирования
async function seedRealData() {
  console.log("Starting optimized real data seeding...");
  try {
    console.log("Creating basic entities...");

    // Create currency first
    const usdCurrency = await prisma.currency.upsert({
      where: { code: "USD" },
      update: {
        symbol: "$",
        name: "US Dollar",
        rate: 1,
        isBaseCurrency: true
      },
      create: {
        code: "USD",
        symbol: "$",
        name: "US Dollar",
        rate: 1,
        isBaseCurrency: true
      }
    });

    // Create developer
    const developer = await prisma.developer.create({
      data: {
        translations: {
          create: {
            language: "en",
            name: "Luxury Homes Developer",
            description: "A leading developer of luxury residential properties"
          }
        },
        logo: "https://example.com/logo.png",
        website: "https://example.com",
        contactEmail: "contact@example.com",
        contactPhone: "+1234567890",
        address: "123 Developer Street",
        establishedYear: 2000,
        completedUnits: 1000,
        completedProjects: 50,
        ongoingUnits: 200,
        ongoingProjects: 5,
        deliveryRate: 95
      }
    });

    // Create location
    const location = await prisma.location.create({
      data: {
        country: "Thailand",
        city: "Phuket",
        district: "Laguna",
        address: "123 Beach Road",
        latitude: 7.9519,
        longitude: 98.3381,
        beachDistance: 0.5,
        centerDistance: 2.0
      }
    });

    // Create project
    const project = await prisma.project.create({
      data: {
        name: "Luxury Beach Residences",
        slug: `luxury-beach-residences-${Date.now()}`,
        description: "A luxury beachfront residential project",
        type: ProjectType.RESIDENTIAL,
        status: ProjectStatus.CONSTRUCTION,
        developer: { connect: { id: developer.id } },
        location: { connect: { id: location.id } },
        totalLandArea: 10000,
        infrastructureArea: 2000,
        totalBuildings: 3,
        totalUnits: 150,
        buildingProgress: 60,
        phase: 1,
        publicTransport: 4,
        amenitiesLevel: 5,
        climateConditions: 5,
        beachAccess: 5,
        rentalDemand: 4,
        safetyLevel: 5,
        noiseLevel: 2,
        schoolsAvailable: 3
      }
    });

    // Create building
    const building = await prisma.building.create({
      data: {
        project: { connect: { id: project.id } },
        name: "Tower A",
        floors: 8,
        status: ProjectStatus.CONSTRUCTION,
        description: "Luxury residential tower with sea views"
      }
    });

    // Create units
    const units = await createUnits(
      project.id,
      building.id,
      10, // totalUnits per building
      500000, // basePrice
      8, // floors
      usdCurrency.id
    );

    console.log("Data seeding completed successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
}

// Запускаем сидирование
seedRealData()
  .catch((error) => {
    console.error("Error executing seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 