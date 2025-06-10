# Troubleshooting Guide

## API Issues

### Project Not Found (404)
**Problem**: API возвращает 404 при использовании slug вместо id.

**Solution**: 
```typescript
// Добавить поиск по slug И id
const project = await prisma.project.findFirst({
  where: {
    OR: [
      { slug: params.id },
      { id: params.id }
    ]
  }
});
```

### Method Not Allowed (405)
**Problem**: API возвращает 405 при отсутствии нужного HTTP метода.

**Solution**: 
- Убедиться, что в файле route.ts определены все необходимые методы (GET, POST, PATCH, etc.)
- Методы должны быть именованы в верхнем регистре
- Пример структуры API endpoint:
```typescript
export async function GET() { ... }
export async function POST() { ... }
export async function PATCH() { ... }
```

### Media Upload Issues
**Problem**: Неправильное имя модели в Prisma client.

**Solution**:
- Использовать `projectMedia` вместо `media`
- Проверить схему Prisma для правильных имен моделей
```typescript
const media = await prisma.projectMedia.create({
  data: {
    title: data.title,
    url: data.url,
    type: data.type,
    category: data.category,
    projectId: project.id
  }
});
```

### Building Updates
**Problem**: Здания не обновляются из-за отсутствия PATCH метода.

**Solution**:
1. Создать файл `[buildingId]/route.ts`
2. Реализовать PATCH метод с проверками:
   - Авторизация
   - Существование проекта
   - Принадлежность здания проекту
3. Пример структуры:
```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; buildingId: string } }
) {
  // 1. Проверка авторизации
  const session = await getServerSession(authOptions);
  
  // 2. Поиск проекта по slug/id
  const project = await prisma.project.findFirst({
    where: {
      OR: [{ slug: params.id }, { id: params.id }]
    }
  });
  
  // 3. Проверка здания
  const building = await prisma.building.findFirst({
    where: {
      AND: [
        { id: params.buildingId },
        { projectId: project.id }
      ]
    }
  });
  
  // 4. Обновление данных
  const updatedBuilding = await prisma.building.update({...});
}
```

## Best Practices

### API Routes
1. Всегда включать проверку авторизации
2. Использовать поиск по slug И id для проектов
3. Проверять принадлежность вложенных ресурсов (здания, медиа) к проекту
4. Возвращать информативные сообщения об ошибках
5. Логировать важные операции и ошибки

### Data Validation
1. Проверять наличие обязательных полей
2. Валидировать типы данных
3. Использовать правильные имена моделей из схемы Prisma
4. Проверять связи между сущностями

### Response Format
```typescript
// Success
return new Response(JSON.stringify(data), {
  headers: { "Content-Type": "application/json" },
});

// Error
return new Response(JSON.stringify({ 
  error: "Error message",
  details: error instanceof Error ? error.message : String(error)
}), {
  status: errorCode,
  headers: { "Content-Type": "application/json" },
}); 