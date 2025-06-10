import { PrismaClient, ProjectStatus, UnitLayoutStatus, UnitStatus, BuildingMediaCategory } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const BUILDING_ID = "cm7eomk0k000s11a4006ow9n9";
const PROJECT_ID = "9eb5dced-6dfa-430f-b1c4-cf0533f00a8d";

// Реальные изображения из проекта
const DEMO_IMAGES = [
  'https://storage.yandexcloud.net/homio/uploads/d6e10cad-cc59-49f3-97cb-fd12b86336dc.png',
  'https://storage.yandexcloud.net/homio/uploads/bc8c0c3c-aef4-4997-8b60-2904e6a575ef.png',
  'https://storage.yandexcloud.net/homio/uploads/e4ed1f32-5bb1-42b1-a64b-6ea65ca15794.png',
  'https://storage.yandexcloud.net/homio/10c31455-99a7-4c03-aad5-c723c5ad6ea3-Banner - The ArtRio 16_9.png',
  // Изображения из второго проекта для разнообразия
  'https://storage.yandexcloud.net/homio/uploads/b9cd4cc1-d8b6-4c04-ad3c-d28ace29551d.png',
  'https://storage.yandexcloud.net/homio/uploads/0c19d5b3-cdc1-4c80-8cc6-6831fddf99ae.png',
  'https://storage.yandexcloud.net/homio/uploads/c6e1e3cf-fc5f-42ec-a750-de37d52e5ecb.png',
  'https://storage.yandexcloud.net/homio/uploads/cd390233-5615-442b-8db4-d1c945662a0e.png'
];

// Генератор SVG-путей для демо областей (теперь с более реалистичными размерами)
const generateDemoSvgPaths = () => {
  const paths = [
    // Студия
    'M 100 100 L 250 100 L 250 200 L 100 200 Z',
    // 1-спальная квартира L-формы
    'M 100 100 L 300 100 L 300 200 L 200 200 L 200 300 L 100 300 Z',
    // 2-спальная квартира прямоугольной формы
    'M 100 100 L 400 100 L 400 250 L 100 250 Z',
    // 3-спальная квартира сложной формы
    'M 100 100 L 400 100 L 400 150 L 350 150 L 350 300 L 400 300 L 400 400 L 100 400 Z',
    // Пентхаус с террасой
    'M 100 100 L 500 100 L 500 400 L 400 400 L 400 300 L 100 300 Z M 400 300 L 500 300 L 500 400 L 400 400 Z'
  ];
  return paths[Math.floor(Math.random() * paths.length)];
};

// Генератор координат для областей
const generateAreaCoordinates = (svgPath: string) => {
  // Извлекаем точки из SVG path
  const points = svgPath.split(' ')
    .filter(p => p !== 'M' && p !== 'L' && p !== 'Z')
    .map(p => {
      const [x, y] = p.split(' ');
      return { x: parseFloat(x), y: parseFloat(y) };
    });
  
  return points;
};

// Генератор стилей для областей с улучшенными цветами
const generateAreaStyle = (status: string) => {
  const styles = {
    ACTIVE: {
      fill: 'rgba(46, 204, 113, 0.2)', // Зеленый
      stroke: '#2ecc71',
      strokeWidth: 2,
      opacity: 0.8
    },
    INACTIVE: {
      fill: 'rgba(241, 196, 15, 0.2)', // Желтый
      stroke: '#f1c40f',
      strokeWidth: 2,
      opacity: 0.8
    },
    SOLD_OUT: {
      fill: 'rgba(231, 76, 60, 0.2)', // Красный
      stroke: '#e74c3c',
      strokeWidth: 2,
      opacity: 0.8
    },
    DRAFT: {
      fill: 'rgba(189, 195, 199, 0.2)', // Серый
      stroke: '#bdc3c7',
      strokeWidth: 2,
      opacity: 0.8
    }
  };
  return styles[status as keyof typeof styles] || styles.ACTIVE;
};

// Генератор общих зон для этажа
const generateCommonAreas = (floorPlanId: string) => [
  {
    floorPlanId,
    svgPath: 'M 50 50 L 150 50 L 150 150 L 50 150 Z',
    coordinates: generateAreaCoordinates('M 50 50 L 150 50 L 150 150 L 50 150 Z'),
    area: 25,
    type: 'ELEVATOR',
    name: 'Elevator Hall',
    description: 'Main elevator hall with 2 high-speed elevators',
    style: {
      fill: 'rgba(52, 152, 219, 0.2)', // Синий
      stroke: '#3498db',
      strokeWidth: 2,
      opacity: 0.8
    }
  },
  {
    floorPlanId,
    svgPath: 'M 200 50 L 600 50 L 600 100 L 200 100 Z',
    coordinates: generateAreaCoordinates('M 200 50 L 600 50 L 600 100 L 200 100 Z'),
    area: 40,
    type: 'CORRIDOR',
    name: 'Main Corridor',
    description: 'Main corridor with natural lighting',
    style: {
      fill: 'rgba(155, 89, 182, 0.2)', // Фиолетовый
      stroke: '#9b59b6',
      strokeWidth: 2,
      opacity: 0.8
    }
  },
  {
    floorPlanId,
    svgPath: 'M 650 50 L 750 50 L 750 150 L 650 150 Z',
    coordinates: generateAreaCoordinates('M 650 50 L 750 50 L 750 150 L 650 150 Z'),
    area: 20,
    type: 'TECHNICAL',
    name: 'Technical Room',
    description: 'Technical equipment and communications',
    style: {
      fill: 'rgba(149, 165, 166, 0.2)', // Серый
      stroke: '#95a5a6',
      strokeWidth: 2,
      opacity: 0.8
    }
  }
];

function generateUnits(floor: number, basePrice: number) {
  const units = [];
  const unitsPerFloor = Math.floor(Math.random() * 4) + 4; // 4-8 units per floor
  const unitTypes = [
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
  ];

  for (let unit = 1; unit <= unitsPerFloor; unit++) {
    const unitType = unitTypes[Math.floor(Math.random() * unitTypes.length)];
    const unitNumber = `${floor.toString().padStart(2, "0")}${unit.toString().padStart(2, "0")}`;

    // Increase price for higher floors
    const floorMultiplier = 1 + (floor / 30) * 0.3; // Assuming max 30 floors

    units.push({
      name: `${unitType.type} ${unitNumber}`,
      price: Math.round(basePrice * unitType.priceMultiplier * floorMultiplier),
      floor,
      status: Math.random() > 0.3 ? UnitStatus.AVAILABLE : UnitStatus.RESERVED,
      number: unitNumber,
      area: unitType.size,
      bathrooms: unitType.bathrooms,
      bedrooms: unitType.bedrooms,
      projectId: PROJECT_ID,
      buildingId: BUILDING_ID
    });
  }

  return units;
}

async function seedFloorPlans() {
  try {
    console.log("Starting to seed floor plans and units...");

    // Delete existing floor plans and units for this building
    await prisma.floorPlan.deleteMany({
      where: { buildingId: BUILDING_ID }
    });

    await prisma.unit.deleteMany({
      where: { buildingId: BUILDING_ID }
    });

    // Generate floor plans and units for 30 floors
    const totalFloors = 30;
    const basePrice = 150000; // Base price in USD

    for (let floor = 1; floor <= totalFloors; floor++) {
      // Create floor plan
      const floorPlan = await prisma.floorPlan.create({
        data: {
          buildingId: BUILDING_ID,
          floorNumber: floor,
          name: `Floor ${floor}`,
          imageUrl: `https://storage.yandexcloud.net/homio/floor-plans/floor-${floor}.png`,
          status: 'DRAFT',
          svgData: JSON.stringify([]), // Empty SVG data initially
        }
      });

      // Create media for floor plan
      await prisma.buildingMedia.create({
        data: {
          buildingId: BUILDING_ID,
          type: 'photo',
          url: `https://storage.yandexcloud.net/homio/floor-plans/floor-${floor}.png`,
          title: `Floor ${floor} Plan`,
          category: BuildingMediaCategory.FLOOR_PLANS
        }
      });

      // Generate and create units for this floor
      const units = generateUnits(floor, basePrice);
      for (const unit of units) {
        await prisma.unit.create({
          data: unit
        });
      }

      console.log(`Created floor plan and units for floor ${floor}`);
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
seedFloorPlans()
  .catch((error) => {
    console.error("Error executing seed:", error);
    process.exit(1);
  });

export default seedFloorPlans; 