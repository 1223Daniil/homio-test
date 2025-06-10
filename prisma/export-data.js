import { PrismaClient } from "@prisma/client";
import fs from 'fs';

const prisma = new PrismaClient();

async function exportData() {
    try {
        // Export developers with translations
        const developers = await prisma.developer.findMany({
            include: {
                translations: true,
            },
        });

        // Export amenities
        const amenities = await prisma.amenity.findMany();

        // Export projects with related data
        const projects = await prisma.project.findMany({
            include: {
                translations: true,
                amenities: {
                    include: {
                        amenity: true,
                    },
                },
                location: true,
                pricing: true,
                yield: true,
                media: true,
                videos: true,
                propertyTypes: true,
                masterPlanPoints: true,
                documents: true,
                buildings: {
                    include: {
                        media: true,
                        units: {
                            include: {
                                media: true,
                                features: true,
                                currency: true,
                            }
                        }
                    }
                }
            },
        });

        // Export currencies
        const currencies = await prisma.currency.findMany();

        // Export roles and permissions
        const roles = await prisma.role.findMany();

        // Export agencies with agents
        const agencies = await prisma.agency.findMany({
            include: {
                agents: true,
            },
        });

        // Export courses with modules and lessons
        const courses = await prisma.course.findMany({
            include: {
                modules: {
                    include: {
                        lessons: {
                            include: {
                                quiz: {
                                    include: {
                                        questions: {
                                            include: {
                                                options: true
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        tests: {
                            include: {
                                questions: true
                            }
                        }
                    }
                }
            }
        });

        // Export achievements
        const achievements = await prisma.achievement.findMany();

        // Format data for seed files
        const formattedData = {
            developers: developers.map(dev => ({
                ...dev,
                translations: dev.translations.map(t => ({
                    language: t.language,
                    name: t.name,
                    description: t.description,
                })),
            })),
            amenities: amenities.map(a => ({
                name: a.name,
                description: a.description,
                icon: a.icon,
            })),
            projects: projects.map(p => ({
                ...p,
                translations: p.translations.map(t => ({
                    language: t.language,
                    name: t.name,
                    description: t.description,
                })),
                amenities: p.amenities.map(a => ({
                    amenity: {
                        name: a.amenity.name,
                        description: a.amenity.description,
                    },
                })),
            })),
            currencies,
            roles,
            agencies,
            courses,
            achievements,
        };

        // Write to a temporary JSON file
        fs.writeFileSync(
            'exported-data.json',
            JSON.stringify(formattedData, null, 2)
        );

        console.log('Data exported successfully to prisma/exported-data.json');
    } catch (error) {
        console.error('Error exporting data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

exportData();