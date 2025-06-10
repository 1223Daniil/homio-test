import { NextRequest, NextResponse } from "next/server";
import {
  Prisma,
  ProjectClass,
  ProjectStatus,
  ProjectType,
  UserRole
} from "@prisma/client";
import { handleAuthError, requireRole } from "@/lib/auth";

import { DomainProject } from "@/types/domain";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { projectCreateSchema } from "@/lib/validations/project";

type ProjectWithIncludes = Prisma.ProjectGetPayload<{
  include: {
    developer: {
      include: {
        translations: true;
      };
    };
    location: true;
    translations: true;
    media: true;
    amenities: {
      include: {
        amenity: true;
      };
    };
    pricing: {
      include: {
        currency: true;
      };
    };
    yield: true;
  };
}>;

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole([
      UserRole.ADMIN,
      UserRole.DEVELOPER,
      UserRole.AGENT
    ]);

    const where: Prisma.ProjectWhereInput | undefined =
      session.user.role === UserRole.DEVELOPER && session.user.developerId
        ? { developerId: session.user.developerId }
        : undefined;

    const projects = await prisma.project.findMany({
      ...(where && { where }),
      include: {
        developer: {
          include: {
            translations: true
          }
        },
        location: true,
        translations: true,
        media: true,
        amenities: {
          include: {
            amenity: true
          }
        },
        pricing: {
          include: {
            currency: true
          }
        },
        yield: true
      }
    });

    const domainProjects = projects.map(mapPrismaToDomain);
    return NextResponse.json(domainProjects);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  console.log(data);

  const validatedData = await projectCreateSchema.parseAsync(data);

  console.log("validatedData", validatedData);

  try {
    const session = await requireRole([UserRole.ADMIN, UserRole.DEVELOPER]);
    const isAdmin = session.user.role === UserRole.ADMIN;

    if (!session.user.developerId && !isAdmin) {
      return NextResponse.json(
        { error: "Developer ID not found" },
        { status: 400 }
      );
    }

    // Prepare create data with required fields
    const createData: Prisma.ProjectCreateInput = {
      type: validatedData.type,
      status: validatedData.status,
      name: validatedData.name,
      developer: {
        connect: {
          id: isAdmin ? validatedData.developerId : session.user.developerId
        }
      }
    };

    // Add optional fields if they exist in validated data
    if (validatedData.translations) {
      createData.translations = {
        create: validatedData.translations.create.map(t => ({
          language: t.language,
          name: t.name,
          description: t.description
        }))
      };
    }

    if (validatedData.location) {
      createData.location = {
        create: {
          city: validatedData.location.create.city,
          country: validatedData.location.create.country,
          district: validatedData.location.create.district || "",
          address: validatedData.location.create.address || "",
          latitude: validatedData.location.create.latitude || 0,
          longitude: validatedData.location.create.longitude || 0,
          beachDistance: validatedData.location.create.beachDistance || null,
          centerDistance: validatedData.location.create.centerDistance || null
        }
      };
    }

    if (validatedData.media) {
      createData.media = {
        create: validatedData.media.map(m => ({
          url: m.url,
          type: m.type,
          order: m.order,
          title: m.title
        }))
      };
    }

    if (validatedData.pricing) {
      createData.pricing = {
        create: {
          basePrice: validatedData.pricing.create.basePrice,
          pricePerSqm: validatedData.pricing.create.pricePerSqm,
          currencyId: validatedData.pricing.create.currencyId,
          maintenanceFee: validatedData.pricing.create.maintenanceFee,
          maintenanceFeePeriod:
            validatedData.pricing.create.maintenanceFeePeriod
        }
      };
    }

    if (validatedData.yield) {
      createData.yield = {
        create: {
          guaranteed: validatedData.yield.create.guaranteed,
          potential: validatedData.yield.create.potential,
          occupancy: validatedData.yield.create.occupancy,
          years: validatedData.yield.create.years
        }
      };
    }

    const project = await prisma.project.create({
      data: createData,
      include: {
        developer: {
          include: {
            translations: true
          }
        },
        location: true,
        translations: true,
        media: true,
        amenities: {
          include: {
            amenity: true
          }
        },
        pricing: {
          include: {
            currency: true
          }
        },
        yield: true
      }
    });

    // Transform to DomainProject format
    const domainProject = mapPrismaToDomain(project);

    return NextResponse.json(domainProject);
  } catch (error: any) {
    console.error("Project creation error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      data: error instanceof Error ? error : undefined
    });

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return handleAuthError(error);
  }
}

function mapPrismaToDomain(project: ProjectWithIncludes): DomainProject {
  return {
    id: project.id,
    name: project.translations[0]?.name || "",
    type: project.type,
    translations: project.translations.map(t => ({
      language: t.language,
      locale: t.language,
      name: t.name || "",
      description: t.description || undefined
    })),
    media: project.media.map(m => ({
      url: m.url,
      type: m.type,
      category: m.category,
      title: m.title || undefined,
      description: m.description || undefined,
      createdAt: m.createdAt.toISOString()
    })),
    location: project.location
      ? {
          city: project.location.city,
          district: project.location.district,
          country: project.location.country || "Thailand", // Default country
          coordinates: {
            lat: project.location.latitude,
            lng: project.location.longitude
          },
          beachDistance: project.location.beachDistance || undefined
        }
      : undefined,
    pricing: project.pricing
      ? {
          basePrice: project.pricing.basePrice,
          currency: {
            code: project.pricing.currency.code,
            symbol: project.pricing.currency.symbol
          },
          pricePerSqm: project.pricing.pricePerSqm
        }
      : undefined,
    amenities: project.amenities.map(a => ({
      name: a.amenity.name,
      category: a.amenity.category || undefined
    })),
    developer: project.developer
      ? {
          name: project.developer.translations[0]?.name || "",
          rating: undefined,
          completedProjects: project.developer.completedProjects || undefined
        }
      : undefined,
    investment: project.yield
      ? {
          rentalYield: project.yield.guaranteed,
          appreciation: project.yield.potential,
          paybackPeriod: undefined
        }
      : undefined,
    characteristics: [],
    status: project.status.toLowerCase() as DomainProject["status"],
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    paymentPlan: undefined,
    developerId: project.developerId
  };
}
