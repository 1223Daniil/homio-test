import {
  BuildingStatus,
  PrismaClient,
  ProjectClass,
  ProjectStatus,
  ProjectType
} from "@prisma/client";

// Инициализация клиента Prisma с использованием переменных окружения из .env
const prisma = new PrismaClient();

// Список проектов для обновления в формате массива объектов
// Каждый объект содержит ID проекта и данные для обновления
const projectUpdates = [
  {
    id: "18796fe3-6a00-44c3-bef3-aa8c85ddc508", // Adora Rawai
    data: {
      status: "ACTIVE" as ProjectStatus,
      buildingStatus: "UNDER_CONSTRUCTION" as BuildingStatus,
      constructionStatus: 30,
      translations: [
        {
          language: "en",
          name: "Adora Rawai",
          description:
            "Luxury residence in the beautiful area of Rawai, Phuket."
        },
        {
          language: "ru",
          name: "Адора Раваи",
          description: "Роскошная резиденция в прекрасном районе Раваи, Пхукет."
        }
      ]
    }
  },
  {
    id: "380034a6-c26b-42bc-9ed1-46388fd94d03", // The ONE Naiharn
    data: {
      status: "ACTIVE" as ProjectStatus,
      constructionStatus: 85, // Увеличиваем процент готовности
      translations: [
        {
          language: "en",
          name: "The ONE Naiharn",
          description:
            "Premium condominium project near Naiharn beach with stunning sea views."
        },
        {
          language: "ru",
          name: "Зе Ван Найхарн",
          description:
            "Премиальный кондоминиум рядом с пляжем Найхарн с потрясающим видом на море."
        }
      ]
    }
  },
  {
    id: "3db9cebe-9e35-4216-aa7a-4def47301ea8", // VIP Space Odyssey Condominium
    data: {
      status: "ACTIVE" as ProjectStatus,
      class: "PREMIUM" as ProjectClass, // Повышаем класс проекта
      buildingStatus: "UNDER_CONSTRUCTION" as BuildingStatus,
      constructionStatus: 25,
      translations: [
        {
          language: "en",
          name: "VIP Space Odyssey Condominium",
          description:
            "Modern condominium with futuristic design and premium facilities."
        },
        {
          language: "ru",
          name: "ВИП Спейс Одиссей Кондоминиум",
          description:
            "Современный кондоминиум с футуристическим дизайном и премиальными удобствами."
        }
      ]
    }
  }
];

async function updateProject(projectId: string, projectData: any) {
  try {
    // Базовые данные проекта (без вложенных объектов)
    const baseData = { ...projectData };
    delete baseData.translations;

    // Обновляем базовые данные проекта
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: baseData
    });

    // Если есть переводы, обновляем их отдельно
    if (projectData.translations && projectData.translations.length > 0) {
      for (const translation of projectData.translations) {
        // Проверяем существует ли перевод
        const existingTranslation = await prisma.projectTranslation.findFirst({
          where: {
            projectId,
            language: translation.language
          }
        });

        if (existingTranslation) {
          // Обновляем существующий перевод
          await prisma.projectTranslation.update({
            where: {
              id: existingTranslation.id
            },
            data: {
              name: translation.name,
              description: translation.description
            }
          });
        } else {
          // Создаем новый перевод
          await prisma.projectTranslation.create({
            data: {
              projectId,
              language: translation.language,
              name: translation.name,
              description: translation.description
            }
          });
        }
      }
    }

    return updatedProject;
  } catch (error) {
    console.error(`❌ Ошибка при обновлении проекта ${projectId}:`, error);
    throw error;
  }
}

async function main() {
  try {
    console.log("🔄 Начинаем пакетное обновление проектов...");

    // Обрабатываем каждый проект в списке
    for (const projectUpdate of projectUpdates) {
      console.log(`🔄 Обновляем проект ${projectUpdate.id}...`);
      const updatedProject = await updateProject(
        projectUpdate.id,
        projectUpdate.data
      );
      console.log(`✅ Проект ${updatedProject.id} успешно обновлен`);
    }
  } catch (error) {
    console.error("❌ Ошибка при пакетном обновлении проектов:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск функции
main()
  .then(() => console.log("🎉 Пакетное обновление проектов завершено успешно"))
  .catch(e => {
    console.error("❌ Ошибка в процессе выполнения:", e);
    process.exit(1);
  });
