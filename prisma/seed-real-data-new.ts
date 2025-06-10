import { PrismaClient, UserRole, CourseStatus, MediaCategory, ProjectStatus, ProjectType, UnitStatus, ProjectClass } from "@prisma/client";
import * as data from "./exported-data.json";
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

function generateUnits(projectId: string, totalUnits: number, basePrice: number, buildingsCount: number) {
    const units = [];
    const unitsPerBuilding = Math.ceil(totalUnits / buildingsCount);
    const floorsPerBuilding = Math.floor(Math.random() * 20) + 10; // Random number of floors between 10 and 30
    const unitsPerFloor = Math.ceil(unitsPerBuilding / floorsPerBuilding);

    for (let i = 0; i < totalUnits; i++) {
        const floor = Math.floor(i / unitsPerFloor) + 1;
        const unitNumber = (i % unitsPerFloor) + 1;
        const formattedFloor = String(floor).padStart(2, '0');
        const formattedUnit = String(unitNumber).padStart(2, '0');
        const number = `${formattedFloor}${formattedUnit}`;

        const bedrooms = Math.floor(Math.random() * 4); // 0-3 bedrooms
        const bathrooms = bedrooms + 1; // At least one bathroom
        const area = 35 + (bedrooms * 20); // Base area 35m2 + 20m2 per bedroom
        const price = basePrice + (area * 1000); // Base price + 1000 per m2

        units.push({
            name: `${bedrooms === 0 ? 'Studio' : `${bedrooms}BR`} ${number}`,
            price,
            floor,
            status: UnitStatus.AVAILABLE,
            number,
            area,
            bathrooms,
            bedrooms,
            projectId
        });
    }

    return units;
}

async function seedRealData() {
    try {
        console.log("Starting to seed real data...");

        // Seed roles first
        console.log("Seeding roles...");
        for (const role of data.roles) {
            const { createdAt, updatedAt, ...roleData } = role;
            await prisma.role.upsert({
                where: { name: roleData.name as UserRole },
                update: {
                    ...roleData,
                    name: roleData.name as UserRole,
                },
                create: {
                    ...roleData,
                    name: roleData.name as UserRole,
                },
            });
        }

        // Create basic users
        console.log("Creating basic users...");
        const basicUsers = [
            {
                id: "cm5snh8ev000eyz6oe9i78gxf",
                email: "agent@homio.com",
                username: "agent",
                password: "$2a$10$YourHashedPasswordHere",
                roleId: (await prisma.role.findUnique({ where: { name: "AGENT" } }))?.id || "",
            },
            {
                id: "cm5snh8ev000fyz6oe9i78gxg",
                email: "developer@homio.com",
                username: "developer",
                password: "$2a$10$YourHashedPasswordHere",
                roleId: (await prisma.role.findUnique({ where: { name: "DEVELOPER" } }))?.id || "",
            },
        ];

        for (const user of basicUsers) {
            await prisma.user.upsert({
                where: { id: user.id },
                update: user,
                create: user,
            });
        }

        // Create currencies
        console.log("Seeding currencies...");
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

        // Create amenities first as they are referenced by projects
        console.log("Seeding amenities...");
        for (const amenity of data.amenities) {
            await prisma.amenity.upsert({
                where: { name: amenity.name },
                update: {
                    name: amenity.name,
                    description: amenity.description,
                    icon: amenity.icon
                },
                create: {
                    name: amenity.name,
                    description: amenity.description,
                    icon: amenity.icon
                }
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
        console.log("Seeding real developers...");
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

        // Real projects data
        const realProjects = [
            {
                name: "The ArtRio",
                nameRu: "Арт Рио",
                slug: "the-artrio",
                description: "A modern architectural masterpiece combining art and luxury living. Located in a prime area with stunning city views and world-class amenities.",
                descriptionRu: "Современный архитектурный шедевр, сочетающий искусство и роскошную жизнь. Расположен в престижном районе с потрясающими видами на город и первоклассными удобствами.",
                developer: "Banyan Tree Group",
                type: ProjectType.RESIDENTIAL,
                status: ProjectStatus.CONSTRUCTION,
                class: ProjectClass.PREMIUM,
                location: {
                    address: "88 Moo 2, Kathu",
                    city: "Phuket",
                    country: "Thailand",
                    district: "Kathu",
                    latitude: 7.9156,
                    longitude: 98.3275,
                    beachDistance: 2.5,
                    centerDistance: 3.2
                },
                completionDate: "2025-06-30T00:00:00.000Z",
                pricing: {
                    basePrice: 580000,
                    currencyId: "usd",
                    pricePerSqm: 6800,
                    maintenanceFee: 65,
                    maintenanceFeePeriod: "MONTHLY"
                },
                yield: {
                    guaranteed: 7,
                    potential: 9,
                    occupancy: 80,
                    years: "5"
                },
                totalUnits: 120,
                constructionStatus: 45,
                totalLandArea: 12000,
                infrastructureArea: 4000,
                totalBuildings: 2,
                siteUrl: "https://banyantree.com/artrio",
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
                amenities: [
                    "Infinity Pool",
                    "Art Gallery",
                    "Fitness Center",
                    "Sky Lounge",
                    "Spa",
                    "Restaurant",
                    "Parking",
                    "Garden",
                    "Coworking Space",
                    "Cinema Room"
                ],
                media: [
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/d6e10cad-cc59-49f3-97cb-fd12b86336dc.png",
                        title: "Banner - The ArtRio",
                        category: MediaCategory.BANNER
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/bc8c0c3c-aef4-4997-8b60-2904e6a575ef.png",
                        title: "Gallery View 1",
                        category: MediaCategory.AMENITIES
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/e4ed1f32-5bb1-42b1-a64b-6ea65ca15794.png",
                        title: "Gallery View 2",
                        category: MediaCategory.AMENITIES
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/10c31455-99a7-4c03-aad5-c723c5ad6ea3-Banner - The ArtRio 16_9.png",
                        title: "Master Plan",
                        category: MediaCategory.MASTER_PLAN
                    }
                ]
            },
            {
                name: "Luxury Villas Type C",
                nameRu: "Люкс Виллы Тип C",
                slug: "luxury-villas-type-c",
                description: "Exclusive luxury villas offering privacy and comfort with modern design and premium finishes. Each villa features a private pool and tropical garden.",
                descriptionRu: "Эксклюзивные роскошные виллы, обеспечивающие приватность и комфорт, с современным дизайном и премиальной отделкой. Каждая вилла имеет собственный бассейн и тропический сад.",
                developer: "Laguna Property",
                type: ProjectType.RESIDENTIAL,
                status: ProjectStatus.CONSTRUCTION,
                class: ProjectClass.LUXURY,
                location: {
                    address: "105 Moo 4, Cherngtalay",
                    city: "Phuket",
                    country: "Thailand",
                    district: "Cherngtalay",
                    latitude: 7.9956,
                    longitude: 98.2945,
                    beachDistance: 0.8,
                    centerDistance: 8.5
                },
                completionDate: "2024-12-31T00:00:00.000Z",
                pricing: {
                    basePrice: 950000,
                    currencyId: "usd",
                    pricePerSqm: 9500,
                    maintenanceFee: 100,
                    maintenanceFeePeriod: "MONTHLY"
                },
                yield: {
                    guaranteed: 6,
                    potential: 8,
                    occupancy: 75,
                    years: "5"
                },
                totalUnits: 24,
                constructionStatus: 70,
                totalLandArea: 25000,
                infrastructureArea: 8000,
                totalBuildings: 24,
                siteUrl: "https://lagunaproperty.com/luxury-villas",
                tour3d: "https://my.matterport.com/show/?m=example3",
                purchaseConditions: "30% down payment, flexible payment plans available",
                phase: 1,
                publicTransport: 75,
                amenitiesLevel: 95,
                climateConditions: 90,
                beachAccess: 85,
                rentalDemand: 80,
                safetyLevel: 95,
                noiseLevel: 15,
                schoolsAvailable: 80,
                amenities: [
                    "Private Pool",
                    "Tropical Garden",
                    "24/7 Security",
                    "Clubhouse",
                    "Fitness Center",
                    "Spa",
                    "Restaurant",
                    "Beach Shuttle",
                    "Concierge",
                    "Kids Play Area"
                ],
                media: [
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/b9cd4cc1-d8b6-4c04-ad3c-d28ace29551d.png",
                        title: "Banner Luxury Villas",
                        category: MediaCategory.BANNER
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/0c19d5b3-cdc1-4c80-8cc6-6831fddf99ae.png",
                        title: "Gallery View 1",
                        category: MediaCategory.AMENITIES
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/c6e1e3cf-fc5f-42ec-a750-de37d52e5ecb.png",
                        title: "Gallery View 2",
                        category: MediaCategory.AMENITIES
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/cd390233-5615-442b-8db4-d1c945662a0e.png",
                        title: "Gallery View 3",
                        category: MediaCategory.AMENITIES
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/6470d650-ad78-4aed-a9c6-eb449352a83b.png",
                        title: "Gallery View 4",
                        category: MediaCategory.AMENITIES
                    }
                ]
            },
            {
                name: "Serenity",
                nameRu: "Серенити",
                slug: "serenity",
                description: "A peaceful oasis offering luxurious living spaces with stunning mountain views. Features contemporary design and extensive wellness facilities.",
                descriptionRu: "Спокойный оазис, предлагающий роскошные жилые пространства с потрясающими видами на горы. Отличается современным дизайном и обширными wellness-удобствами.",
                developer: "Banyan Tree Group",
                type: ProjectType.RESIDENTIAL,
                status: ProjectStatus.CONSTRUCTION,
                class: ProjectClass.LUXURY,
                location: {
                    address: "95 Moo 3, Kathu",
                    city: "Phuket",
                    country: "Thailand",
                    district: "Kathu",
                    latitude: 7.9123,
                    longitude: 98.3367,
                    beachDistance: 3.5,
                    centerDistance: 2.8
                },
                completionDate: "2025-03-31T00:00:00.000Z",
                pricing: {
                    basePrice: 650000,
                    currencyId: "usd",
                    pricePerSqm: 7200,
                    maintenanceFee: 70,
                    maintenanceFeePeriod: "MONTHLY"
                },
                yield: {
                    guaranteed: 7,
                    potential: 9,
                    occupancy: 85,
                    years: "5"
                },
                totalUnits: 180,
                constructionStatus: 55,
                totalLandArea: 18000,
                infrastructureArea: 6000,
                totalBuildings: 3,
                siteUrl: "https://banyantree.com/serenity",
                tour3d: "https://my.matterport.com/show/?m=example4",
                purchaseConditions: "Flexible payment plans with 20% down payment",
                phase: 1,
                publicTransport: 90,
                amenitiesLevel: 95,
                climateConditions: 85,
                beachAccess: 75,
                rentalDemand: 90,
                safetyLevel: 95,
                noiseLevel: 25,
                schoolsAvailable: 85,
                amenities: [
                    "Infinity Pool",
                    "Wellness Center",
                    "Yoga Studio",
                    "Meditation Garden",
                    "Fitness Center",
                    "Spa",
                    "Restaurant",
                    "Lounge",
                    "Library",
                    "Co-working Space"
                ],
                media: [
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/59515b48-ea98-4a1b-97dc-3ce5292ebf10.png",
                        title: "Banner Serenity",
                        category: MediaCategory.BANNER
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/82b1fb90-7980-40ec-b3a9-178878db1a8d.png",
                        title: "Gallery View 1",
                        category: MediaCategory.AMENITIES
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/a0a53612-dca6-498b-b925-de892e46ae92.png",
                        title: "Gallery View 2",
                        category: MediaCategory.AMENITIES
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/5253ebf8-5719-4f13-b36d-c43d14dd27ae.png",
                        title: "Gallery View 3",
                        category: MediaCategory.AMENITIES
                    }
                ]
            },
            {
                name: "Skypark Elara",
                nameRu: "Скайпарк Элара",
                slug: "skypark-elara",
                description: "Modern high-rise development with panoramic sea and city views. Features smart home technology and extensive sky facilities.",
                descriptionRu: "Современный высотный комплекс с панорамными видами на море и город. Оснащен технологией умного дома и обширными удобствами на верхних этажах.",
                developer: "Banyan Tree Group",
                type: ProjectType.RESIDENTIAL,
                status: ProjectStatus.CONSTRUCTION,
                class: ProjectClass.PREMIUM,
                location: {
                    address: "120 Moo 5, Patong",
                    city: "Phuket",
                    country: "Thailand",
                    district: "Patong",
                    latitude: 7.8967,
                    longitude: 98.2967,
                    beachDistance: 1.2,
                    centerDistance: 1.5
                },
                completionDate: "2025-09-30T00:00:00.000Z",
                pricing: {
                    basePrice: 520000,
                    currencyId: "usd",
                    pricePerSqm: 6500,
                    maintenanceFee: 60,
                    maintenanceFeePeriod: "MONTHLY"
                },
                yield: {
                    guaranteed: 8,
                    potential: 10,
                    occupancy: 90,
                    years: "5"
                },
                totalUnits: 250,
                constructionStatus: 40,
                totalLandArea: 10000,
                infrastructureArea: 3000,
                totalBuildings: 2,
                siteUrl: "https://banyantree.com/skypark-elara",
                tour3d: "https://my.matterport.com/show/?m=example5",
                purchaseConditions: "Flexible payment plans with 15% down payment",
                phase: 1,
                publicTransport: 95,
                amenitiesLevel: 90,
                climateConditions: 85,
                beachAccess: 80,
                rentalDemand: 95,
                safetyLevel: 90,
                noiseLevel: 35,
                schoolsAvailable: 90,
                amenities: [
                    "Sky Pool",
                    "Sky Garden",
                    "Smart Home System",
                    "Fitness Center",
                    "Sky Lounge",
                    "Co-working Space",
                    "Kids Club",
                    "Game Room",
                    "Cinema",
                    "BBQ Area"
                ],
                media: [
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/cf0d8823-4ee3-4a7d-88e0-642624373fc1.png",
                        title: "Banner Skypark Elara",
                        category: MediaCategory.BANNER
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/8c05db74-71e3-407b-bd9b-1edf3e87f4ce.png",
                        title: "Gallery View 1",
                        category: MediaCategory.AMENITIES
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/813faadc-9971-43eb-a102-52ba49ad7514.png",
                        title: "Gallery View 2",
                        category: MediaCategory.AMENITIES
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/9c6e6510-4635-4e2a-a862-ac56c3e6c641.png",
                        title: "Gallery View 3",
                        category: MediaCategory.AMENITIES
                    }
                ]
            },
            {
                name: "The Modeva",
                nameRu: "Модева",
                slug: "the-modeva",
                description: "Boutique residential development combining modern design with tropical living. Features private gardens and resort-style facilities.",
                descriptionRu: "Бутик-резиденции, сочетающие современный дизайн с тропическим образом жизни. Включают частные сады и удобства курортного уровня.",
                developer: "Laguna Property",
                type: ProjectType.RESIDENTIAL,
                status: ProjectStatus.CONSTRUCTION,
                class: ProjectClass.PREMIUM,
                location: {
                    address: "88/8 Moo 7, Rawai",
                    city: "Phuket",
                    country: "Thailand",
                    district: "Rawai",
                    latitude: 7.7789,
                    longitude: 98.3234,
                    beachDistance: 0.5,
                    centerDistance: 12.5
                },
                completionDate: "2024-09-30T00:00:00.000Z",
                pricing: {
                    basePrice: 480000,
                    currencyId: "usd",
                    pricePerSqm: 5800,
                    maintenanceFee: 55,
                    maintenanceFeePeriod: "MONTHLY"
                },
                yield: {
                    guaranteed: 7,
                    potential: 9,
                    occupancy: 85,
                    years: "5"
                },
                totalUnits: 90,
                constructionStatus: 75,
                totalLandArea: 8000,
                infrastructureArea: 2500,
                totalBuildings: 3,
                siteUrl: "https://lagunaproperty.com/modeva",
                tour3d: "https://my.matterport.com/show/?m=example6",
                purchaseConditions: "Flexible payment plans available",
                phase: 1,
                publicTransport: 80,
                amenitiesLevel: 85,
                climateConditions: 90,
                beachAccess: 90,
                rentalDemand: 85,
                safetyLevel: 90,
                noiseLevel: 20,
                schoolsAvailable: 75,
                amenities: [
                    "Swimming Pool",
                    "Tropical Garden",
                    "Fitness Center",
                    "Kids Pool",
                    "BBQ Area",
                    "Security",
                    "Parking",
                    "Lobby",
                    "Garden",
                    "Reception"
                ],
                media: [
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/02a1c701-180c-41c7-a93a-4e0cc07bf6f1.png",
                        title: "Banner The Modeva",
                        category: MediaCategory.BANNER
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/dc34a582-1494-4b09-bfa6-d4b15acf2fac.png",
                        title: "Gallery View 1",
                        category: MediaCategory.AMENITIES
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/6d2b5a1e-34c4-4d41-8bef-fd7140aea969.png",
                        title: "Gallery View 2",
                        category: MediaCategory.AMENITIES
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/8f8a1718-9dee-4f2a-b4b4-02ae5e848e0e.png",
                        title: "Gallery View 3",
                        category: MediaCategory.AMENITIES
                    }
                ]
            },
            {
                name: "VENUS Karon",
                nameRu: "ВЕНУС Карон",
                slug: "venus-karon",
                description: "Luxury beachfront condominiums with direct beach access and stunning sea views. Features contemporary design and premium finishes.",
                descriptionRu: "Роскошные пляжные кондоминиумы с прямым выходом к пляжу и потрясающими видами на море. Отличаются современным дизайном и премиальной отделкой.",
                developer: "Laguna Property",
                type: ProjectType.RESIDENTIAL,
                status: ProjectStatus.CONSTRUCTION,
                class: ProjectClass.LUXURY,
                location: {
                    address: "509 Patak Road, Karon",
                    city: "Phuket",
                    country: "Thailand",
                    district: "Karon",
                    latitude: 7.8456,
                    longitude: 98.2945,
                    beachDistance: 0.1,
                    centerDistance: 15.5
                },
                completionDate: "2025-12-31T00:00:00.000Z",
                pricing: {
                    basePrice: 850000,
                    currencyId: "usd",
                    pricePerSqm: 9000,
                    maintenanceFee: 85,
                    maintenanceFeePeriod: "MONTHLY"
                },
                yield: {
                    guaranteed: 6,
                    potential: 8,
                    occupancy: 80,
                    years: "5"
                },
                totalUnits: 130,
                constructionStatus: 35,
                totalLandArea: 12000,
                infrastructureArea: 4000,
                totalBuildings: 2,
                siteUrl: "https://lagunaproperty.com/venus-karon",
                tour3d: "https://my.matterport.com/show/?m=example7",
                purchaseConditions: "30% down payment required",
                phase: 1,
                publicTransport: 75,
                amenitiesLevel: 95,
                climateConditions: 90,
                beachAccess: 100,
                rentalDemand: 90,
                safetyLevel: 95,
                noiseLevel: 25,
                schoolsAvailable: 70,
                amenities: [
                    "Beachfront Pool",
                    "Infinity Edge Pool",
                    "Fitness Center",
                    "Spa",
                    "Beach Club",
                    "Restaurant",
                    "Bar",
                    "Kids Club",
                    "Garden",
                    "Security"
                ],
                media: [
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/b7200421-55dc-4681-aeb6-9668dd87b9c6.png",
                        title: "Banner VENUS Karon",
                        category: MediaCategory.BANNER
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/0f852938-6b73-422c-ba5a-821ff58c7d64.png",
                        title: "Gallery View 1",
                        category: MediaCategory.AMENITIES
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/84d558ca-b3ae-4a4a-82d0-2df6ef4bea30.png",
                        title: "Gallery View 2",
                        category: MediaCategory.AMENITIES
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/096e16d8-2415-47f6-8916-a1ff4e5f89c3.png",
                        title: "Gallery View 3",
                        category: MediaCategory.AMENITIES
                    }
                ]
            },
            {
                name: "AURA",
                nameRu: "АУРА",
                slug: "aura",
                description: "Premium residential complex with panoramic sea views and extensive wellness facilities. Features modern architecture and sustainable design.",
                descriptionRu: "Премиальный жилой комплекс с панорамными видами на море и обширными wellness-удобствами. Отличается современной архитектурой и экологичным дизайном.",
                developer: "Banyan Tree Group",
                type: ProjectType.RESIDENTIAL,
                status: ProjectStatus.CONSTRUCTION,
                class: ProjectClass.PREMIUM,
                location: {
                    address: "88/99 Moo 3, Kamala",
                    city: "Phuket",
                    country: "Thailand",
                    district: "Kamala",
                    latitude: 7.9567,
                    longitude: 98.2834,
                    beachDistance: 0.8,
                    centerDistance: 9.5
                },
                completionDate: "2025-06-30T00:00:00.000Z",
                pricing: {
                    basePrice: 620000,
                    currencyId: "usd",
                    pricePerSqm: 7000,
                    maintenanceFee: 75,
                    maintenanceFeePeriod: "MONTHLY"
                },
                yield: {
                    guaranteed: 7,
                    potential: 9,
                    occupancy: 85,
                    years: "5"
                },
                totalUnits: 160,
                constructionStatus: 50,
                totalLandArea: 15000,
                infrastructureArea: 5000,
                totalBuildings: 3,
                siteUrl: "https://banyantree.com/aura",
                tour3d: "https://my.matterport.com/show/?m=example8",
                purchaseConditions: "Flexible payment plans available",
                phase: 1,
                publicTransport: 85,
                amenitiesLevel: 90,
                climateConditions: 90,
                beachAccess: 85,
                rentalDemand: 90,
                safetyLevel: 95,
                noiseLevel: 25,
                schoolsAvailable: 80,
                amenities: [
                    "Infinity Pool",
                    "Wellness Center",
                    "Yoga Studio",
                    "Fitness Center",
                    "Spa",
                    "Restaurant",
                    "Lounge",
                    "Garden",
                    "Kids Club",
                    "Security"
                ],
                media: [
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/uploads/1a48806d-8807-473a-bd1b-f968fd443d89.png",
                        title: "Banner AURA",
                        category: MediaCategory.BANNER
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/d13c8ab8-fac3-4deb-8694-9969699aa00d-Image (1).jpg",
                        title: "Gallery View 1",
                        category: MediaCategory.AMENITIES
                    },
                    {
                        type: "photo",
                        url: "https://storage.yandexcloud.net/homio/e45a0366-28b4-4fd2-bc05-b9e5fd8a428d-AURA 3.png",
                        title: "Master Plan",
                        category: MediaCategory.MASTER_PLAN
                    }
                ]
            }
        ];

        // Create projects
        console.log("Seeding real projects...");
        for (const projectItem of realProjects) {
            try {
                const { nameRu, descriptionRu, pricing, yield: projectYield, amenities, media, location, developer: developerName, name, description, type, status, class: projectClass, completionDate, constructionStatus, totalUnits, totalBuildings, ...otherProjectData } = projectItem;
                const projectSlug = projectItem.slug;
                if (!projectSlug) {
                    console.log("Skipping project without slug");
                    continue;
                }

                // Find developer
                const developer = await prisma.developer.findFirst({
                    where: {
                        translations: {
                            some: {
                                name: developerName
                            }
                        }
                    }
                });

                if (!developer) {
                    console.error(`Developer not found: ${developerName}`);
                    continue;
                }

                // Check if project exists
                const existingProject = await prisma.project.findUnique({
                    where: { slug: projectSlug },
                    include: { translations: true }
                });

                // Create location first
                const createdLocation = await prisma.location.create({
                    data: {
                        address: projectItem.location.address,
                        city: projectItem.location.city,
                        country: projectItem.location.country,
                        district: projectItem.location.district,
                        latitude: projectItem.location.latitude,
                        longitude: projectItem.location.longitude,
                        beachDistance: projectItem.location.beachDistance,
                        centerDistance: projectItem.location.centerDistance
                    }
                });

                // Prepare project data
                const projectData = {
                    name,
                    description,
                    type,
                    status,
                    class: projectClass,
                    completionDate: new Date(completionDate),
                    constructionStatus,
                    totalUnits,
                    totalBuildings,
                    slug: projectSlug,
                    totalLandArea: otherProjectData.totalLandArea,
                    infrastructureArea: otherProjectData.infrastructureArea,
                    tour3d: otherProjectData.tour3d,
                    purchaseConditions: otherProjectData.purchaseConditions,
                    phase: otherProjectData.phase,
                    publicTransport: otherProjectData.publicTransport,
                    amenitiesLevel: otherProjectData.amenitiesLevel,
                    climateConditions: otherProjectData.climateConditions,
                    beachAccess: otherProjectData.beachAccess,
                    rentalDemand: otherProjectData.rentalDemand,
                    safetyLevel: otherProjectData.safetyLevel,
                    noiseLevel: otherProjectData.noiseLevel,
                    schoolsAvailable: otherProjectData.schoolsAvailable,
                    ownership: [],
                    specialOffers: [],
                    promotions: [],
                    furniturePackages: [],
                    developerId: developer.id,
                    locationId: createdLocation.id,
                    translations: {
                        create: [
                            {
                                language: "en",
                                name,
                                description
                            },
                            {
                                language: "ru",
                                name: nameRu,
                                description: descriptionRu
                            }
                        ]
                    }
                };

                let createdProject;
                if (existingProject) {
                    // Update existing project
                    createdProject = await prisma.project.update({
                        where: { slug: projectSlug },
                        data: {
                            name,
                            description,
                            type,
                            status,
                            class: projectClass,
                            completionDate: new Date(completionDate),
                            constructionStatus,
                            totalUnits,
                            totalBuildings,
                            ...otherProjectData,
                            slug: projectSlug,
                            developer: {
                                connect: {
                                    id: developer.id
                                }
                            },
                            location: {
                                connect: {
                                    id: createdLocation.id
                                }
                            },
                            translations: {
                                updateMany: [
                                    {
                                        where: { language: "en" },
                                        data: {
                                            name: projectItem.name,
                                            description: projectItem.description
                                        }
                                    },
                                    {
                                        where: { language: "ru" },
                                        data: {
                                            name: nameRu,
                                            description: descriptionRu
                                        }
                                    }
                                ]
                            }
                        }
                    });
                } else {
                    // Create new project
                    createdProject = await prisma.project.create({
                        data: projectData
                    });
                }

                // Create project pricing
                if (createdProject.id && pricing) {
                    // Check if currency exists
                    const currency = await prisma.currency.findUnique({
                        where: { code: pricing.currencyId }
                    });

                    if (!currency) {
                        console.error(`Currency not found: ${pricing.currencyId}`);
                        continue;
                    }

                    await prisma.projectPricing.upsert({
                        where: {
                            projectId: createdProject.id
                        },
                        update: {
                            basePrice: pricing.basePrice,
                            currencyId: currency.id,
                            pricePerSqm: pricing.pricePerSqm,
                            maintenanceFee: pricing.maintenanceFee,
                            maintenanceFeePeriod: pricing.maintenanceFeePeriod
                        },
                        create: {
                            projectId: createdProject.id,
                            basePrice: pricing.basePrice,
                            currencyId: currency.id,
                            pricePerSqm: pricing.pricePerSqm,
                            maintenanceFee: pricing.maintenanceFee,
                            maintenanceFeePeriod: pricing.maintenanceFeePeriod
                        }
                    });
                }

                // Create project yield
                if (createdProject.id && projectYield) {
                    await prisma.projectYield.upsert({
                        where: {
                            projectId: createdProject.id
                        },
                        update: {
                            guaranteed: projectYield.guaranteed,
                            potential: projectYield.potential,
                            occupancy: projectYield.occupancy,
                            years: projectYield.years
                        },
                        create: {
                            projectId: createdProject.id,
                            guaranteed: projectYield.guaranteed,
                            potential: projectYield.potential,
                            occupancy: projectYield.occupancy,
                            years: projectYield.years
                        }
                    });
                }

                // Create project amenities
                if (createdProject.id && amenities) {
                    // First, delete existing amenities
                    await prisma.projectAmenity.deleteMany({
                        where: { projectId: createdProject.id }
                    });

                    // Then create new ones
                    for (const amenityName of amenities) {
                        const amenity = await prisma.amenity.findUnique({
                            where: { name: amenityName }
                        });

                        if (amenity) {
                            await prisma.projectAmenity.create({
                                data: {
                                    projectId: createdProject.id,
                                    amenityId: amenity.id
                                }
                            });
                        }
                    }
                }

                // Create project media
                if (createdProject.id && media) {
                    // First, delete existing media
                    await prisma.projectMedia.deleteMany({
                        where: { projectId: createdProject.id }
                    });

                    // Then create new ones
                    for (const mediaItem of media) {
                        await prisma.projectMedia.create({
                            data: {
                                projectId: createdProject.id,
                                type: mediaItem.type,
                                url: mediaItem.url,
                                title: mediaItem.title,
                                category: mediaItem.category
                            }
                        });
                    }
                }

                // Create buildings
                const buildings = [];
                for (let i = 1; i <= projectItem.totalBuildings; i++) {
                    const building = await prisma.building.create({
                        data: {
                            name: `Building ${i}`,
                            description: `Building ${i} of ${projectItem.name}`,
                            floors: Math.floor(Math.random() * 20) + 10, // Random number of floors between 10 and 30
                            projectId: createdProject.id
                        }
                    });
                    buildings.push(building);
                }

                // Generate and create units
                const units = generateUnits(
                    createdProject.id,
                    projectItem.totalUnits,
                    pricing.basePrice,
                    buildings.length
                );

                // Distribute units across buildings
                const unitsPerBuilding = Math.ceil(units.length / buildings.length);
                for (let i = 0; i < units.length; i++) {
                    const buildingIndex = Math.floor(i / unitsPerBuilding);
                    const building = buildings[buildingIndex];
                    if (building) {
                        const unit = units[i];
                        await prisma.unit.create({
                            data: {
                                name: unit.name,
                                price: unit.price,
                                floor: unit.floor,
                                status: unit.status,
                                number: unit.number,
                                area: unit.area,
                                bathrooms: unit.bathrooms,
                                bedrooms: unit.bedrooms,
                                projectId: unit.projectId,
                                buildingId: building.id
                            }
                        });
                    }
                }

            } catch (error) {
                console.error("Error creating project:", error);
                continue;
            }
        }

        // Seed the rest of the data from exported-data.json
        console.log("Seeding remaining data from exported-data.json...");

        // Seed agencies and agents
        console.log("Seeding agencies and agents...");
        for (const agency of data.agencies) {
            const { agents, createdAt, updatedAt, ...agencyData } = agency;
            const processedAgents = agents.map(agent => {
                const { createdAt, updatedAt, agencyId, ...agentData } = agent;
                return {
                    ...agentData,
                    firstName: agentData.firstName || "Agent",
                    lastName: agentData.lastName || "Demo",
                };
            });
            
            await prisma.agency.upsert({
                where: { id: agency.id },
                update: {
                    ...agencyData,
                    agents: {
                        deleteMany: {},
                        create: processedAgents,
                    },
                },
                create: {
                    ...agencyData,
                    agents: {
                        create: processedAgents,
                    },
                },
            });
        }

        // Seed achievements
        console.log("Seeding achievements...");
        if (data.achievements && Array.isArray(data.achievements)) {
            for (const achievement of data.achievements) {
                if (achievement && typeof achievement === 'object' && 'id' in achievement) {
                    const achievementObj = achievement as { 
                        id: string; 
                        createdAt?: Date | string; 
                        updatedAt?: Date | string;
                        title: string;
                        description: string;
                        icon: string;
                        xpReward: number;
                        conditions: any;
                    };
                    
                    const { createdAt, updatedAt, ...achievementData } = achievementObj;
                    
                    await prisma.achievement.upsert({
                        where: { id: achievementObj.id },
                        update: achievementData,
                        create: achievementData,
                    });
                }
            }
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
seedRealData()
  .catch((error) => {
    console.error("Error executing seed:", error);
    process.exit(1);
  });

export default seedRealData; 