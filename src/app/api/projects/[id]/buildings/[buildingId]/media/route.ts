import { NextRequest, NextResponse } from "next/server";

import { BuildingMediaCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/uploadFile";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; buildingId: string }> }
) {
  try {
    const awaitedParams = await params;
    const formData = await request.formData();
    const files = formData.getAll("files");
    const category = formData.get("category") as BuildingMediaCategory;

    const media = await Promise.all(
      files.map(async (file: FormDataEntryValue) => {
        if (!(file instanceof File)) {
          throw new Error("Invalid file type");
        }

        const url = await uploadFile(
          file,
          `buildings/${awaitedParams.buildingId}/${category.toLowerCase()}`
        );

        return prisma.buildingMedia.create({
          data: {
            buildingId: awaitedParams.buildingId,
            url,
            type: "image",
            category
          }
        });
      })
    );

    return NextResponse.json(media);
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 }
    );
  }
}
