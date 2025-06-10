import { PrismaClient } from "@prisma/client";

// Инициализация клиента Prisma с использованием переменных окружения из .env
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("📋 Получаем список существующих проектов...");

    // Получаем список всех проектов с их основными данными
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        type: true,
        class: true,
        buildingStatus: true,
        constructionStatus: true,
        translations: {
          select: {
            language: true,
            name: true
          }
        },
        developer: {
          select: {
            id: true,
            translations: {
              select: {
                language: true,
                name: true
              }
            }
          }
        }
      },
      take: 10 // Ограничиваем до 10 проектов для начала
    });

    console.log("📊 Найдено проектов:", projects.length);

    // Выводим информацию о каждом проекте
    projects.forEach((project, index) => {
      console.log(`\n--- Проект ${index + 1} ---`);
      console.log(`ID: ${project.id}`);
      console.log(`Название: ${project.name}`);
      console.log(`Статус: ${project.status}`);
      console.log(`Тип: ${project.type}`);
      console.log(`Класс: ${project.class}`);
      console.log(`Статус строительства: ${project.buildingStatus}`);
      console.log(
        `Процент строительства: ${project.constructionStatus || "Не указан"}`
      );

      if (project.translations && project.translations.length > 0) {
        console.log("Переводы:");
        project.translations.forEach(translation => {
          console.log(`  - ${translation.language}: ${translation.name}`);
        });
      }

      if (project.developer) {
        console.log("Застройщик:");
        console.log(`  ID: ${project.developer.id}`);

        if (
          project.developer.translations &&
          project.developer.translations.length > 0
        ) {
          project.developer.translations.forEach(translation => {
            console.log(`  - ${translation.language}: ${translation.name}`);
          });
        }
      }
    });

    // Также получаем общее количество проектов
    const totalCount = await prisma.project.count();
    console.log(`\n📈 Общее количество проектов в базе данных: ${totalCount}`);
  } catch (error) {
    console.error("❌ Ошибка при получении списка проектов:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск функции
main()
  .then(() => console.log("✅ Список проектов успешно получен"))
  .catch(e => {
    console.error("❌ Ошибка в процессе выполнения:", e);
    process.exit(1);
  });
