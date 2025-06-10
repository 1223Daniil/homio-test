import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get("unitId");
    
    const versions = await prisma.unitVersion.findMany({
      where: {
        unit: {
          projectId: params.id,
          ...(unitId ? { id: unitId } : {})
        }
      },
      include: {
        import: {
          select: {
            id: true,
            importDate: true
          }
        },
        unit: {
          select: {
            number: true
          }
        }
      },
      orderBy: {
        versionDate: 'desc'
      }
    });

    return NextResponse.json(versions);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch versions" },
      { status: 500 }
    );
  }
} 