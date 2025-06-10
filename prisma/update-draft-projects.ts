import { PrismaClient, ProjectStatus } from "@prisma/client";

// Инициализация клиента Prisma
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🔄 Начинаем обновление проектов со статусом DRAFT...");

    // Получаем список проектов со статусом DRAFT
    const draftProjects = await prisma.project.findMany({
      where: {
        status: "DRAFT"
      },
      select: {
        id: true,
        name: true,
        translations: {
          select: {
            language: true,
            name: true
          }
        }
      }
    });

    console.log(
      `📊 Найдено ${draftProjects.length} проектов со статусом DRAFT`
    );

    // Выводим список проектов
    draftProjects.forEach((project, index) => {
      const projectName =
        project.name ||
        (project.translations?.length > 0
          ? project.translations[0].name
          : "Без названия");
      console.log(`${index + 1}. ID: ${project.id}, Название: ${projectName}`);
    });

    // Подтверждение обновления
    console.log(
      "\n⚠️ Все эти проекты будут обновлены со статуса DRAFT на ACTIVE"
    );

    // Обновляем статус всех проектов с DRAFT на ACTIVE
    const updatedProjects = await prisma.project.updateMany({
      where: {
        status: "DRAFT"
      },
      data: {
        status: "ACTIVE" as ProjectStatus
      }
    });

    console.log(
      `✅ Обновлено ${updatedProjects.count} проектов со статуса DRAFT на ACTIVE`
    );
  } catch (error) {
    console.error("❌ Ошибка при обновлении проектов:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск функции
main()
  .then(() => console.log("🎉 Обновление проектов завершено успешно"))
  .catch(e => {
    console.error("❌ Ошибка в процессе выполнения:", e);
    process.exit(1);
  });
