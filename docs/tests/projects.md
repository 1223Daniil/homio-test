# Тесты API проектов

## Тестовые файлы

- `__tests__/api/projects/create.test.ts` - тесты создания проекта
- `__tests__/api/projects/update.test.ts` - тесты обновления проекта

## Тестовые данные

### Общие данные

```typescript
const projectId = "test-project-id";
const developerId = "test-developer-id";

const validProjectData = {
  name: "Test Project",
  description: "Test Project Description",
  status: "IN_PROGRESS",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  developerId: "test-developer-id",
};

const validUpdateData = {
  name: "Updated Project",
  description: "Updated Description",
  status: "COMPLETED",
  startDate: "2024-02-01",
  endDate: "2025-01-31",
};
```

## Тесты создания проекта (create.test.ts)

### Настройка моков

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  (getServerSession as jest.Mock).mockResolvedValue({
    user: { id: "test-user-id" },
  });
  (prisma.developer.findUnique as jest.Mock).mockResolvedValueOnce({
    id: developerId,
    name: "Test Developer",
  });
});
```

### Тестовые случаи

1. **Успешное создание проекта**

```typescript
test("should create project with valid data", async () => {
  const response = await POST(createApiRequest("POST", validProjectData));
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

3. **Проверка существования застройщика**

```typescript
test("should validate developer exists", async () => {
  (prisma.developer.findUnique as jest.Mock).mockResolvedValueOnce(null);
  const response = await POST(createApiRequest("POST", validProjectData));
  expect(response.status).toBe(404);
});
```

## Тесты обновления проекта (update.test.ts)

### Настройка моков

```typescript
beforeEach(() => {
  (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce({
    id: projectId,
    developerId,
    ...validProjectData,
  });
});
```

### Тестовые случаи

1. **Успешное обновление**

```typescript
test("should update project with valid data", async () => {
  const response = await PATCH(createApiRequest("PATCH", validUpdateData));
  expect(response.status).toBe(200);
});
```

2. **Проверка существования проекта**

```typescript
test("should return 404 if project not found", async () => {
  (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(null);
  const response = await PATCH(createApiRequest("PATCH", validUpdateData));
  expect(response.status).toBe(404);
});
```

3. **Валидация прав доступа**

```typescript
test("should validate user permissions", async () => {
  (getServerSession as jest.Mock).mockResolvedValueOnce({
    user: { id: "different-user-id" },
  });
  const response = await PATCH(createApiRequest("PATCH", validUpdateData));
  expect(response.status).toBe(403);
});
```

## Формат ответов API

### Успешный ответ

```json
{
  "data": {
    "id": "test-project-id",
    "name": "Test Project",
    "description": "Test Project Description",
    "status": "IN_PROGRESS",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "developerId": "test-developer-id",
    "createdAt": "2023-12-20T12:00:00.000Z",
    "updatedAt": "2023-12-20T12:00:00.000Z"
  }
}
```

### Ответ с ошибкой

```json
{
  "error": "Project not found",
  "status": 404
}
```

## Отладка тестов

### Логирование запросов

```typescript
console.log("Request body:", {
  ...validProjectData,
  developerId,
});
```

### Логирование ответов Prisma

```typescript
console.log("Prisma response:", {
  findUnique: await prisma.project.findUnique(),
  update: await prisma.project.update(),
});
```

## Рекомендации

1. Всегда проверять статус ответа и формат данных
2. Использовать типизированные данные для запросов
3. Добавлять проверки граничных случаев
4. Мокировать все внешние зависимости
5. Группировать связанные тесты
6. Добавлять подробное логирование для отладки
7. Проверять права доступа и валидацию данных
