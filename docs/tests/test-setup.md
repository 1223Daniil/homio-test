# Test Setup Documentation

## Project Structure

```
__tests__/
  api/
    buildings/
      create.test.ts
      update.test.ts
    projects/
      create.test.ts
      update.test.ts
  helpers/
    apiHelpers.ts
```

## Common Test Setup

### Mock Setup

```typescript
// Мокирование Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    building: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Мокирование Auth
jest.mock("next-auth/next");
```

### Helper Functions

```typescript
// apiHelpers.ts
export function createApiRequest(method: string, body?: any) {
  return new Request(`http://localhost:3000/api/test`, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
```

## Test Patterns

### Валидация API ответов

1. **Проверка статуса**

```typescript
expect(response.status).toBe(expectedStatus);
```

2. **Проверка данных**

```typescript
const data = await response.json();
expect(data).toMatchObject(expectedData);
```

3. **Проверка вызовов Prisma**

```typescript
expect(prisma.building.update).toHaveBeenCalledWith(expectedParams);
expect(prisma.building.update).not.toHaveBeenCalled();
```

### Мокирование данных

1. **Мокирование сессии**

```typescript
beforeEach(() => {
  (getServerSession as jest.Mock).mockResolvedValue({
    user: {
      email: "admin@homio.com",
      name: "Admin User",
      id: "test-user-id",
    },
  });
});
```

2. **Мокирование Prisma ответов**

```typescript
(prisma.building.findUnique as jest.Mock).mockResolvedValueOnce({
  id: "test-id",
  ...mockData,
});
```

### Обработка ошибок

1. **Проверка ошибок валидации**

```typescript
expect(response.status).toBe(400);
expect(data.error).toBe("Invalid data");
```

2. **Проверка ошибок авторизации**

```typescript
expect(response.status).toBe(401);
expect(data.error).toBe("Unauthorized");
```

3. **Проверка ошибок базы данных**

```typescript
(prisma.building.update as jest.Mock).mockRejectedValueOnce(
  new Error("Database error")
);
expect(response.status).toBe(500);
```

## Debugging Tests

### Логирование

```typescript
console.log("Found building:", existingBuilding);
console.log("Checking project association:", {
  existingBuildingProjectId: existingBuilding.projectId,
  requestedProjectId: projectId,
  areEqual: existingBuilding.projectId === projectId,
});
```

### Сброс моков

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  (prisma.building.findUnique as jest.Mock).mockReset();
  (prisma.building.update as jest.Mock).mockReset();
});
```

## Best Practices

1. Всегда сбрасывать моки перед каждым тестом
2. Использовать типизированные данные
3. Проверять как успешные, так и ошибочные сценарии
4. Добавлять подробное логирование для отладки
5. Группировать связанные тесты в describe блоки
6. Использовать константы для тестовых данных
