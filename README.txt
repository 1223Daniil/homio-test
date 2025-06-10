Homio Next.js Project - Восстановление проекта

1. СТРУКТУРА ПРОЕКТА
project_root/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   ├── utils/
│   └──locales/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── scripts/
│   ├── init-db.mjs
│   ├── check-db.mjs
│   └── check-db-status.mjs
└── docker/
    └── init-scripts/

2. НЕОБХОДИМЫЕ ФАЙЛЫ ДЛЯ ВОССТАНОВЛЕНИЯ

Конфигурационные файлы:
- .env
- next.config.mjs
- package.json
- tsconfig.json
- docker-compose.yml
- .gitignore
- postcss.config.js
- tailwind.config.js

Скрипты инициализации:
- scripts/init-db.mjs
- scripts/check-db.mjs
- scripts/check-db-status.mjs
- init-scripts/01-init.sql

Prisma файлы:
- prisma/schema.prisma
- prisma/seed.ts
- prisma/constants.ts

3. ПОСЛЕДОВАТЕЛЬНОСТЬ ВОССТАНОВЛЕНИЯ

1) Клонировать репозиторий:
git clone <repository_url>
cd homio_next

2) Установить зависимости:
npm install

3) Создать .env файл со следующим содержимым:
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/homio_db?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_AUTH=true
NEXT_PUBLIC_TEST_DEVELOPER_ID="cm3m96jfs0000sm7n9c2sv2q2"
NODE_ENV=development

4) Запустить Docker и инициализировать базу данных:
npm run docker:up
npm run db:init
npm run db:status

5) Применить миграции и заполнить данными:
npx prisma migrate dev --name init
npm run db:seed

6) Запустить приложение:
npm run dev

4. ПОЛЕЗНЫЕ КОМАНДЫ

База данных:
npm run db:clean         - Полный сброс базы
npm run docker:logs      - Просмотр логов базы
npm run prisma:studio    - Открыть Prisma Studio

Разработка:
npm run dev             - Запуск в режиме разработки
npm run build          - Сборка
npm run test           - Запуск тестов
npm run format         - Форматирование кода

5. ВАЖНЫЕ ЗАМЕТКИ

- Docker должен быть установлен и запущен
- Порт 5433 должен быть свободен для PostgreSQL
- Требуется Node.js версии 18+
- При проблемах с миграциями использовать db:clean
- Все переменные окружения должны быть заполнены
- Перед запуском убедиться, что все контейнеры остановлены

6. СТРУКТУРА БАЗЫ ДАННЫХ

Основные таблицы:
- Developer (Разработчики)
- Project (Проекты)
- DeveloperTranslation (Переводы для разработчиков)
- ProjectTranslation (Переводы для проектов)

7. КОМАНДЫ ДЛЯ ОТЛАДКИ

Проверка статуса базы:
npm run db:status

Просмотр логов Docker:
npm run docker:logs

Проверка подключения к базе:
npm run db:check

8. ВОССТАНОВЛЕНИЕ ПОСЛЕ СБОЕВ

1) Остановить все процессы:
npm run docker:down

2) Очистить Docker:
docker system prune -af --volumes

3) Удалить node_modules:
rm -rf node_modules .next

4) Переустановить проект:
npm install
npm run db:clean
npm run dev

9. ОПИСАНИЕ СИСТЕМЫ

Назначение:
- Система управления недвижимостью (Real Estate Management System)
- Многоязычная платформа для девелоперов и их проектов
- Управление проектами недвижимости с детальной информацией

Основные функции:
- Управление девелоперами и их проектами
- Многоязычный контент (поддержка EN/RU)
- Детальная информация о проектах недвижимости
- Управление медиа-контентом проектов
- API для взаимодействия с фронтендом

10. ПРАВИЛА РАЗРАБОТКИ

Архитектурные принципы:
- App Router (Next.js 13+)
- Server Components по умолчанию
- API Routes для бэкенд функционала
- Prisma как ORM для работы с базой данных
- NextUI для компонентов интерфейса

Структура компонентов:
- Компоненты размещаются в src/components/
- Группировка по функциональности (projects/, developers/, layout/)
- Каждый компонент в отдельной директории с index.tsx

Правила именования:
- PascalCase для компонентов: ProjectCard.tsx
- camelCase для утилит: formatDate.ts
- kebab-case для CSS файлов: project-card.css
- UPPER_CASE для констант: PROJECT_TYPES

Типизация:
- Строгая типизация TypeScript
- Интерфейсы для props компонентов
- Zod для валидации данных
- Типы Prisma для моделей базы данных

Локализация:
- next-intl для интернационализации
- Ключи переводов в src/locales/
- Поддержка EN/RU локалей
- Динамическая загрузка переводов

API Endpoints:
- RESTful API в src/app/api/
- Группировка по ресурсам (projects/, developers/)
- Валидация входящих данных
- Обработка ошибок и статус-коды

Работа с данными:
- Prisma Client для запросов к БД
- Кэширование на уровне API
- Оптимистичные обновления UI
- Обработка состояний загрузки и ошибок

Стилистика кода:
- ESLint + Prettier для форматирования
- Husky для pre-commit хуков
- Комментарии на русском для внутренней логики
- JSDoc для публичных функций

Безопасность:
- NextAuth.js для аутентификации
- Валидация всех входящих данных
- Защита API endpoints
- Безопасное хранение секретов

11. КОНФИГУРАЦИЯ ОКРУЖЕНИЯ

Development:
- NODE_ENV=development
- Отладочные логи включены
- Горячая перезагрузка
- Prisma Studio доступен

Production:
- NODE_ENV=production
- Оптимизированная сборка
- Минимизация бандла
- Кэширование запросов

Testing:
- Jest для unit-тестов
- Cypress для E2E
- Моки для API и базы данных
- Тестовое окружение изолировано

12. РАБОТА С БАЗОЙ ДАННЫХ

Миграции:
- Создание: npx prisma migrate dev
- Применение: npx prisma migrate deploy
- Откат: через новую миграцию
- Сброс: npm run db:clean

Сидирование:
- Тестовые данные в prisma/seed.ts
- Запуск: npm run db:seed
- Очистка: через db:clean
- Локализованные данные

13. МОНИТОРИНГ И ОТЛАДКА

Логирование:
- Консоль для development
- Структурированные логи в production
- Отслеживание ошибок API
- Мониторинг состояния БД

Отладка:
- Chrome DevTools для фронтенда
- Prisma Studio для БД
- Docker logs для контейнеров
- NextJS встроенные инструменты

14. ПРОИЗВОДИТЕЛЬНОСТЬ

Оптимизации:
- Server Components где возможно
- Кэширование запросов
- Ленивая загрузка компонентов
- Оптимизация изображений через Next.js

Метрики:
- Время загрузки страниц
- Размер бандла
- Время ответа API
- Нагрузка на БД