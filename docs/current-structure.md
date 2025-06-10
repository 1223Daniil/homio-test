# Текущая структура проекта Next Homio

## Основные технологии

- Next.js 15 с App Router
- TypeScript для типизации
- Prisma ORM + PostgreSQL
- HeroUI
- next-intl для интернационализации
- Docker для разработки

## Структура директорий

```
/src
  /app                      # Next.js App Router
    /[locale]              # Интернационализированные маршруты
      /dashboard           # Дашборд
      /projects           # Управление проектами
      /courses            # Управление курсами
    /api                  # API маршруты
      /projects          # API проектов
      /courses           # API курсов
  /components            # React компоненты
    /ui                 # Базовые UI компоненты
    /features          # Компоненты функционала
  /lib                 # Core utilities
  /hooks              # Custom hooks
  /store             # Redux store
  /types             # TypeScript types
```

## Безопасность и обработка данных

### API безопасность

1. **Валидация входных данных**
   ```typescript
   // Пример валидации в API
   try {
     const data = await request.json();
     if (!data.title) {
       return NextResponse.json(
         { error: "Title is required" },
         { status: 400 }
       );
     }
   } catch (error) {
     return NextResponse.json(
       { error: "Invalid request data" },
       { status: 400 }
     );
   }
```

2. **Обработка ошибок**
   - Логирование ошибок с контекстом
   - Безопасные сообщения об ошибках для клиента
   - Использование HTTP статусов
   ```typescript
   catch (error) {
     console.error("Operation failed:", {
       error,
       context: "operation_name",
       userId: session?.user?.id
     });
     return NextResponse.json(
       { error: "Operation failed" },
       { status: 500 }
     );
   }
   ```

### Работа с данными

1. **Prisma транзакции**

   ```typescript
   // Пример транзакции
   const result = await prisma.$transaction(async (tx) => {
     // Операции с базой данных
     const course = await tx.course.create({...});
     await tx.module.createMany({...});
     return course;
   });
   ```

2. **Кэширование**
   - Использование next/cache
   - Revalidation стратегии
   ```typescript
   export const revalidate = 3600; // Revalidate every hour
   ```

## Лучшие практики

### Компоненты

1. **Разделение ответственности**

   ```typescript
   // Пример компонента с хуком для логики
   function useCourseData(courseId: string) {
     // Логика получения данных
   }

   export function CourseView({ courseId }: Props) {
     const { data, loading, error } = useCourseData(courseId);
     // Рендеринг UI
   }
   ```

2. **Обработка состояний**
   ```typescript
   // Пример обработки состояний
   {loading && <LoadingSpinner />}
   {error && <ErrorMessage error={error} />}
   {!loading && !error && data && <Content data={data} />}
   ```

### Переводы

1. **Структура ключей**

   ```typescript
   // Модуль.Сущность.Действие
   t("courses.lesson.create");
   ```

2. **Переиспользование**
   ```typescript
   // Общие ключи в common
   t("common.actions.save");
   t("common.status.active");
   ```

### Типизация

1. **Базовые интерфейсы**

   ```typescript
   interface BaseEntity {
     id: string;
     createdAt: Date;
     updatedAt: Date;
   }

   interface Course extends BaseEntity {
     title: string;
     // ...
   }
   ```

2. **Типы ответов API**
   ```typescript
   interface ApiResponse<T> {
     data?: T;
     error?: string;
     status: "success" | "error";
   }
   ```

## Тестирование

### Unit тесты

```typescript
describe("CoursesList", () => {
  it("renders courses correctly", () => {
    // Тест рендеринга
  });

  it("handles empty state", () => {
    // Тест пустого состояния
  });
});
```

### API тесты

```typescript
describe("/api/courses", () => {
  it("creates course successfully", async () => {
    // Тест создания курса
  });

  it("handles validation errors", async () => {
    // Тест валидации
  });
});
```

## Мониторинг и логирование

1. **Структура логов**

   ```typescript
   console.error("Operation failed:", {
     error,
     context: {
       module: "courses",
       action: "create",
       userId: session?.user?.id,
       params: {
         /* cleaned params */
       }
     }
   });
   ```

2. **Метрики**
   - Время ответа API
   - Количество запросов
   - Ошибки и их типы

## Процесс разработки

1. **Создание нового функционала**

   - Определить требования
   - Создать типы и интерфейсы
   - Реализовать API
   - Создать компоненты
   - Добавить тесты
   - Обновить документацию

2. **Code Review чеклист**

   - Типизация
   - Обработка ошибок
   - Тесты
   - Переводы
   - Документация
   - Производительность

3. **Релизный процесс**
   - Проверка миграций
   - Тестирование
   - Бэкап данных
   - Деплой
   - Мониторинг

## Точки расширения

1. **Новые модули**

   - Создать директорию в `/src/components/[module]`
   - Добавить типы в `/src/types/[module].ts`
   - Добавить API маршруты в `/src/app/api/[module]`
   - Добавить переводы в `/src/locales/[lang].json`

2. **Новые пункты меню**

   - Добавить в массив `menuItems` в `Sidebar.tsx`
   - Добавить иконку из `@tabler/icons-react`
   - Добавить перевод для названия

3. **Новые страницы**
   - Создать в `/src/app/[locale]/[module]`
   - Использовать `DashboardLayout`
   - Добавить компоненты в `/src/components`

## Seed Structure

### Overview

The project uses a modular seeding system with separate files for different entities:

- seed.ts - Main seeder that orchestrates the seeding process
- seed-courses.ts - Generates educational content
- seed-projects.ts - Generates real estate projects and units

### Seed Files Description

1. seed.ts

- Creates initial roles (ADMIN, DEVELOPER, AGENT, CLIENT)
- Seeds base users for each role
- Handles relationships between entities
- Ensures data consistency

2. seed-courses.ts

- Generates 12 courses with realistic educational content
- Each course has 10 modules
- Each module contains 10 lessons and tests
- Includes gamification elements (achievements, progress tracking)

3. seed-projects.ts

- Creates 100 real estate projects
- Generates multiple units per project
- Includes location data and pricing information
- Handles translations for multilingual support

### Seeding Order

1. Base roles and permissions
2. User accounts
3. Educational content (courses, modules, lessons)
4. Real estate projects and units

## Test Coverage Plan

### Core Components

1. Authentication System

- Login/logout flow
- Session management
- Role-based access control
- Password hashing and security

2. Course Management
   Tests:

- Course creation and updates
- Module and lesson sequencing
- Progress tracking
- Test completion and scoring
- Gamification features

3. Project Management
   Tests:

- Project CRUD operations
- Unit management
- Location services
- Pricing calculations
- Translation system

4. API Endpoints
   Tests:

- Authentication endpoints
- Course endpoints
- Project endpoints
- Error handling
- Rate limiting

### Test Types

1. Unit Tests

- Individual component logic
- Utility functions
- Data transformations
- Form validation

2. Integration Tests

- API endpoint flows
- Database operations
- Authentication flows
- File uploads

3. E2E Tests

- User journeys
- Course completion flow
- Project creation flow
- Search and filtering

### Test Priority Matrix

High Priority:

- Authentication flows
- Course creation and management
- Project creation and updates
- Data consistency checks

Medium Priority:

- Search functionality
- Filtering and sorting
- User preferences
- Notifications

Low Priority:

- UI animations
- Optional features
- Edge cases
- Performance optimization

### Testing Tools

- Jest for unit testing
- Cypress for E2E testing
- Supertest for API testing
- MSW for API mocking
