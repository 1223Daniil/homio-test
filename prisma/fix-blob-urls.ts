import { PrismaClient } from "@prisma/client";

// Инициализация клиента Prisma
const prisma = new PrismaClient();

// Функция проверки и исправления URL
function sanitizeUrl(url: string): string | null {
  // Проверяем, начинается ли URL с blob:
  if (url.startsWith("blob:")) {
    console.warn(`⚠️ Обнаружен blob URL: ${url}`);
    // Пытаемся извлечь реальный URL, если он был внутри blob URL
    const matches = url.match(/https:\/\/storage\.yandexcloud\.net\/[^"')\s]+/);
    if (matches && matches[0]) {
      console.log(`🔄 Исправляем blob URL на: ${matches[0]}`);
      return matches[0];
    }
    return null; // Не удалось исправить URL
  }

  return null; // URL не требует исправления
}

async function fixBlobUrls() {
  try {
    console.log("🔍 Поиск и исправление blob URLs в таблице ProjectMedia...");

    // Находим все записи, начинающиеся с blob:
    const blobUrls = await prisma.projectMedia.findMany({
      where: {
        url: {
          startsWith: "blob:"
        }
      },
      select: {
        id: true,
        url: true,
        projectId: true,
        title: true
      }
    });

    console.log(`📊 Найдено ${blobUrls.length} записей с blob URLs`);

    // Если нет blob URLs, завершаем работу
    if (blobUrls.length === 0) {
      console.log("✅ Нет записей с blob URLs для исправления");
      return;
    }

    // Счетчики для статистики
    let updatedCount = 0;
    let errorCount = 0;
    let cannotFixCount = 0;

    // Обрабатываем каждую запись
    for (const record of blobUrls) {
      try {
        // Выводим информацию о записи
        console.log(`\n--- Обработка записи ID=${record.id} ---`);
        console.log(`ProjectID: ${record.projectId}`);
        console.log(`Title: ${record.title}`);
        console.log(`Текущий URL: ${record.url}`);

        // Пытаемся исправить URL
        const fixedUrl = sanitizeUrl(record.url);

        if (fixedUrl) {
          // Обновляем запись в базе данных
          await prisma.projectMedia.update({
            where: { id: record.id },
            data: { url: fixedUrl }
          });

          console.log(`✅ URL успешно исправлен`);
          updatedCount++;
        } else {
          console.warn(`⚠️ Не удалось исправить URL автоматически`);
          cannotFixCount++;
        }
      } catch (error) {
        console.error(`❌ Ошибка при обработке записи ID=${record.id}:`, error);
        errorCount++;
      }
    }

    console.log("\n📈 Результаты исправления:");
    console.log(`✅ Успешно исправлено: ${updatedCount} записей`);
    console.log(`⚠️ Не удалось исправить: ${cannotFixCount} записей`);
    console.log(`❌ Ошибок: ${errorCount} записей`);
  } catch (error) {
    console.error("❌ Ошибка при исправлении blob URLs:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск функции
fixBlobUrls()
  .then(() => console.log("🎉 Исправление blob URLs завершено"))
  .catch(e => {
    console.error("❌ Ошибка в процессе выполнения:", e);
    process.exit(1);
  });
