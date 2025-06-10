"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const getBaseUnitLayoutData = async (layoutId: string) => {
  const layout = await prisma.unitLayout.findUnique({
    where: {
      id: layoutId
    }
  });

  return layout;
};

export const getLayoutById = async ({
  layoutId,
  select,
  language
}: {
  layoutId: string | null | undefined;
  select?: Prisma.UnitLayoutSelect;
  language?: string;
}) => {
  if (!layoutId) {
    return null;
  }

  const baseSelect = {
    id: true,
    name: true,
    type: true,
    description: true,
    status: true,
    mainImage: true,
    images: true,
    ...(select || {})
  };

  const layout = await prisma.unitLayout.findUnique({
    where: { id: layoutId },
    select: {
      ...baseSelect,
      UnitLayoutTranslation: {
        where: language ? { language } : { language: "en" }
      }
    }
  });

  return layout;
};

export const getLayoutsByProjectId = async ({
  projectId,
  select
}: {
  projectId: string;
  select?: Prisma.UnitLayoutSelect;
}) => {
  const layouts = await prisma.unitLayout.findMany({
    where: { projectId },
    select: {
      id: true,
      name: true,
      type: true,
      description: true,
      status: true
    }
  });
  return layouts;
};
