import {
  PrismaClient,
  ProjectStatus,
  ProjectType,
  UnitStatus
} from "@prisma/client";

const prisma = new PrismaClient();

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
    for (
      let unit = 1;
      unit <= unitsPerFloor && units.length < totalUnits;
      unit++
    ) {
      const unitType = unitTypes[Math.floor(Math.random() * unitTypes.length)];
      const unitNumber = `${floor.toString().padStart(2, "0")}${unit
        .toString()
        .padStart(2, "0")}`;

      // Увеличиваем цену на верхних этажах
      const floorMultiplier = 1 + (floor / floors) * 0.3;

      units.push({
        projectId,
        title: `${unitType.type} ${unitNumber}`,
        description: `${unitType.bedrooms} bedroom unit with ${unitType.bathrooms} bathroom(s)`,
        price: Math.round(
          basePrice * unitType.priceMultiplier * floorMultiplier
        ),
        floor,
        status:
          Math.random() > 0.3 ? UnitStatus.AVAILABLE : UnitStatus.RESERVED,
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

export default async function seedRealData() {
  // Real developers data
  const developers = [
    {
      name: "Banyan Tree Group",
      nameRu: "Баньян Три Груп",
      description:
        "Leading international hospitality brand known for its luxury resorts, residences and sustainable development approach. With over 25 years of experience in creating award-winning properties, Banyan Tree Group continues to pioneer innovative designs and exceptional experiences.",
      descriptionRu:
        "Ведущий международный гостиничный бренд, известный своими роскошными курортами, резиденциями и устойчивым подходом к развитию. С более чем 25-летним опытом создания отмеченных наградами объектов, Banyan Tree Group продолжает внедрять инновационные проекты и исключительный опыт.",
      logo: "https://www.banyantree.com/assets/images/logo.svg",
      website: "https://www.banyantree.com",
      contactEmail: "residences.phuket@banyantree.com",
      contactPhone: "+66 76 372 400"
    },
    {
      name: "Laguna Property",
      nameRu: "Лагуна Проперти",
      description:
        "Part of Banyan Tree Group, Laguna Property is Phuket's largest developer of high-quality resort residences. With over 30 years of experience in Phuket's property market, we have delivered more than 1,500 properties across various successful developments.",
      descriptionRu:
        "Являясь частью Banyan Tree Group, Laguna Property является крупнейшим застройщиком курортной недвижимости на Пхукете. С более чем 30-летним опытом работы на рынке недвижимости Пхукета, мы реализовали более 1500 объектов в различных успешных проектах.",
      logo: "https://www.lagunaproperty.com/assets/images/logo.png",
      website: "https://www.lagunaproperty.com",
      contactEmail: "property@lagunaphuket.com",
      contactPhone: "+66 76 362 333"
    }
  ];

  // Create developers
  for (const developerData of developers) {
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

  // Real projects data
  const projects = [
    {
      name: "Laguna Beachside",
      nameRu: "Лагуна Бичсайд",
      slug: "laguna-beachside",
      description:
        "Luxury beachfront residences within Laguna Phuket, offering direct beach access and resort amenities. Features modern tropical architecture, sustainable design elements, and panoramic sea views from most units.",
      descriptionRu:
        "Роскошные резиденции на берегу моря в комплексе Лагуна Пхукет, с прямым выходом к пляжу и доступом к курортной инфраструктуре. Отличается современной тропической архитектурой, экологичным дизайном и панорамными видами на море из большинства квартир.",
      developer: "Laguna Property",
      type: ProjectType.RESIDENTIAL,
      status: ProjectStatus.CONSTRUCTION,
      location: {
        create: {
          address: "99/99 Moo 3, Cherngtalay, Thalang",
          city: "Phuket",
          country: "Thailand",
          district: "Bangtao",
          latitude: 7.9889,
          longitude: 98.2976,
          beachDistance: 0.1,
          centerDistance: 7.7
        }
      },
      completionDate: "2024-12-31T00:00:00.000Z",
      pricing: {
        create: {
          basePrice: 750000,
          currency: "USD",
          pricePerSqm: 8500,
          maintenanceFee: 80,
          maintenanceFeePeriod: "MONTHLY"
        }
      },
      yield: {
        create: {
          guaranteed: 6,
          potential: 8,
          occupancy: 85,
          years: "5"
        }
      },
      totalUnits: 149,
      constructionStatus: 65,
      amenities: {
        create: [
          {
            amenity: {
              connectOrCreate: {
                where: { name: "Beachfront Pool" },
                create: {
                  name: "Beachfront Pool",
                  description: "Infinity pool overlooking Bangtao Beach"
                }
              }
            }
          },
          {
            amenity: {
              connectOrCreate: {
                where: { name: "Fitness Center" },
                create: {
                  name: "Fitness Center",
                  description:
                    "State-of-the-art fitness equipment with sea views"
                }
              }
            }
          },
          {
            amenity: {
              connectOrCreate: {
                where: { name: "Beach Club" },
                create: {
                  name: "Beach Club",
                  description:
                    "Private beach club with food and beverage service"
                }
              }
            }
          },
          {
            amenity: {
              connectOrCreate: {
                where: { name: "Kids Club" },
                create: {
                  name: "Kids Club",
                  description: "Supervised activities for children"
                }
              }
            }
          },
          {
            amenity: {
              connectOrCreate: {
                where: { name: "Security" },
                create: {
                  name: "Security",
                  description: "24/7 security service and CCTV"
                }
              }
            }
          }
        ]
      }
    }
  ];

  // Create projects
  for (const projectData of projects) {
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

    // Проверяем обязательные поля
    if (!projectData.name || !projectData.type || !projectData.status) {
      console.error(
        `Missing required fields for project: ${JSON.stringify(projectData)}`
      );
      continue;
    }

    await prisma.project.create({
      data: {
        name: projectData.name,
        slug: projectData.slug,
        type: projectData.type,
        status: projectData.status,
        developer: {
          connect: {
            id: developer.id
          }
        },
        location: {
          create: {
            country: "Thailand",
            city: "Phuket",
            district: projectData.location.create.district,
            latitude: projectData.location.create.latitude,
            longitude: projectData.location.create.longitude,
            beachDistance: projectData.location.create.beachDistance,
            centerDistance: projectData.location.create.centerDistance
          }
        },
        translations: {
          create: [
            {
              language: "en",
              name: projectData.name,
              description: projectData.description || ""
            },
            {
              language: "ru",
              name: projectData.nameRu,
              description: projectData.descriptionRu || ""
            }
          ]
        }
      }
    }).then(async project => {
      // Создаем pricing отдельно
      if (projectData.pricing) {
        await prisma.projectPricing.create({
          data: {
            projectId: project.id,
            ...projectData.pricing.create
          }
        });
      }

      // Создаем yield отдельно
      if (projectData.yield) {
        await prisma.projectYield.create({
          data: {
            projectId: project.id,
            ...projectData.yield.create
          }
        });
      }

      return project;
    });
  }
}
