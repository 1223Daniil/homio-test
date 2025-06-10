import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; buildingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceFloorPlanId, targetFloorNumber, copyUnits } = await request.json();

    // Check if target floor already has a plan
    const existingFloorPlan = await prisma.floorPlan.findFirst({
      where: {
        buildingId: params.buildingId,
        floorNumber: parseInt(targetFloorNumber),
      },
    });

    if (existingFloorPlan) {
      return NextResponse.json(
        { error: 'Floor plan already exists for this floor' },
        { status: 400 }
      );
    }

    // Get source floor plan with units
    const sourceFloorPlan = await prisma.floorPlan.findUnique({
      where: { id: sourceFloorPlanId },
      include: { units: true }
    });

    if (!sourceFloorPlan) {
      return NextResponse.json(
        { error: 'Source floor plan not found' },
        { status: 404 }
      );
    }

    // Create new floor plan
    const newFloorPlan = await prisma.floorPlan.create({
      data: {
        buildingId: params.buildingId,
        floorNumber: parseInt(targetFloorNumber),
        imageUrl: sourceFloorPlan.imageUrl,
        svgData: sourceFloorPlan.svgData,
        name: `Floor ${targetFloorNumber}`,
        status: 'DRAFT',
      },
    });

    // Copy units if requested
    if (copyUnits && sourceFloorPlan.units.length > 0) {
      const unitsToCreate: Prisma.UnitCreateManyInput[] = sourceFloorPlan.units.map(unit => {
        const unitNumber = unit.number || `${targetFloorNumber}01`; // Fallback if number is null
        return {
          name: unit.name,
          projectId: unit.projectId,
          buildingId: unit.buildingId,
          floorPlanId: newFloorPlan.id,
          floor: parseInt(targetFloorNumber),
          number: unitNumber.replace(
            sourceFloorPlan.floorNumber.toString(),
            targetFloorNumber
          ),
          status: unit.status,
          price: unit.price,
          area: unit.area,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          description: unit.description,
          mainImage: unit.mainImage,
          layoutId: unit.layoutId,
          type: unit.type
        };
      });

      await prisma.unit.createMany({
        data: unitsToCreate,
      });
    }

    // Return the new floor plan
    return NextResponse.json(newFloorPlan);
  } catch (error) {
    console.error('Error copying floor plan:', error);
    return NextResponse.json(
      { error: 'Failed to copy floor plan' },
      { status: 500 }
    );
  }
} 