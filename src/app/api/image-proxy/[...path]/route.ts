import { NextRequest, NextResponse } from "next/server";

import sharp from "sharp";

const CACHE_MAX_AGE = 60 * 60 * 24 * 180; // 180 дней

export const dynamic = "force-dynamic"; // Защита от ошибок SSG
export const fetchCache = "force-cache"; // Кэширование ответов
export const revalidate = 102300000; // 180 дней (60 * 60 * 24 * 180)

// Список расширений файлов изображений, которые будем обрабатывать
const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "avif",
  "jfif"
];

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Восстанавливаем полный путь из массива сегментов
    const path = params.path.join("/");

    // Получаем URL параметры для обработки изображений
    const { searchParams } = request.nextUrl;
    const width = searchParams.get("width")
      ? parseInt(searchParams.get("width")!)
      : undefined;
    const height = searchParams.get("height")
      ? parseInt(searchParams.get("height")!)
      : undefined;
    const quality = searchParams.get("quality")
      ? parseInt(searchParams.get("quality")!)
      : 80;
    const format = searchParams.get("format") || undefined;
    const progressive = searchParams.get("progressive") === "true";

    // Проверяем расширение файла
    const fileExtension = path.split(".").pop()?.toLowerCase();

    // Если это не изображение - перенаправляем напрямую на источник
    if (!fileExtension || !IMAGE_EXTENSIONS.includes(fileExtension)) {
      console.log(
        `[Image Proxy] Bypassing non-image file: ${path} (${fileExtension})`
      );

      // Формируем URL для Yandex Cloud
      const directUrl = `https://storage.yandexcloud.net/${path}`;

      // Перенаправляем на прямой URL
      return NextResponse.redirect(directUrl, 307);
    }

    // Формируем URL для Yandex Cloud
    const url = `https://storage.yandexcloud.net/${path}`;

    console.log(`[Image Proxy] Fetching image: ${url} with params:`, {
      width,
      height,
      quality,
      format,
      progressive
    });

    // Получаем изображение с таймаутом
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 секунд таймаут

    try {
      // Получаем изображение
      const response = await fetch(url, {
        headers: {
          "User-Agent": "homio-image-proxy"
        },
        signal: controller.signal,
        next: {
          revalidate: CACHE_MAX_AGE // Используем встроенный кэш Next.js
        }
      });

      clearTimeout(timeoutId);

      // Если изображение не найдено, возвращаем 404
      if (!response.ok) {
        console.error(
          `[Image Proxy] Error: ${response.status} ${response.statusText} for ${url}`
        );
        return new NextResponse("Image not found", { status: 404 });
      }

      // Получаем данные изображения
      const imageBuffer = await response.arrayBuffer();
      const contentType = response.headers.get("content-type") || "image/jpeg";

      // Если нет параметров оптимизации, возвращаем изображение как есть
      if (!width && !height && !format && quality === 80 && !progressive) {
        console.log(
          `[Image Proxy] No optimization: ${url} (${contentType}, ${imageBuffer.byteLength} bytes)`
        );

        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}`,
            "Access-Control-Allow-Origin": "*"
          }
        });
      }

      // Оптимизируем изображение с использованием sharp
      let sharpInstance = sharp(Buffer.from(imageBuffer));

      // Изменяем размер если указаны параметры
      if (width || height) {
        sharpInstance = sharpInstance.resize({
          width: width,
          height: height,
          fit: "inside", // Сохраняем пропорции
          withoutEnlargement: true // Не увеличиваем маленькие изображения
        });
      }

      // Добавляем дополнительную оптимизацию для всех изображений
      sharpInstance = sharpInstance
        .normalize() // Нормализуем контраст
        .modulate({ brightness: 1, saturation: 1.1 }) // Слегка увеличиваем насыщенность
        .toColorspace("srgb"); // Используем sRGB

      // Конвертируем в нужный формат если указан
      if (format) {
        switch (format.toLowerCase()) {
          case "webp":
            sharpInstance = sharpInstance.webp({
              quality,
              effort: 6, // Более высокий уровень сжатия (0-6)
              lossless: false // Используем сжатие с потерями
            });
            break;
          case "avif":
            sharpInstance = sharpInstance.avif({
              quality,
              effort: 7, // Высокий уровень сжатия (0-9)
              lossless: false // Используем сжатие с потерями
            });
            break;
          case "jpeg":
          case "jpg":
            sharpInstance = sharpInstance.jpeg({
              quality,
              progressive,
              optimizeCoding: true, // Оптимизируем кодирование
              mozjpeg: true // Используем mozjpeg для лучшего сжатия
            });
            break;
          case "png":
            sharpInstance = sharpInstance.png({
              quality,
              compressionLevel: 9, // Максимальное сжатие (0-9)
              palette: true, // Используем палитру для оптимизации
              colors: 256 // Максимальное количество цветов для палитры
            });
            break;
        }
      } else {
        // Если формат не указан, используем формат исходного изображения
        if (contentType.includes("jpeg") || contentType.includes("jpg")) {
          sharpInstance = sharpInstance.jpeg({
            quality,
            progressive,
            optimizeCoding: true,
            mozjpeg: true
          });
        } else if (contentType.includes("png")) {
          sharpInstance = sharpInstance.png({
            quality,
            compressionLevel: 9,
            palette: contentType.includes("alpha") ? false : true,
            colors: 256
          });
        } else if (contentType.includes("webp")) {
          sharpInstance = sharpInstance.webp({
            quality,
            effort: 6,
            lossless: false
          });
        }
      }

      // Обрабатываем изображение
      const optimizedImageBuffer = await sharpInstance.toBuffer();
      const outputContentType = format
        ? `image/${format.replace("jpg", "jpeg")}`
        : contentType;

      console.log(
        `[Image Proxy] Optimized: ${url} (${outputContentType}, ${optimizedImageBuffer.length} bytes, saved ${Math.round((1 - optimizedImageBuffer.length / imageBuffer.byteLength) * 100)}%)`
      );

      // Формируем ответ с правильными заголовками
      return new NextResponse(optimizedImageBuffer, {
        status: 200,
        headers: {
          "Content-Type": outputContentType,
          "Cache-Control": `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}`,
          "Access-Control-Allow-Origin": "*"
        }
      });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("Error proxying image:", error);

    // При таймауте возвращаем заглушку
    if (error instanceof DOMException && error.name === "AbortError") {
      return new NextResponse("Image fetch timed out", { status: 504 });
    }

    return new NextResponse("Error fetching image", { status: 500 });
  }
}
