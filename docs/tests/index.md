# Структура тестов

## Общая информация

Тесты в проекте организованы по следующим категориям:

1. [Проекты](./projects.md)

   - Создание проекта
   - Обновление проекта
   - Валидация данных
   - Обработка ошибок

2. [Здания](./buildings.md)

   - Создание здания
   - Обновление здания
   - Валидация данных
   - Обработка ошибок

3. [Юниты](./units.md)
   - Обновление юнита
   - Валидация данных
   - Проверка связей с проектом
   - Обработка ошибок

## Структура тестового файла

Каждый тестовый файл следует общей структуре:

```typescript
import { ... } from '...';

// Моки внешних зависимостей
jest.mock('...', () => ({
  // Определение моков
}));

// Тестовые данные
const mockData = {
  // Тестовые объекты
};

describe('API Endpoint', () => {
  beforeEach(() => {
    // Подготовка тестового окружения
  });

  it('test case description', async () => {
    // Тестовый сценарий
  });
});
```

## Моки и вспомогательные функции

### Prisma

```typescript
jest.mock("@/lib/prisma", () => ({
  prisma: {
    // Моки методов Prisma
  },
}));
```

### Next Auth

```typescript
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));
```

## Валидация данных

Все тесты включают проверку:

- Обязательных полей
- Форматов данных
- Бизнес-правил
- Обработки ошибок

## Структура папок

```
__tests__/
  api/
    projects/
      create.test.ts
      update.test.ts
    buildings/
      create.test.ts
      update.test.ts
    units/
      update.test.ts
```

## Документация

Каждый набор тестов имеет свою документацию в папке `docs/tests/`:

- [projects.md](./projects.md)
- [buildings.md](./buildings.md)
- [units.md](./units.md)

## Запуск тестов

```bash
# Запуск всех тестов
npm test

# Запуск конкретного теста
npm test -- __tests__/api/projects/create.test.ts

# Запуск тестов с watch режимом
npm test -- --watch
```
