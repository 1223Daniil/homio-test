import { PrismaClient, UserRole, ProjectStatus, ProjectType, UnitStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as data from "./exported-data.json";

const prisma = new PrismaClient();

// Helper function from seed-real-data.ts
function generateUnits(
  projectId: string,
  totalUnits: number,
  basePrice: number,
  floors: number
) {
  const units = [];
  const unitsPerFloor = Math.ceil(totalUnits / floors);
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

  for (let floor = 1; floor <= floors; floor++) {
    for (let unit = 1; unit <= unitsPerFloor && units.length < totalUnits; unit++) {
      const unitType = unitTypes[Math.floor(Math.random() * unitTypes.length)];
      const unitNumber = `${floor.toString().padStart(2, "0")}${unit.toString().padStart(2, "0")}`;
      const floorMultiplier = 1 + (floor / floors) * 0.3;

      units.push({
        projectId,
        title: `${unitType.type} ${unitNumber}`,
        description: `${unitType.bedrooms} bedroom unit with ${unitType.bathrooms} bathroom(s)`,
        price: Math.round(basePrice * unitType.priceMultiplier * floorMultiplier),
        floor,
        status: Math.random() > 0.3 ? UnitStatus.AVAILABLE : UnitStatus.RESERVED,
        unitNumber,
        area: unitType.size,
        bathrooms: unitType.bathrooms,
        bedrooms: unitType.bedrooms,
        size: unitType.size
      });
    }
  }

  return units;
}

async function seedMinimal() {
  console.log("Starting minimal seed...");
  
  // Create all roles
  const roles = [
    { 
      name: UserRole.ADMIN,
      permissions: {
        users: ["create", "read", "update", "delete"],
        projects: ["create", "read", "update", "delete"],
        developers: ["create", "read", "update", "delete"],
      }
    },
    { 
      name: UserRole.DEVELOPER,
      permissions: {
        projects: ["create", "read", "update"],
        developers: ["read"],
      }
    },
    { 
      name: UserRole.AGENT,
      permissions: {
        projects: ["read"],
        developers: ["read"],
      }
    },
    { 
      name: UserRole.CLIENT,
      permissions: {
        projects: ["read"],
        developers: ["read"],
      }
    }
  ];

  // Create roles and store their IDs
  const rolesMap: Record<string, string> = {};
  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: {
        name: roleData.name,
        permissions: roleData.permissions,
      },
    });
    rolesMap[role.name] = role.id;
  }

  // Create demo agency
  const agency = await prisma.agency.upsert({
    where: { id: "demo-agency" },
    update: {},
    create: {
      id: "demo-agency",
      name: "Demo Agency",
      description: "A demo real estate agency",
      address: "456 Agency St",
      contactEmail: "agency@homio.pro",
      contactPhone: "+1234567894"
    }
  });

  // Hash password for all users
  const hashedPassword = await bcrypt.hash("H0m!o@dm1n2024", 10);

  // Create system users
  const users = [
    {
      email: "admin@homio.pro",
      username: "admin_system",
      password: hashedPassword,
      name: "Admin User",
      roleId: rolesMap[UserRole.ADMIN]
    },
    {
      email: "developer@homio.pro",
      username: "developer_system",
      password: hashedPassword,
      name: "Developer User",
      roleId: rolesMap[UserRole.DEVELOPER]
    },
    {
      email: "agent@homio.pro",
      username: "agent_system",
      password: hashedPassword,
      name: "Agent User",
      roleId: rolesMap[UserRole.AGENT]
    },
    {
      email: "client@homio.pro",
      username: "client_system",
      password: hashedPassword,
      name: "Client User",
      roleId: rolesMap[UserRole.CLIENT]
    }
  ];

  // Create users and their related records
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        username: userData.username,
        password: userData.password,
        name: userData.name,
        roleId: userData.roleId,
      },
      create: userData
    });

    // Create related records based on role
    switch (userData.roleId) {
      case rolesMap[UserRole.DEVELOPER]:
        await prisma.developer.create({
          data: {
            logo: "https://example.com/logo.png",
            website: "https://example.com",
            address: "123 Developer St",
            contactEmail: userData.email,
            contactPhone: "+1234567891",
            users: {
              connect: { id: user.id }
            },
            translations: {
              create: [
                {
                  language: "en",
                  name: "Demo Developer",
                  description: "A demo developer company"
                },
                {
                  language: "ru",
                  name: "Демо Застройщик",
                  description: "Демонстрационная компания застройщика"
                }
              ]
            }
          }
        });
        break;

      case rolesMap[UserRole.AGENT]:
        await prisma.agent.create({
          data: {
            firstName: "Agent",
            lastName: "Demo",
            email: userData.email,
            phone: "+1234567892",
            agencyId: agency.id,
            userId: user.id
          }
        });
        break;

      case rolesMap[UserRole.CLIENT]:
        await prisma.client.create({
          data: {
            firstName: "Client",
            lastName: "Demo",
            email: userData.email,
            phone: "+1234567893",
            userId: user.id
          }
        });
        break;
    }
  }

  console.log("✅ System users created successfully");
}

async function seedRealData() {
  console.log("Starting real data seed...");

  // Create currencies
  const currencies = [
    {
      code: "usd",
      symbol: "$",
      name: "US Dollar",
      rate: 1,
      isBaseCurrency: false
    },
    {
      code: "thb",
      symbol: "฿",
      name: "Thai Baht",
      rate: 35.5,
      isBaseCurrency: true
    }
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: currency,
      create: currency
    });
  }

  // Real developers data
  const realDevelopers = [
    {
      name: "Banyan Tree Group",
      nameRu: "Баньян Три Груп",
      description: "Leading international hospitality brand known for its luxury resorts, residences and sustainable development approach. With over 25 years of experience in creating award-winning properties, Banyan Tree Group continues to pioneer innovative designs and exceptional experiences.",
      descriptionRu: "Ведущий международный гостиничный бренд, известный своими роскошными курортами, резиденциями и устойчивым подходом к развитию. С более чем 25-летним опытом создания отмеченных наградами объектов, Banyan Tree Group продолжает внедрять инновационные проекты и исключительный опыт.",
      logo: "https://www.banyantree.com/assets/images/logo.svg",
      website: "https://www.banyantree.com",
      contactEmail: "residences.phuket@banyantree.com",
      contactPhone: "+66 76 372 400"
    },
    {
      name: "Laguna Property",
      nameRu: "Лагуна Проперти",
      description: "Part of Banyan Tree Group, Laguna Property is Phuket's largest developer of high-quality resort residences. With over 30 years of experience in Phuket's property market, we have delivered more than 1,500 properties across various successful developments.",
      descriptionRu: "Являясь частью Banyan Tree Group, Laguna Property является крупнейшим застройщиком курортной недвижимости на Пхукете. С более чем 30-летним опытом работы на рынке недвижимости Пхукета, мы реализовали более 1500 объектов в различных успешных проектах.",
      logo: "https://www.lagunaproperty.com/assets/images/logo.png",
      website: "https://www.lagunaproperty.com",
      contactEmail: "property@lagunaphuket.com",
      contactPhone: "+66 76 362 333"
    }
  ];

  // Create developers
  for (const developerData of realDevelopers) {
    await prisma.developer.create({
      data: {
        logo: developerData.logo,
        website: developerData.website,
        contactEmail: developerData.contactEmail,
        contactPhone: developerData.contactPhone,
        translations: {
          create: [
            {
              language: "en",
              name: developerData.name,
              description: developerData.description
            },
            {
              language: "ru",
              name: developerData.nameRu,
              description: developerData.descriptionRu
            }
          ]
        }
      }
    });
  }

  // Create basic amenities
  const basicAmenities = [
    { name: "Beachfront Pool", description: "Infinity pool overlooking the beach" },
    { name: "Fitness Center", description: "State-of-the-art fitness equipment" },
    { name: "Beach Club", description: "Private beach club with food and beverage service" },
    { name: "Kids Club", description: "Supervised activities for children" },
    { name: "Security", description: "24/7 security service and CCTV" }
  ];

  for (const amenity of basicAmenities) {
    await prisma.amenity.upsert({
      where: { name: amenity.name },
      update: amenity,
      create: amenity
    });
  }

  // Real projects data
  const realProjects = [
    {
      name: "Laguna Beachside",
      nameRu: "Лагуна Бичсайд",
      slug: "laguna-beachside",
      description: "Luxury beachfront residences within Laguna Phuket, offering direct beach access and resort amenities. Features modern tropical architecture, sustainable design elements, and panoramic sea views from most units.",
      descriptionRu: "Роскошные резиденции на берегу моря в комплексе Лагуна Пхукет, с прямым выходом к пляжу и доступом к курортной инфраструктуре. Отличается современной тропической архитектурой, экологичным дизайном и панорамными видами на море из большинства квартир.",
      developer: "Laguna Property",
      type: ProjectType.RESIDENTIAL,
      status: ProjectStatus.CONSTRUCTION,
      location: {
        address: "99/99 Moo 3, Cherngtalay, Thalang",
        city: "Phuket",
        country: "Thailand",
        district: "Bangtao",
        latitude: 7.9889,
        longitude: 98.2976,
        beachDistance: 0.1,
        centerDistance: 7.7
      },
      completionDate: "2024-12-31T00:00:00.000Z",
      pricing: {
        basePrice: 750000,
        currencyId: "usd",
        pricePerSqm: 8500,
        maintenanceFee: 80,
        maintenanceFeePeriod: "MONTHLY"
      },
      yield: {
        guaranteed: 6,
        potential: 8,
        occupancy: 85,
        years: "5"
      },
      totalUnits: 149,
      constructionStatus: 65,
      amenities: [
        "Beachfront Pool",
        "Fitness Center",
        "Beach Club",
        "Kids Club",
        "Security"
      ]
    }
  ];

  // Create projects
  for (const projectData of realProjects) {
    try {
      const developer = await prisma.developer.findFirst({
        where: {
          translations: {
            some: {
              name: projectData.developer
            }
          }
        }
      });

      if (!developer) {
        console.error(`Developer not found: ${projectData.developer}`);
        continue;
      }

      const currency = await prisma.currency.findUnique({
        where: { code: projectData.pricing.currencyId }
      });

      if (!currency) {
        console.error(`Currency not found: ${projectData.pricing.currencyId}`);
        continue;
      }

      const project = await prisma.project.create({
        data: {
          name: projectData.name,
          slug: projectData.slug,
          type: projectData.type,
          status: projectData.status,
          completionDate: new Date(projectData.completionDate),
          constructionStatus: projectData.constructionStatus,
          totalUnits: projectData.totalUnits,
          developer: {
            connect: { id: developer.id }
          },
          location: {
            create: projectData.location
          },
          translations: {
            create: [
              {
                language: "en",
                name: projectData.name,
                description: projectData.description
              },
              {
                language: "ru",
                name: projectData.nameRu,
                description: projectData.descriptionRu
              }
            ]
          }
        }
      });

      // Create project pricing
      await prisma.projectPricing.create({
        data: {
          projectId: project.id,
          basePrice: projectData.pricing.basePrice,
          currencyId: currency.id,
          pricePerSqm: projectData.pricing.pricePerSqm,
          maintenanceFee: projectData.pricing.maintenanceFee,
          maintenanceFeePeriod: projectData.pricing.maintenanceFeePeriod
        }
      });

      // Create project yield
      await prisma.projectYield.create({
        data: {
          projectId: project.id,
          guaranteed: projectData.yield.guaranteed,
          potential: projectData.yield.potential,
          occupancy: projectData.yield.occupancy,
          years: projectData.yield.years
        }
      });

      // Create project amenities
      for (const amenityName of projectData.amenities) {
        const amenity = await prisma.amenity.findUnique({
          where: { name: amenityName }
        });

        if (amenity) {
          await prisma.projectAmenity.create({
            data: {
              projectId: project.id,
              amenityId: amenity.id
            }
          });
        }
      }

      console.log(`✅ Created project: ${project.name}`);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  }
}

async function main() {
  try {
    console.log("Starting database seeding...");
    
    // First seed minimal data (roles, basic users)
    await seedMinimal();
    
    // Then seed real data (developers, projects, etc)
    await seedRealData();
    
    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
