import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectIds } = await request.json();

    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid project IDs provided" },
        { status: 400 }
      );
    }

    // Verify that all projects exist before deleting
    const existingProjects = await prisma.project.findMany({
      where: {
        id: {
          in: projectIds
        }
      },
      select: {
        id: true
      }
    });

    if (existingProjects.length !== projectIds.length) {
      return NextResponse.json(
        { error: "Some projects do not exist" },
        { status: 404 }
      );
    }

    // Delete projects
    await prisma.project.deleteMany({
      where: {
        id: {
          in: projectIds
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete projects error:", error);
    return NextResponse.json(
      { error: "Failed to delete projects" },
      { status: 500 }
    );
  }
}
