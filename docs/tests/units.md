# Тестирование API юнитов

## Обновление юнита (PUT /api/projects/[id]/units/[unitId])

### Описание

Тесты проверяют функциональность обновления информации о юните через API. Тесты охватывают различные сценарии, включая успешное обновление, обработку ошибок и валидацию данных.

### Тестовые сценарии

#### 1. Успешное обновление юнита

- **Описание**: Проверяет успешное обновление юнита с валидными данными
- **Ожидаемый результат**:
  - Статус 200
  - Обновленные данные юнита
  - Корректные даты создания и обновления
  - Правильные связи с проектом и зданием

#### 2. Юнит не найден

- **Описание**: Проверяет обработку запроса на обновление несуществующего юнита
- **Ожидаемый результат**:
  - Статус 404
  - Сообщение об ошибке "Unit not found"

#### 3. Валидация обязательных полей

- **Описание**: Проверяет валидацию данных при обновлении юнита
- **Тестовые случаи**:
  - Отрицательное количество спален
  - Отсутствующие обязательные поля
- **Ожидаемый результат**:
  - Статус 400
  - Сообщение о валидационной ошибке

#### 4. Проверка принадлежности к проекту

- **Описание**: Проверяет, что юнит принадлежит указанному проекту
- **Ожидаемый результат**:
  - Статус 400
  - Сообщение об ошибке при попытке обновить юнит из другого проекта

### Моки и вспомогательные данные

#### Мок юнита

```typescript
const mockUnit = {
  id: "test-unit-id",
  projectId: "test-project-id",
  buildingId: "test-building-id",
  number: "101",
  floor: 1,
  bedrooms: 2,
  bathrooms: 1,
  size: 75,
  price: 150000,
  status: "AVAILABLE",
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

#### Мок проекта

```typescript
{
  id: 'test-project-id',
  name: 'Test Project',
  description: 'Test Description',
  type: 'RESIDENTIAL',
  status: 'DRAFT',
  completionDate: new Date(),
  developerId: 'test-developer-id',
  createdAt: new Date(),
  updatedAt: new Date(),
}
```

### Моки внешних зависимостей

```typescript
jest.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
    },
    unit: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("next-auth");
```

### Структура теста

```typescript
describe("PUT /api/projects/[id]/units/[unitId]", () => {
  beforeEach(() => {
    // Очистка моков
    jest.clearAllMocks();
    // Мок сессии пользователя
    (getServerSession as jest.Mock).mockResolvedValue({
      user: {
        email: "test@example.com",
        name: "Test User",
        id: "test-user-id",
      },
    });
  });

  it("updates unit with valid data", async () => {
    // Тест успешного обновления
  });

  it("returns 404 if unit not found", async () => {
    // Тест отсутствующего юнита
  });

  it("validates required fields", async () => {
    // Тест валидации полей
  });

  it("validates project association", async () => {
    // Тест принадлежности к проекту
  });
});
```
