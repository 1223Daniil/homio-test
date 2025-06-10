import {
  BuildingStatus,
  PrismaClient,
  ProjectClass,
  ProjectStatus,
  ProjectType
} from "@prisma/client";

// Инициализация клиента Prisma с использованием переменных окружения из .env
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🔄 Начинаем обновление данных проектов...");

    // Пример обновления всех проектов со статусом DRAFT на ACTIVE
    const updatedProjects = await prisma.project.updateMany({
      where: {
        status: "DRAFT"
      },
      data: {
        status: "ACTIVE"
      }
    });

    console.log(
      `✅ Обновлено ${updatedProjects.count} проектов со статуса DRAFT на ACTIVE`
    );

    // Пример обновления конкретного проекта по ID
    const projectId = "YOUR_PROJECT_ID"; // Замените на реальный ID проекта
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId
      },
      data: {
        name: "Обновленное название проекта",
        description: "Новое описание проекта",
        status: "ACTIVE",
        buildingStatus: "UNDER_CONSTRUCTION",
        constructionStatus: 50, // 50% готовность
        class: "PREMIUM"
      }
    });

    console.log(`✅ Проект ${updatedProject.id} успешно обновлен`);

    // Пример обновления проектов с определенными критериями
    const updatedPremiumProjects = await prisma.project.updateMany({
      where: {
        class: "STANDARD",
        type: "RESIDENTIAL"
      },
      data: {
        class: "COMFORT"
      }
    });

    console.log(
      `✅ Обновлено ${updatedPremiumProjects.count} жилых проектов с класса STANDARD на COMFORT`
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
