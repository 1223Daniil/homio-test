import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; buildingId: string; floorPlanId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { areas } = await request.json();

    // Validate that areas is an array
    if (!Array.isArray(areas)) {
      return NextResponse.json({ error: 'Invalid areas data' }, { status: 400 });
    }

    // Ensure params are properly typed and available
    const { floorPlanId, buildingId } = params;
    if (!floorPlanId || !buildingId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Update the floor plan with the new areas
    const updatedFloorPlan = await prisma.floorPlan.update({
      where: {
        id: floorPlanId,
        buildingId: buildingId
      },
      data: {
        svgData: JSON.stringify(areas),
        areas: {
          deleteMany: {},
          createMany: {
            data: areas.map(({ id, floorPlanId, center, ...area }) => ({
              ...area,
              // Remove center field as it's not in the database schema
              // Remove any existing id and floorPlanId fields
            }))
          }
        }
      }
    });

    return NextResponse.json(updatedFloorPlan);
  } catch (error) {
    console.error('Error updating floor plan areas:', error);
    return NextResponse.json(
      { error: 'Failed to update floor plan areas' },
      { status: 500 }
    );
  }
} 