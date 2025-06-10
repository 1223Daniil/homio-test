import Papa from "papaparse";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Инициализация клиента Prisma
const prisma = new PrismaClient();

// Путь к CSV файлу - замените на актуальное расположение файла
const csvFilePath = path.resolve(
  process.cwd(),
  "ProjectMedia__202503251127.csv"
);

// Интерфейс для данных из CSV
interface ProjectMediaCSV {
  id: string;
  projectId: string;
  type: string;
  url: string;
  title: string;
  description: string;
  category: string;
  order: string;
  createdAt: string;
  updatedAt: string;
  isCover: string;
  isMainVideo: string;
  metadata: string;
  thumbnailUrl: string;
}

// Функция проверки и исправления URL
function sanitizeUrl(url: string): string {
  // Проверяем, начинается ли URL с blob:
  if (url.startsWith("blob:")) {
    console.warn(`⚠️ Обнаружен blob URL: ${url}`);
    // Пытаемся извлечь реальный URL, если он был внутри blob URL
    const matches = url.match(/https:\/\/storage\.yandexcloud\.net\/[^"')\s]+/);
    if (matches && matches[0]) {
      console.log(`🔄 Исправляем blob URL на: ${matches[0]}`);
      return matches[0];
    }
    return url;
  }

  // Проверяем, содержит ли URL действительный путь к хранилищу
  if (!url.includes("storage.yandexcloud.net")) {
    console.warn(`⚠️ URL не содержит ссылку на хранилище: ${url}`);
  }

  return url;
}

async function updateProjectMedia() {
  try {
    console.log("🔄 Начинаем обновление медиафайлов проектов...");

    // Проверяем существование файла
    if (!fs.existsSync(csvFilePath)) {
      console.error(`❌ Файл не найден: ${csvFilePath}`);
      return;
    }

    // Читаем CSV файл
    const csvFile = fs.readFileSync(csvFilePath, "utf8");

    // Парсим CSV
    const { data, errors } = Papa.parse<ProjectMediaCSV>(csvFile, {
      header: true,
      skipEmptyLines: true
    });

    if (errors.length > 0) {
      console.error("❌ Ошибки при чтении CSV:", errors);
      return;
    }

    console.log(`📊 Найдено ${data.length} записей в CSV файле`);

    // Счетчики для статистики
    let updatedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let blobUrlsFound = 0;

    // Получаем список всех существующих ID из базы данных
    console.log("🔍 Получаем список существующих ID из базы данных...");
    const existingMediaIds = await prisma.projectMedia.findMany({
      select: { id: true }
    });
    const existingIds = new Set(existingMediaIds.map(item => item.id));
    console.log(`📊 Найдено ${existingIds.size} записей в базе данных`);

    // Обновляем записи в базе данных
    for (const record of data) {
      try {
        if (!record.id || !record.url) {
          console.warn(
            `⚠️ Пропускаем запись без ID или URL: ${JSON.stringify(record)}`
          );
          skippedCount++;
          continue;
        }

        // Проверяем, существует ли запись в базе данных
        if (!existingIds.has(record.id)) {
          console.warn(
            `⚠️ Запись с ID=${record.id} не найдена в базе данных, пропускаем`
          );
          skippedCount++;
          continue;
        }

        // Проверяем и исправляем URL
        const sanitizedUrl = sanitizeUrl(record.url);
        if (sanitizedUrl !== record.url) {
          blobUrlsFound++;
        }

        // Обновляем запись в базе данных
        await prisma.projectMedia.update({
          where: { id: record.id },
          data: { url: sanitizedUrl }
        });

        updatedCount++;

        // Выводим прогресс каждые 10 записей
        if (updatedCount % 10 === 0) {
          console.log(`🔄 Обновлено ${updatedCount} записей...`);
        }
      } catch (error) {
        console.error(
          `❌ Ошибка при обновлении записи ID=${record.id}:`,
          error
        );
        errorCount++;
      }
    }

    console.log("\n📈 Результаты обновления:");
    console.log(`✅ Успешно обновлено: ${updatedCount} записей`);
    console.log(`⚠️ Пропущено: ${skippedCount} записей`);
    console.log(`🧹 Исправлено blob URL: ${blobUrlsFound} записей`);
    console.log(`❌ Ошибок: ${errorCount} записей`);
  } catch (error) {
    console.error("❌ Ошибка при обновлении медиафайлов проектов:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск функции
updateProjectMedia()
  .then(() => console.log("🎉 Обновление медиафайлов проектов завершено"))
  .catch(e => {
    console.error("❌ Ошибка в процессе выполнения:", e);
    process.exit(1);
  });
