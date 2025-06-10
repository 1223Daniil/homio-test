import { NextResponse } from "next/server";
import { UnitMediaCategory } from "@prisma/client";
import axios from "axios";
import { encode } from "blurhash";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  try {
    const awaitedParams = await params;
    const data = await request.json();

    console.log("API route: получены данные", {
      params: awaitedParams,
      body: data
    });

    if (data.mediaId) {
      const projectMedia = await prisma.projectMedia.findUnique({
        where: {
          id: data.mediaId
        }
      });

      if (!projectMedia) {
        console.error("API route: Не найдено ProjectMedia", {
          mediaId: data.mediaId
        });
        return NextResponse.json(
          { error: "ProjectMedia not found" },
          { status: 404 }
        );
      }

      // Используем существующий блюрхеш из projectMedia если он есть
      let blurhash: string | null = projectMedia.blurhash || null;

      // Если блюрхеша нет и есть URL, то создаем его
      if (!blurhash && projectMedia.url) {
        try {
          // Загружаем изображение по URL
          const imageResponse = await axios.get(projectMedia.url, {
            responseType: "arraybuffer"
          });

          // Обрабатываем изображение с помощью Sharp
          const image = sharp(Buffer.from(imageResponse.data));
          const { data: imageData, info } = await image
            .raw()
            .ensureAlpha()
            .resize(32, 32, { fit: "inside" })
            .toBuffer({ resolveWithObject: true });

          blurhash = await encode(
            new Uint8ClampedArray(imageData),
            info.width,
            info.height,
            4,
            4
          );
        } catch (err) {
          console.error("Ошибка при создании blurhash:", err);
        }
      }

      const media = await prisma.unitMedia.create({
        data: {
          url: projectMedia.url || data.url,
          title: data.title || null,
          type: data.type || projectMedia.type,
          category: data.category as UnitMediaCategory,
          blurhash,
          unit: {
            connect: {
              id: awaitedParams.unitId
            }
          }
        }
      });

      console.log("API route: Создано UnitMedia", media);
      return NextResponse.json(media);
    } else {
      if (!data.url) {
        console.error("API route: Отсутствует обязательное поле url", data);
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
      }

      // Создаем блюрхеш для нового изображения
      let blurhash: string | null = null;
      try {
        // Загружаем изображение по URL
        const imageResponse = await axios.get(data.url, {
          responseType: "arraybuffer"
        });

        // Обрабатываем изображение с помощью Sharp
        const image = sharp(Buffer.from(imageResponse.data));
        const { data: imageData, info } = await image
          .raw()
          .ensureAlpha()
          .resize(32, 32, { fit: "inside" })
          .toBuffer({ resolveWithObject: true });

        blurhash = await encode(
          new Uint8ClampedArray(imageData),
          info.width,
          info.height,
          4,
          4
        );
      } catch (err) {
        console.error("Ошибка при создании blurhash:", err);
      }

      const media = await prisma.unitMedia.create({
        data: {
          url: data.url,
          title: data.title || null,
          type: data.type || "image",
          category: data.category as UnitMediaCategory,
          blurhash,
          unit: {
            connect: {
              id: awaitedParams.unitId
            }
          }
        }
      });

      return NextResponse.json(media);
    }
  } catch (error) {
    console.error("Error creating media:", error);
    return NextResponse.json(
      { error: "Failed to create media", details: JSON.stringify(error) },
      { status: 500 }
    );
  }
}
