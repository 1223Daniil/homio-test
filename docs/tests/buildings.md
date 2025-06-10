# Тесты API зданий

## Тестовые файлы

- `__tests__/api/buildings/create.test.ts` - тесты создания здания
- `__tests__/api/buildings/update.test.ts` - тесты обновления здания

## Тестовые данные

### Общие данные

```typescript
const projectId = "test-project-id";
const buildingId = "test-building-id";

const validBuildingData = {
  name: "Test Building",
  description: "Test Description",
  floors: 5,
  status: "IN_PROGRESS",
  completionDate: "2024-12-31",
};

const validUpdateData = {
  name: "Updated Building",
  description: "Updated Description",
  floors: 6,
  status: "COMPLETED",
  completionDate: "2025-01-01",
};
```

## Тесты создания здания (create.test.ts)

### Настройка моков

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  (getServerSession as jest.Mock).mockResolvedValue({
    user: { id: "test-user-id" },
  });
});
```

### Тестовые случаи

1. **Успешное создание здания**

```typescript
test("should create building with valid data", async () => {
  const response = await POST(createApiRequest("POST", validBuildingData));
  expect(response.status).toBe(201);
});
```

2. **Валидация обязательных полей**

```typescript
test("should validate required fields", async () => {
  const response = await POST(createApiRequest("POST", { name: "Test" }));
  expect(response.status).toBe(400);
});
```

3. **Проверка связи с проектом**

```typescript
test("should validate project exists", async () => {
  (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(null);
  const response = await POST(createApiRequest("POST", validBuildingData));
  expect(response.status).toBe(404);
});
```

## Тесты обновления здания (update.test.ts)

### Настройка моков

```typescript
beforeEach(() => {
  (prisma.building.findUnique as jest.Mock).mockResolvedValueOnce({
    id: buildingId,
    projectId,
    ...validBuildingData,
  });
});
```

### Тестовые случаи

1. **Успешное обновление**

```typescript
test("should update building with valid data", async () => {
  const response = await PATCH(createApiRequest("PATCH", validUpdateData));
  expect(response.status).toBe(200);
});
```

2. **Проверка существования здания**

```typescript
test("should return 404 if building not found", async () => {
  (prisma.building.findUnique as jest.Mock).mockResolvedValueOnce(null);
  const response = await PATCH(createApiRequest("PATCH", validUpdateData));
  expect(response.status).toBe(404);
});
```

3. **Валидация связи с проектом**

```typescript
test("should validate project association", async () => {
  (prisma.building.findUnique as jest.Mock).mockResolvedValueOnce({
    ...validBuildingData,
    projectId: "different-project-id",
  });
  const response = await PATCH(createApiRequest("PATCH", validUpdateData));
  expect(response.status).toBe(400);
});
```

## Формат ответов API

### Успешный ответ

```json
{
  "data": {
    "id": "test-building-id",
    "name": "Test Building",
    "description": "Test Description",
    "floors": 5,
    "status": "IN_PROGRESS",
    "completionDate": "2024-12-31",
    "projectId": "test-project-id",
    "createdAt": "2023-12-20T12:00:00.000Z",
    "updatedAt": "2023-12-20T12:00:00.000Z"
  }
}
```

### Ответ с ошибкой

```json
{
  "error": "Building not found",
  "status": 404
}
```

## Отладка тестов

### Логирование запросов

```typescript
console.log("Request body:", {
  ...validBuildingData,
  projectId,
});
```

### Логирование ответов Prisma

```typescript
console.log("Prisma response:", {
  findUnique: await prisma.building.findUnique(),
  update: await prisma.building.update(),
});
```

## Рекомендации

1. Всегда проверять статус ответа и формат данных
2. Использовать типизированные данные для запросов
3. Добавлять проверки граничных случаев
4. Мокировать все внешние зависимости
5. Группировать связанные тесты
6. Добавлять подробное логирование для отладки
