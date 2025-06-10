import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET endpoint to fetch project price links
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    
    // Fetch the project with its price links
    const project = await prisma.project.findUnique({
      where: {
        id: awaitedParams.id
      },
      select: {
        id: true,
        priceLinks: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Parse the priceLinks field
    let priceLinks: { url: string; title: string }[] = [];
    
    try {
      // Если поле priceLinks существует и является массивом, используем его
      if (project.priceLinks && typeof project.priceLinks === 'object') {
        if (Array.isArray(project.priceLinks)) {
          priceLinks = project.priceLinks as { url: string; title: string }[];
        }
      }
    } catch (error) {
      console.error("Error parsing price links:", error);
      priceLinks = [];
    }

    return NextResponse.json({ priceLinks });
  } catch (error) {
    console.error("Get price links error:", error);
    return NextResponse.json(
      { error: "Failed to get price links" },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update project price links
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const data = await request.json();
    const { priceLinks } = data as {
      priceLinks: Array<{ url: string; title: string }>;
    };

    // Validate input
    if (!Array.isArray(priceLinks)) {
      return NextResponse.json(
        { error: "Invalid price links format" },
        { status: 400 }
      );
    }

    // Fetch the current project
    const project = await prisma.project.findUnique({
      where: { id: awaitedParams.id },
      select: {
        id: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Update the project with new priceLinks
    const updatedProject = await prisma.project.update({
      where: { id: awaitedParams.id },
      data: {
        priceLinks: priceLinks
      },
      select: {
        id: true,
        priceLinks: true
      }
    });

    // Extract and return the price links
    let updatedPriceLinks: { url: string; title: string }[] = [];
    
    try {
      if (updatedProject.priceLinks) {
        updatedPriceLinks = updatedProject.priceLinks as { url: string; title: string }[];
      }
    } catch (error) {
      console.error("Error extracting updated price links:", error);
    }

    return NextResponse.json({ priceLinks: updatedPriceLinks });
  } catch (error) {
    console.error("Price links update error:", error);
    return NextResponse.json(
      { error: "Failed to update price links" },
      { status: 500 }
    );
  }
} 