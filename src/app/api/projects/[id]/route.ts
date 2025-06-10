import { NextRequest, NextResponse } from "next/server";
import { ProjectClass, ProjectStatus, ProjectType } from "@prisma/client";

import { Prisma } from "@prisma/client";
import { ProjectTranslation } from "./../../../../types/domain";
import { UserRole } from "@prisma/client";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { projectUpdateSchema } from "@/lib/validations/project";
import { requireRole } from "@/lib/auth";
import slugify from "slugify";
import { translateText } from "@/utils/aiTranslator";
import { z } from "zod";

const ProjectTranslationSchema = z
  .object({
    id: z.string().optional(),
    projectId: z.string().optional(),
    locale: z.string().optional().default("en"),
    language: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
  })
  .transform(data => ({
    ...data,
    locale: data.locale || data.language || "en"
  }));

const LocationSchema = z.object({
  id: z.string().optional(),
  country: z.string(),
  city: z.string(),
  district: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  beachDistance: z.number(),
  centerDistance: z.number(),
  projectId: z.string()
});

const updateProjectSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    type: z.nativeEnum(ProjectType).optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    completionDate: z.string().nullable().optional(),
    siteUrl: z.string().optional(),
    deliveryStage: z.string().optional(),
    translations: z.array(ProjectTranslationSchema).optional(),
    location: LocationSchema.optional(),
    totalUnits: z.number().int().nullable().optional(),
    constructionStatus: z.number().int().nullable().optional(),
    phase: z.number().int().nullable().optional(),
    totalLandArea: z.number().nullable().optional(),
    infrastructureArea: z.number().nullable().optional(),
    class: z
      .string()
      .transform(val => val.toUpperCase())
      .pipe(z.nativeEnum(ProjectClass))
      .optional(),
    developerId: z.string().optional()
  })
  .passthrough();

const projectParametersSchema = z.object({
  totalUnits: z.number().int().nullable().optional(),
  constructionStatus: z.number().int().min(0).max(100).nullable().optional(),
  phase: z.number().int().min(0).nullable().optional(),
  totalLandArea: z.number().nullable().optional(),
  infrastructureArea: z.number().nullable().optional(),
  class: z
    .string()
    .transform(val => val.toUpperCase())
    .pipe(z.nativeEnum(ProjectClass))
    .optional(),
  publicTransport: z.number().min(0).max(10).nullable().optional(),
  amenitiesLevel: z.number().min(0).max(10).nullable().optional(),
  climateConditions: z.number().min(0).max(10).nullable().optional(),
  beachAccess: z.number().min(0).max(10).nullable().optional(),
  rentalDemand: z.number().min(0).max(10).nullable().optional(),
  safetyLevel: z.number().min(0).max(10).nullable().optional(),
  noiseLevel: z.number().min(0).max(10).nullable().optional(),
  schoolsAvailable: z.number().min(0).max(10).nullable().optional()
});

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await context.params;
    const { id } = awaitedParams;
    const { searchParams } = new URL(request.url);
    const include = searchParams.get("include")?.split(",") || [];

    console.log(
      `GET request for project ID: ${id}, including: ${include.join(", ") || "none"}`
    );

    try {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          documents: include.includes("documents"),
          media: include.includes("media"),
          location: include.includes("location"),
          buildings: {
            include: {
              media: true,
              units: {
                include: {
                  media: true
                }
              }
            }
          },
          units: {
            include: {
              media: true
            }
          },
          developer: {
            include: {
              translations: true
            }
          },
          translations: true,
          pricing: true,
          yield: true,
          masterPlanPoints: true,
          PurchaseConditions: true,
          paymentStages: true,
          agentCommissions: true,
          cashbackBonuses: true,
          additionalExpenses: true,
          amenities: {
            include: {
              amenity: true
            }
          }
        }
      });

      if (!project) {
        console.log(`Project not found: ${id}`);
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      // Transform class to lowercase before returning
      if (project.class) {
        project.class = project.class.toLowerCase() as any;
      }

      console.log(`Successfully fetched project: ${id}`);
      return NextResponse.json(project);
    } catch (dbError) {
      console.error("Database error when fetching project:", dbError);
      return NextResponse.json(
        {
          error: "Database error when fetching project",
          details: dbError instanceof Error ? dbError.message : String(dbError)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch project",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log("PATCH request received");
  try {
    const awaitedParams = await context.params;
    const { id } = awaitedParams;
    const session = await requireRole([UserRole.ADMIN, UserRole.DEVELOPER]);

    console.log("Project ID:", id);

    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: {
        translations: true,
        location: true
      }
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    console.log("Existing project:", existingProject);

    const data = await request.json();
    console.log("Received data:", data);

    // Validate parameters
    // const validationResult = projectParametersSchema.safeParse(data);
    // if (!validationResult.success) {
    //   return NextResponse.json(
    //     { error: validationResult.error.errors },
    //     { status: 400 }
    //   );
    // }

    // console.log("validationResult", validationResult);

    // const validatedData = validationResult.data;

    // Create type-safe update object with Prisma field operations
    const updateData: Prisma.ProjectUpdateInput = {};

    // Обновляем параметры объекта недвижимости
    if (data.publicTransport !== undefined) {
      updateData.publicTransport = data.publicTransport;
    }
    if (data.amenitiesLevel !== undefined) {
      updateData.amenitiesLevel = data.amenitiesLevel;
    }
    if (data.climateConditions !== undefined) {
      updateData.climateConditions = data.climateConditions;
    }
    if (data.beachAccess !== undefined) {
      updateData.beachAccess = data.beachAccess;
    }
    if (data.rentalDemand !== undefined) {
      updateData.rentalDemand = data.rentalDemand;
    }
    if (data.safetyLevel !== undefined) {
      updateData.safetyLevel = data.safetyLevel;
    }
    if (data.noiseLevel !== undefined) {
      updateData.noiseLevel = data.noiseLevel;
    }
    if (data.schoolsAvailable !== undefined) {
      updateData.schoolsAvailable = data.schoolsAvailable;
    }
    if (data.class !== undefined) {
      // Преобразуем строковое значение в перечисление ProjectClass
      // Значения должны быть одним из: STANDARD, COMFORT, BUSINESS, PREMIUM, ELITE, LUXURY
      const classValue = data.class.toUpperCase();
      if (
        [
          "STANDARD",
          "COMFORT",
          "BUSINESS",
          "PREMIUM",
          "ELITE",
          "LUXURY"
        ].includes(classValue)
      ) {
        updateData.class = classValue;
      } else {
        console.warn(
          `Неверное значение для поля class: ${data.class}. Используется значение по умолчанию STANDARD.`
        );
        updateData.class = "STANDARD";
      }
    }

    // Другие параметры, которые могут быть в данных
    if (data.totalUnits !== undefined) {
      updateData.totalUnits = data.totalUnits;
    }
    if (data.constructionStatus !== undefined) {
      updateData.constructionStatus = data.constructionStatus;
    }
    if (data.phase !== undefined) {
      updateData.phase = data.phase;
    }
    if (data.totalLandArea !== undefined) {
      updateData.totalLandArea = data.totalLandArea;
    }
    if (data.infrastructureArea !== undefined) {
      updateData.infrastructureArea = data.infrastructureArea;
    }

    let objToTranslate;
    // Определяем типизированный интерфейс для переводов
    interface TranslatedItem {
      locale: string;
      name: string;
      description?: string | null;
    }
    let translatedData: TranslatedItem[] | null = null;

    // Проверяем существование data.translations перед вызовом find
    if (data.translations && Array.isArray(data.translations)) {
      objToTranslate = data.translations.find(t => t.language === data.locale);

      console.log("objToTranslate", objToTranslate);

      if (objToTranslate) {
        translatedData = (await translateText(objToTranslate)) as
          | TranslatedItem[]
          | null;
        console.log("translatedData", translatedData);
      }
    }

    const updatedSlug = slugify(data.name, {
      lower: true,
      strict: true
    });

    const updateTx = await prisma.$transaction(async tx => {
      // Обработка переводов
      if (
        data.translations?.length &&
        translatedData &&
        Array.isArray(translatedData)
      ) {
        // Обновляем или создаем переводы для каждой локали
        await Promise.all(
          translatedData.map(translation =>
            tx.projectTranslation.upsert({
              where: {
                projectId_language: {
                  projectId: id,
                  language: translation.locale
                }
              },
              update: {
                name: translation.name,
                description: translation.description || null
              },
              create: {
                projectId: id,
                language: translation.locale,
                name: translation.name,
                description: translation.description || null
              }
            })
          )
        );
      }

      const { documents, media, translations, developerId, locale, ...rest } =
        data;

      // Обновление проекта
      const updatedProject = await tx.project.update({
        where: { id },
        data: {
          ...rest,
          completionDate: data.completionDate,
          type: data.type,
          status: data.status,
          siteUrl: data.siteUrl,
          ...(data.developerId && { developerId: data.developerId }),
          ...updateData,
          slug: updatedSlug
        },
        include: {
          translations: true,
          location: true
        }
      });

      return updatedProject;
    });

    console.log("Updated project:", updateTx);

    return NextResponse.json(updateTx);
  } catch (error: any) {
    console.error("Project update error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      code: error?.code || "UNKNOWN",
      name: error?.name || "Unknown error type"
    });

    // Дополнительно логируем детали ошибки Prisma, если они доступны
    if (error.meta && error.code) {
      console.error("Prisma error details:", {
        code: error.code,
        meta: error.meta,
        target: error.meta?.target || []
      });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    if (error.name === "UnauthorizedError") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to update project",
        message: error instanceof Error ? error.message : "Unknown error",
        code: error?.code
      },
      { status: 500 }
    );
  }
}
