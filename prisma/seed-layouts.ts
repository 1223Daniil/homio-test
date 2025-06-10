import { PrismaClient, ProjectStatus, ProjectClass, ProjectType, UnitLayoutStatus, UnitLayoutType } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function seedLayouts() {
  try {
    console.log('Starting to seed layouts...');

    // Create location first
    const location = await prisma.location.create({
      data: {
        address: "88 Moo 2, Kathu",
        city: "Phuket",
        country: "Thailand",
        district: "Kathu",
        latitude: 7.9156,
        longitude: 98.3275,
        beachDistance: 2.5,
        centerDistance: 3.2
      }
    });

    // Create project
    const project = await prisma.project.create({
      data: {
        name: "The ArtRio",
        description: "A modern architectural masterpiece combining art and luxury living. Located in a prime area with stunning city views and world-class amenities.",
        type: ProjectType.RESIDENTIAL,
        status: ProjectStatus.CONSTRUCTION,
        class: ProjectClass.PREMIUM,
        completionDate: new Date("2025-06-30T00:00:00.000Z"),
        constructionStatus: 45,
        totalUnits: 120,
        totalBuildings: 2,
        slug: "the-artrio",
        totalLandArea: 12000,
        infrastructureArea: 4000,
        tour3d: "https://my.matterport.com/show/?m=example2",
        purchaseConditions: "Flexible payment plans with 25% down payment",
        phase: 1,
        publicTransport: 85,
        amenitiesLevel: 90,
        climateConditions: 85,
        beachAccess: 70,
        rentalDemand: 90,
        safetyLevel: 95,
        noiseLevel: 30,
        schoolsAvailable: 85,
        ownership: [],
        specialOffers: [],
        promotions: [],
        furniturePackages: [],
        developerId: "cm7enr3n90008143v2gavbf37",
        locationId: location.id,
        translations: {
          create: [
            {
              language: "en",
              name: "The ArtRio",
              description: "A modern architectural masterpiece combining art and luxury living. Located in a prime area with stunning city views and world-class amenities."
            },
            {
              language: "ru",
              name: "Арт Рио",
              description: "Современный архитектурный шедевр, сочетающий искусство и роскошную жизнь. Расположен в престижном районе с потрясающими видами на город и первоклассными удобствами."
            }
          ]
        }
      }
    });

    // Create layouts
    const layouts = await Promise.all(
      Array.from({ length: 5 }, async (_, i) => {
        const totalArea = faker.number.float({ min: 35, max: 200 });
        const livingArea = totalArea * 0.8;
        
        return prisma.unitLayout.create({
          data: {
            projectId: project.id,
            name: `Layout Type ${i + 1}`,
            type: Object.values(UnitLayoutType)[i % Object.values(UnitLayoutType).length],
            description: faker.lorem.paragraph(),
            status: UnitLayoutStatus.ACTIVE,
            totalArea,
            livingArea,
            balconyArea: totalArea * 0.1,
            ceilingHeight: 2.8,
            bedrooms: i + 1,
            bathrooms: Math.ceil((i + 1) / 2),
            windowCount: i + 2,
            orientation: ['NORTH', 'SOUTH', 'EAST', 'WEST'][i % 4],
            energyClass: ['A', 'B', 'C'][i % 3],
            mainImage: faker.image.url(),
            planImage: faker.image.url(),
            tour3d: 'https://my.matterport.com/show/?m=example',
            features: [
              { name: 'Smart Home', value: 'Yes' },
              { name: 'Floor Heating', value: 'Yes' },
              { name: 'Air Conditioning', value: 'Central' }
            ],
            furniture: [
              { item: 'Kitchen', description: 'Built-in kitchen with appliances' },
              { item: 'Wardrobes', description: 'Built-in wardrobes in bedrooms' }
            ],
            finishes: [
              { type: 'Flooring', material: 'Engineered wood' },
              { type: 'Walls', material: 'Premium paint' }
            ],
            floor: i + 1,
            order: i,
            advantages: ['Sea view', 'Spacious balcony', 'Modern design'],
            tags: ['Premium', 'Sea view', 'Smart home'],
            seoTitle: `Type ${i + 1} Layout - Modern Apartment`,
            seoDescription: faker.lorem.sentence(),
            seoKeywords: ['apartment', 'modern', 'premium', 'sea view']
          }
        });
      })
    );

    console.log(`✅ Created ${layouts.length} layouts`);
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding layouts:', error);
  }
}

seedLayouts()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 