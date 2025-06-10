"use server";

import { prisma } from "@/lib/prisma";

export const getUnit = async (unitId: string) => {
  const unit = await prisma.unit.findUnique({
    where: {
      id: unitId
    },
    include: {
      media: true,
      layout: true,
      floorPlan: true,
      building: {
        include: {
          media: {
            where: {
              category: {
                in: ["FLOOR_PLANS", "LAYOUT_PLANS"]
              }
            }
          }
        }
      },
      project: {
        include: {
          translations: true,
          media: true,
          location: true,
          paymentStages: true,
          agentCommissions: true,
          cashbackBonuses: true,
          additionalExpenses: true,
          PurchaseConditions: true
        }
      }
    }
  });

  return unit;
};

export const getBuilding = async (buildingId: string) => {
  const building = await prisma.building.findUnique({
    where: {
      id: buildingId
    },
    include: {
      media: true,
      floorPlans: true,
      units: {
        include: {
          media: true
        }
      },
      _count: {
        select: {
          units: true
        }
      }
    }
  });

  return building;
};

export const getUnitBySlug = async (slug: string) => {
  const unit = await prisma.unit.findUnique({
    where: {
      slug
    },
    include: {
      media: true,
      layout: true,
      floorPlan: true,
      building: {
        include: {
          media: {
            where: {
              category: {
                in: ["FLOOR_PLANS", "LAYOUT_PLANS"]
              }
            }
          }
        }
      },
      project: {
        include: {
          translations: true,
          media: true,
          location: true,
          paymentStages: true,
          agentCommissions: true,
          cashbackBonuses: true,
          additionalExpenses: true,
          PurchaseConditions: true
        }
      }
    }
  });

  return unit;
};
