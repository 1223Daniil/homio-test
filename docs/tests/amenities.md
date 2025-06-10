# Тесты API удобств (amenities)

## Тестовые файлы

- `__tests__/api/amenities/create.test.ts` - тесты создания удобства
- `__tests__/api/amenities/update.test.ts` - тесты обновления удобства

## Тестовые данные

### Общие данные

```typescript
const mockAmenity = {
  id: "test-amenity-id",
  name: "Test Amenity",
  description: "Test Description",
  createdAt: new Date(),
  updatedAt: new Date()
};

const validAmenityData = {
  name: "Test Amenity",
  description: "Test Description"
};
```

## Тесты создания удобства (create.test.ts)

### Настройка моков

```typescript
beforeAll(() => {
  // Мокаем сессию пользователя
  (getServerSession as jest.Mock).mockResolvedValue({
    user: {
      email: "admin@homio.com",
      name: "Admin User",
      id: "test-user-id"
    }
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});
```

### Тестовые случаи

1. **Успешное создание удобства**

```typescript
test("creates a new amenity with valid data", async () => {
  const response = await POST(createApiRequest("POST", validAmenityData));
  expect(response.status).toBe(200);
});
```

2. **Валидация обязательных полей**

```typescript
test("validates required fields", async () => {
  const response = await POST(createApiRequest("POST", { name: "" }));
  expect(response.status).toBe(400);
});
```

3. **Проверка уникальности имени**

```typescript
test("checks for duplicate names", async () => {
  (prisma.amenity.findUnique as jest.Mock).mockResolvedValue(mockAmenity);
  const response = await POST(createApiRequest("POST", validAmenityData));
  expect(response.status).toBe(400);
});
```

## Формат ответов API

### Успешный ответ

```json
{
  "id": "test-amenity-id",
  "name": "Test Amenity",
  "description": "Test Description",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Ответ с ошибкой

```json
{
  "error": "Invalid data",
  "details": {
    "issues": [
      {
        "code": "too_small",
        "minimum": 1,
        "type": "string",
        "message": "Name is required",
        "path": ["name"]
      }
    ]
  }
}
```

## Отладка тестов

### Логирование запросов

```typescript
console.log("Request body:", validAmenityData);
```

### Логирование ответов Prisma

```typescript
console.log("Prisma response:", {
  findUnique: await prisma.amenity.findUnique(),
  create: await prisma.amenity.create()
});
```

## Рекомендации

1. Всегда проверять статус ответа и формат данных
2. Использовать типизированные данные для запросов
3. Добавлять проверки граничных случаев:
   - Пустые значения
   - Дублирующиеся имена
   - Некорректный JSON
   - Отсутствие авторизации
4. Мокировать все внешние зависимости
5. Группировать связанные тесты
6. Добавлять подробное логирование для отладки

## Особенности тестирования

1. **Валидация данных**

   - Проверка обязательных полей
   - Проверка минимальной длины имени
   - Проверка уникальности имени

2. **Авторизация**

   - Проверка наличия сессии
   - Проверка прав доступа
   - Обработка неавторизованных запросов

3. **Обработка ошибок**
   - Валидационные ошибки
   - Ошибки базы данных
   - Ошибки авторизации
   - Некорректные запросы

## Структура тестового файла

```typescript
describe("POST /api/amenities", () => {
  // Моки и подготовка
  beforeAll(() => {
    // Настройка моков
  });

  beforeEach(() => {
    // Очистка моков
  });

  // Тесты успешных сценариев
  it("creates a new amenity with valid data", async () => {
    // Тест создания
  });

  // Тесты обработки ошибок
  it("handles validation errors", async () => {
    // Тест валидации
  });

  it("handles database errors", async () => {
    // Тест ошибок БД
  });
});
```
