import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

interface Translation {
  title: string;
  description: string;
  validUntil: string;
}

interface SpecialOffer {
  id: string;
  translations: {
    [key: string]: Translation;
  };
  icon: string;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const { id } = awaitedParams;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to edit projects
    if (!["ADMIN", "DEVELOPER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { specialOffers } = await request.json();
    console.log(
      "Received special offers:",
      JSON.stringify(specialOffers, null, 2)
    );

    // Validate the data
    if (!Array.isArray(specialOffers)) {
      return NextResponse.json(
        { error: "Invalid special offers data" },
        { status: 400 }
      );
    }

    // Validate each special offer
    for (const offer of specialOffers) {
      console.log("Validating offer:", JSON.stringify(offer, null, 2));

      if (!offer.id || !offer.translations || !offer.icon) {
        return NextResponse.json(
          {
            error: "Missing required fields in special offers",
            offer
          },
          { status: 400 }
        );
      }

      // Validate translations for each locale
      for (const locale of Object.keys(offer.translations)) {
        const translation = offer.translations[locale];
        console.log(`Validating translation for ${locale}:`, translation);

        if (!translation || typeof translation !== "object") {
          return NextResponse.json(
            {
              error: `Invalid translation object for locale: ${locale}`,
              translation
            },
            { status: 400 }
          );
        }

        // Проверяем только наличие полей, но разрешаем пустые строки
        if (
          !("title" in translation) ||
          !("description" in translation) ||
          !("validUntil" in translation) ||
          typeof translation.title !== "string" ||
          typeof translation.description !== "string" ||
          typeof translation.validUntil !== "string"
        ) {
          return NextResponse.json(
            {
              error: `Invalid translation field types for locale: ${locale}`,
              translation
            },
            { status: 400 }
          );
        }
      }
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: id },
      select: { id: true }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Update the project with new special offers
    const updatedProject = await prisma.project.update({
      where: { id: id },
      data: {
        specialOffers: JSON.stringify(specialOffers)
      },
      select: {
        id: true,
        specialOffers: true
      }
    });

    console.log("Updated project:", updatedProject);
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error updating special offers:", error);
    return NextResponse.json(
      { error: "Failed to update special offers", details: error },
      { status: 500 }
    );
  }
}
