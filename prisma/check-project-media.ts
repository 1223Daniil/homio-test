import { PrismaClient } from "@prisma/client";

// Инициализация клиента Prisma
const prisma = new PrismaClient();

async function checkProjectMedia() {
  try {
    console.log("📋 Получаем информацию о таблице ProjectMedia...");

    // Получаем несколько записей из таблицы
    const mediaRecords = await prisma.projectMedia.findMany({
      take: 5,
      select: {
        id: true,
        projectId: true,
        type: true,
        url: true,
        title: true,
        category: true,
        isCover: true,
        isMainVideo: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    console.log(`📊 Найдено ${mediaRecords.length} записей:`);

    // Выводим информацию о каждой записи
    mediaRecords.forEach((record, index) => {
      console.log(`\n--- Запись ${index + 1} ---`);
      console.log(`ID: ${record.id}`);
      console.log(`ProjectID: ${record.projectId}`);
      console.log(`Type: ${record.type}`);
      console.log(`URL: ${record.url}`);
      console.log(`Title: ${record.title}`);
      console.log(`Category: ${record.category}`);
      console.log(`isCover: ${record.isCover}`);
      console.log(`isMainVideo: ${record.isMainVideo}`);
      console.log(`CreatedAt: ${record.createdAt}`);
      console.log(`UpdatedAt: ${record.updatedAt}`);
    });

    // Получаем общее количество записей
    const totalCount = await prisma.projectMedia.count();
    console.log(
      `\n📈 Общее количество записей в таблице ProjectMedia: ${totalCount}`
    );
  } catch (error) {
    console.error(
      "❌ Ошибка при получении информации о таблице ProjectMedia:",
      error
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск функции
checkProjectMedia()
  .then(() => console.log("✅ Проверка таблицы ProjectMedia завершена"))
  .catch(e => {
    console.error("❌ Ошибка в процессе выполнения:", e);
    process.exit(1);
  });
