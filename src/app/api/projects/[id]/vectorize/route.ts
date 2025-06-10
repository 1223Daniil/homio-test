import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";
import { vectorizationService } from "@/lib/ai/vectorization";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    // Get project with translations
    const project = await prisma.project.findUnique({
      where: { id: awaitedParams.id },
      include: {
        translations: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Generate and store embedding
    await vectorizationService.vectorizeProject(project);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to vectorize project:", error);
    return NextResponse.json(
      { error: "Failed to vectorize project" },
      { status: 500 }
    );
  }
}
