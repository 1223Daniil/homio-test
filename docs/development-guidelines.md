# Development Guidelines

## ESM Usage
We use ESM (ECMAScript Modules) throughout the project. This means:

1. Always use `import/export` instead of `require`:
```typescript
// ✅ DO: Use ESM imports
import { useState } from 'react';
import { prisma } from '@/lib/prisma';

// ❌ DON'T: Use CommonJS require
const { useState } = require('react');
const prisma = require('@/lib/prisma');
```

2. Use `.mjs` extension for pure JavaScript modules or stick to `.ts`/`.tsx` for TypeScript files

3. Configure `package.json`:
```json
{
  "type": "module",
  // ...other config
}
```

## Error Prevention Strategy

### 1. Type Safety

```typescript
// ✅ DO: Use strict types
interface ProjectInput {
  name: string;
  status: ProjectStatus;
}

// ❌ DON'T: Use loose types
interface ProjectInput {
  name: any;
  status: string;
}
```

### 2. Validation Layers

1. **Type Level**

```typescript
// Define validation helpers
export const isValidStatus = (status: string): status is ProjectStatus => {
  return ["ACTIVE", "INACTIVE", "DRAFT"].includes(status);
};

// Use type guards
if (!isValidStatus(input.status)) {
  throw new Error("Invalid status");
}
```

2. **Form Level**

```typescript
const validateForm = () => {
  if (!formData.name?.trim()) {
    setError("Name is required");
    return false;
  }
  return true;
};
```

3. **API Level**

```typescript
// Validate before processing
if (!projectData.type || !projectData.status) {
  return NextResponse.json(
    { error: "Missing required fields" },
    { status: 400 }
  );
}
```

### 3. Error Handling

1. **Client Side**

```typescript
try {
  setLoading(true);
  setError(null);

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to process request");
  }

  // Handle success
} catch (error) {
  console.error("Operation failed:", {
    error,
    message: error.message
  });
  setError(error.message);
} finally {
  setLoading(false);
}
```

2. **Server Side**

```typescript
try {
  // Log operation start
  console.log("Starting operation:", { input });

  // Validate input
  const validationError = validateInput(input);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  // Perform operation in transaction
  const result = await prisma.$transaction(async tx => {
    // Operation steps
  });

  // Log success
  console.log("Operation successful:", { result });

  return NextResponse.json(result);
} catch (error) {
  // Detailed error logging
  console.error("Operation failed:", {
    error,
    message: error.message,
    stack: error.stack
  });

  // Handle specific errors
  if (error.code === "P2002") {
    return NextResponse.json({ error: "Duplicate entry" }, { status: 409 });
  }

  // Generic error response
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```

### 4. Data Consistency

1. **Use Transactions**

```typescript
const result = await prisma.$transaction(async tx => {
  // Delete related data
  await tx.related.deleteMany({
    where: { parentId: id }
  });

  // Update main record
  return tx.main.update({
    where: { id },
    data: updates
  });
});
```

2. **Validate Related Data**

```typescript
// Check references before operations
const exists = await prisma.parent.findUnique({
  where: { id: parentId }
});

if (!exists) {
  return NextResponse.json({ error: "Parent not found" }, { status: 404 });
}
```

### 5. Logging Strategy

1. **Operation Lifecycle**

```typescript
// Start
console.log("Starting operation:", { input });

// Steps
console.log("Step completed:", { stepResult });

// Success
console.log("Operation successful:", { result });

// Error
console.error("Operation failed:", {
  error,
  message: error.message,
  code: error.code,
  stack: error.stack
});
```

2. **API Responses**

```typescript
// Log all API responses
console.log("API Response:", {
  status: response.status,
  data: await response.json()
});
```

### 6. Component Development

1. **State Management**

```typescript
// Initialize state with defaults
const [data, setData] = useState<Data[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Reset state appropriately
const resetState = () => {
  setData([]);
  setError(null);
  setLoading(false);
};
```

2. **Props Validation**

```typescript
interface ComponentProps {
  data: Data[];
  onAction: (id: string) => void;
}

// Use default values
export function Component({ data = [], onAction }: ComponentProps) {
  // Component logic
}
```

### 7. Testing Strategy

1. **Input Validation**

```typescript
test("validates required fields", () => {
  const input = {};
  const result = validateInput(input);
  expect(result).toBe("Missing required fields");
});
```

2. **Error Handling**

```typescript
test("handles API errors", async () => {
  const error = new Error("API Error");
  fetch.mockRejectedValue(error);

  const result = await handleRequest();
  expect(result.error).toBe("API Error");
});
```

## Code Review Checklist

1. **Types**

   - [ ] All variables and functions are properly typed
   - [ ] No use of `any` type
   - [ ] Type guards are used where needed

2. **Validation**

   - [ ] Input is validated at all levels
   - [ ] Error messages are user-friendly
   - [ ] Edge cases are handled

3. **Error Handling**

   - [ ] try/catch blocks are used appropriately
   - [ ] Errors are logged with context
   - [ ] User is informed of errors

4. **Data Operations**

   - [ ] Transactions are used for related operations
   - [ ] Data consistency is maintained
   - [ ] References are validated

5. **Logging**

   - [ ] Operations are properly logged
   - [ ] Error logs include necessary context
   - [ ] Sensitive data is not logged

6. **Testing**
   - [ ] Happy path is tested
   - [ ] Error cases are tested
   - [ ] Edge cases are tested

## Translation Management

### Structure Guidelines

1. **Main Sections**
   ```json
   {
     "ComponentName": {
       // Direct keys for common component texts
       "title": "Component Title",
       "description": "Component Description",
       "addButton": "Add Item",
       
       // Grouped related items
       "status": {
         "active": "Active",
         "inactive": "Inactive"
       },
       
       // Nested functionality sections
       "form": {
         "title": "Form Title",
         "fields": {
           "name": {
             "label": "Name",
             "placeholder": "Enter name"
           }
         }
       }
     }
   }
   ```

2. **Access Patterns**
   ```typescript
   // ✅ Good - Direct access for common UI elements
   const t = useTranslations("ComponentName");
   t("title")               // "Component Title"
   t("addButton")           // "Add Item"
   t("status.active")       // "Active"
   
   // ❌ Bad - Too deep nesting makes code harder to maintain
   t("form.fields.name.label.text")  // Too many levels
   t("sections.main.header.title")   // Too nested
   ```

3. **Balancing Structure**
   ```json
   {
     "Courses": {
       // Direct keys for frequently used UI elements
       "title": "Course Title",
       "description": "Description",
       "addCourse": "Add Course",
       
       // One level deep for related items
       "status": {
         "draft": "Draft",
         "published": "Published"
       },
       
       // Grouped functionality
       "form": {
         "title": "Course Form",
         "save": "Save Course"
       },
       
       // Separate section for messages
       "messages": {
         "saveSuccess": "Course saved",
         "saveError": "Failed to save"
       }
     }
   }
   ```

### Best Practices

1. **Key Structure**
   - Use direct keys for commonly used UI elements
   - Group related items one level deep
   - Avoid nesting more than 2-3 levels deep
   - Keep similar patterns across different components

2. **Naming Conventions**
   ```json
   {
     "ComponentName": {
       // Actions
       "add": "Add",
       "edit": "Edit",
       "delete": "Delete",
       
       // Form fields
       "title": "Title",
       "description": "Description",
       
       // Grouped items
       "status": {
         "active": "Active",
         "inactive": "Inactive"
       },
       
       // Messages
       "messages": {
         "saveSuccess": "Saved successfully",
         "saveError": "Save failed"
       }
     }
   }
   ```

3. **Common Patterns**
   ```typescript
   // Component structure
   const MyComponent = () => {
     const t = useTranslations("ComponentName");
     
     return (
       <>
         <h1>{t("title")}</h1>
         <Button>{t("add")}</Button>
         <Select>
           <Option value="active">{t("status.active")}</Option>
         </Select>
         {error && <Error>{t("messages.saveError")}</Error>}
       </>
     );
   };
   ```

### Anti-patterns to Avoid

1. **❌ Too Deep Nesting**
   ```json
   {
     "Component": {
       "sections": {
         "header": {
           "title": {
             "text": "Title"  // Too deep!
           }
         }
       }
     }
   }
   ```

2. **❌ Inconsistent Structure**
   ```json
   {
     "Component": {
       "addButtonText": "Add",  // Inconsistent naming
       "button_edit": "Edit",   // Mixed naming styles
       "DeleteButtonText": "Delete"  // Inconsistent casing
     }
   }
   ```

3. **❌ Mixed Responsibilities**
   ```json
   {
     "Component": {
       "title": "Title",
       "api": {  // Don't mix UI texts with technical concerns
         "endpoints": {
           "get": "/api/v1/component"
         }
       }
     }
   }
   ```

### Recommended Structure

1. **UI Components**
   ```json
   {
     "Courses": {
       // Direct access keys
       "title": "Courses",
       "description": "Course list",
       "addCourse": "Add Course",
       
       // Status and enums
       "status": {
         "draft": "Draft",
         "published": "Published"
       },
       
       // Form labels and placeholders
       "form": {
         "titleLabel": "Title",
         "titlePlaceholder": "Enter course title"
       },
       
       // Messages
       "messages": {
         "saveSuccess": "Course saved",
         "saveError": "Failed to save course"
       }
     }
   }
   ```

2. **Page Components**
   ```json
   {
     "CoursesPage": {
       // Page-specific texts
       "header": "Courses Management",
       "subheader": "Manage your courses",
       
       // Section titles
       "sections": {
         "active": "Active Courses",
         "archived": "Archived Courses"
       }
     }
   }
   ```

### Implementation Checklist

1. **Structure**
   - [ ] Use PascalCase for main component sections
   - [ ] Keep nesting to maximum 2-3 levels
   - [ ] Group related translations logically
   - [ ] Use consistent patterns across components

2. **Naming**
   - [ ] Use camelCase for translation keys
   - [ ] Be consistent with key naming patterns
   - [ ] Use clear, descriptive names
   - [ ] Avoid technical terms in keys

3. **Usage**
   - [ ] Use direct keys for common UI elements
   - [ ] Group related items under common parents
   - [ ] Keep messages separate from UI texts
   - [ ] Include all necessary variants (singular/plural, states)

### Common Issues and Solutions

1. Undefined Translation Keys

```typescript
// ❌ Bad - может вызвать ошибку если status undefined
<Badge>{t(`status.${project?.status}`)}</Badge>

// ✅ Good - проверяем наличие значения
{project?.status && (
  <Badge>{t(`status.${project.status}`)}</Badge>
)}
```

2. Missing Translation Keys

```json
// ❌ Bad - неполная структура переводов
{
  "Projects": {
    "title": "Projects"
  }
}

// ✅ Good - полная структура с группировкой
{
  "Projects": {
    "title": "Projects",
    "status": {
      "ACTIVE": "Active",
      "INACTIVE": "Inactive"
    },
    "media": {
      "title": "Media",
      "dragImages": "Drag images here"
    }
  }
}
```

### Translation Structure Guidelines

1. Группировка переводов:

   - Используйте вложенные объекты для логической группировки
   - Группируйте по функциональности (media, status, form и т.д.)
   - Сохраняйте одинаковую структуру во всех языковых файлах

2. Именование ключей:

   - Используйте camelCase для ключей
   - Используйте точечную нотацию для доступа
   - Избегайте динамических ключей

3. Обязательные секции для компонентов:
   ```json
   {
     "ComponentName": {
       "title": "", // Заголовки
       "actions": {}, // Действия (create, edit, delete)
       "form": {}, // Формы
       "status": {}, // Статусы
       "errors": {}, // Ошибки
       "messages": {} // Уведомления
     }
   }
   ```

### Безопасное использование переводов

1. Проверка наличия значений:

   ```typescript
   // Всегда проверяйте наличие значений перед использованием
   {
     data?.field && t(`key.${data.field}`);
   }
   ```

2. Fallback значения:

   ```typescript
   // Используйте fallback для отсутствующих переводов
   {
     project.currentTranslation?.name || t("untitled");
   }
   ```

3. Типизация переводов:
   ```typescript
   // Определите типы для ваших переводов
   type ProjectStatus = "ACTIVE" | "INACTIVE";
   type ProjectType = "RESIDENTIAL" | "COMMERCIAL";
   ```

### Процесс добавления новых переводов

1. Планирование:

   - Определите все необходимые ключи
   - Создайте структуру группировки
   - Проверьте существующие похожие переводы

2. Реализация:

   - Добавьте переводы во все языковые файлы одновременно
   - Следуйте существующей структуре
   - Добавьте типы если необходимо

3. Тестирование:
   - Проверьте все добавленные переводы
   - Протестируйте fallback значения
   - Проверьте все языки

### Чеклист при работе с переводами

1. Перед коммитом:

   - [ ] Все ключи добавлены во все языковые файлы
   - [ ] Структура одинакова во всех файлах
   - [ ] Добавлены fallback значения
   - [ ] Проверены все условные рендеринги
   - [ ] Типы обновлены если нужно

2. При ревью кода:

   - [ ] Переводы следуют структуре проекта
   - [ ] Нет хардкода строк
   - [ ] Используются правильные ключи
   - [ ] Безопасный доступ к значениям

3. При тестировании:
   - [ ] Проверка всех языков
   - [ ] Проверка отсутствующих переводов
   - [ ] Проверка условного рендеринга
   - [ ] Проверка специальных символов

## Рекомендации по компонентам

1. Всегда используйте проверку наличия данных:

   ```typescript
   {data && <Component data={data} />}
   ```

2. Обрабатывайте состояния загрузки:

   ```typescript
   {isLoading ? <Loader /> : <Content />}
   ```

3. Предоставляйте fallback UI:
   ```typescript
   {data?.length ? <List data={data} /> : <EmptyState />}
   ```

## Обработка ошибок

1. Используйте понятные сообщения об ошибках:

   ```typescript
   try {
     // код
   } catch (error) {
     console.error("Контекст ошибки:", error);
     showNotification({
       title: t("errors.title"),
       message: t("errors.message")
     });
   }
   ```

2. Добавляйте контекст к ошибкам:
   ```typescript
   console.error("Error in ProjectPage:", {
     error,
     projectId,
     context: "loading project"
   });
   ```

## Database Seeding Best Practices

### Sequential Data Creation

When seeding data with complex relationships, follow these principles:

1. **Clean Up First**

```typescript
// Clear data in correct order (respect foreign keys)
await prisma.projectTranslation.deleteMany();
await prisma.project.deleteMany();
await prisma.developerTranslation.deleteMany();
await prisma.developer.deleteMany();
await prisma.agent.deleteMany();
await prisma.client.deleteMany();
await prisma.user.deleteMany();
await prisma.role.deleteMany();
await prisma.agency.deleteMany();
```

2. **Create Base Entities First**

```typescript
// Create independent entities first
const roles = await Promise.all([
  prisma.role.create({
    /* ... */
  })
  // ...
]);

const agency = await prisma.agency.create({
  data: {
    id: "demo-agency",
    name: "Demo Agency"
    // ...
  }
});
```

3. **Create Users Separately**

```typescript
// Create user account
const agentUser = await prisma.user.create({
  data: {
    email: "agent@example.com",
    username: "agent",
    password: await bcryptjs.hash("agent123", 10),
    roleId: roles[2].id
  }
});

// Then create related profile
const agent = await prisma.agent.create({
  data: {
    firstName: "John",
    lastName: "Agent",
    userId: agentUser.id,
    agencyId: agency.id
  }
});
```

4. **Handle Translations Properly**

```typescript
const developer = await prisma.developer.create({
  data: {
    translations: {
      create: [
        {
          language: "en",
          name: "Demo Developer",
          description: "English description"
        },
        {
          language: "ru",
          name: "Демо Застройщик",
          description: "Russian description"
        }
      ]
    }
  }
});
```

### Common Pitfalls

1. **❌ Avoid Nested Creation for Complex Relations**

```typescript
// DON'T DO THIS
prisma.user.create({
  data: {
    email: "agent@example.com",
    agent: {
      create: {
        // This can cause issues with complex relations
      }
    }
  }
});

// ✅ DO THIS INSTEAD
const user = await prisma.user.create({ data: { email: "agent@example.com" } });
const agent = await prisma.agent.create({
  data: {
    userId: user.id
    // ...
  }
});
```

2. **❌ Avoid Circular Dependencies**

```typescript
// DON'T create entities that depend on each other simultaneously
// Always establish a clear order of creation
```

3. **✅ Use Clear IDs for Development**

```typescript
// Use predictable IDs for easier development/testing
const agency = await prisma.agency.create({
  data: {
    id: "demo-agency", // Predictable ID
    name: "Demo Agency"
  }
});
```

### Best Practices

1. **Error Handling**

```typescript
main()
  .catch(e => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

2. **Logging**

```typescript
console.log("Seed data created:", {
  roles: roles.map(r => r.name),
  users: {
    admin: adminUser.id,
    developer: developerUser.id
  }
});
```

3. **Environment Awareness**

```typescript
const isDev = process.env.NODE_ENV === "development";
if (isDev) {
  // Create additional development data
}
```

4. **Data Organization**

- Group related entities together
- Create constants for repeated values
- Use meaningful names for test data
- Document special relationships or requirements

### Running Seeds

```bash
# Reset database and run seeds
npx prisma migrate reset --force

# Just run seeds
npx prisma db seed
```

Remember to update your package.json to specify the seed file:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

## API Design

### HTTP Methods

We follow REST principles for our API design:

- GET: Retrieve resources
- POST: Create new resources
- PUT: Full update of resources (legacy support)
- PATCH: Partial update of resources (preferred)
- DELETE: Remove resources

#### PATCH vs PUT

For updating resources, we prefer PATCH over PUT because:

1. PATCH allows partial updates of resources
2. Only changed fields need to be sent
3. More efficient for both client and server
4. Reduces network traffic and processing overhead

Example PATCH request:

```typescript
// PATCH /api/projects/[id]
{
  "status": "CONSTRUCTION",
  "translations": [
    {
      "language": "en",
      "name": "Updated Name"
    }
  ]
}
```

### Data Structure

All update operations use TypeScript interfaces for type safety:

```typescript
interface ProjectUpdateData {
  type?: string;
  status?: string;
  completionDate?: string | null;
  totalUnits?: number | null;
  phase?: number;
  constructionStatus?: number;
  translations?: Array<{
    language: string;
    name: string;
    description?: string;
  }>;
  media?: Array<{
    url: string;
    type: string;
    title?: string;
    description?: string;
    order: number;
  }>;
  location?: {
    address: string;
    city: string;
    area: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    beachDistance?: number;
    centerDistance?: number;
  };
  yield?: {
    guaranteed: number;
    potential: number;
    occupancy: number;
  };
  pricing?: {
    basePrice: number;
    currency: string;
    pricePerSqm: number;
    maintenanceFee?: number;
    maintenanceFeePeriod?: string;
  };
}
```

### Database Operations

For data consistency, we use transactions when updating related entities:

```typescript
const updatedProject = await prisma.$transaction(async tx => {
  // Collect changes
  const updateData = {
    // Basic fields
    type: projectData.type,
    status: projectData.status
    // ... other fields
  };

  // Update related entities if provided
  if (projectData.translations?.length) {
    await tx.projectTranslation.deleteMany({
      where: {
        projectId: params.id,
        language: { in: projectData.translations.map(t => t.language) }
      }
    });
    updateData.translations = {
      create: projectData.translations
    };
  }

  // Similar pattern for other relations
  // ...

  return tx.project.update({
    where: { id: params.id },
    data: updateData,
    include: {
      // Include all related entities in response
      translations: true,
      media: true,
      location: true
      // ...
    }
  });
});
```

### Error Handling

We use consistent error handling across all API endpoints:

```typescript
try {
  // Operation logic
} catch (error) {
  console.error("Operation failed:", {
    message: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined
  });

  if (error instanceof Error && error.message.includes("Record not found")) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      error: "Operation failed",
      details: error instanceof Error ? error.message : "Unknown error"
    },
    { status: 500 }
  );
}
```

### Best Practices

1. Always use TypeScript interfaces for request/response data
2. Use transactions for operations affecting multiple tables
3. Implement proper error handling and logging
4. Make fields optional in update interfaces
5. Include related entities in responses
6. Use consistent naming conventions
7. Document API endpoints and data structures
8. Validate input data before processing
9. Use proper HTTP status codes
10. Keep backwards compatibility when possible

## Middleware Usage Guide

### Authorization and Localization

The application uses a combined middleware approach for handling both authorization and internationalization (i18n). Here's how it works:

#### Route Protection

1. **Public Routes**
   - Defined in `ROUTES.public`
   - Include: `/login`, `/login/error`, `/error`, `/api/auth/*`
   - No authentication required
   - Authenticated users are redirected from login page to home

2. **Protected Routes**
   - **Admin Routes** (`/management/*`)
     - Full access to all routes
     - Required role: `ADMIN`
   
   - **Developer Routes**
     - Paths: `/projects/new`, `/projects/[id]/edit`, `/developers/*`
     - Required role: `DEVELOPER`
   
   - **Project Routes**
     - Paths: `/projects`, `/projects/[id]/*`
     - Accessible by: `DEVELOPER`, `AGENT`
   
   - **Course Routes**
     - Paths: `/courses/*`
     - Accessible by: `DEVELOPER`, `AGENT`
   
   - **Common Protected Routes**
     - Paths: `/`, `/settings/*`, `/profile/*`, `/search/*`, `/amenities/*`
     - Accessible by any authenticated user

#### Localization Handling

1. **URL Structure**
   - All routes must include locale: `/{locale}/path`
   - Supported locales: `en`, `ru`
   - Default locale: `ru`

2. **Automatic Redirects**
   - Root path (`/`) redirects to `/{defaultLocale}`
   - Non-localized paths are automatically prefixed with default locale
   - Invalid locales trigger 404 error

#### Development Guidelines

1. **Adding New Routes**
   ```typescript
   // Add to appropriate section in ROUTES object
   const ROUTES = {
     public: [...],
     protected: {
       admin: [...],
       developer: [...],
       // Add new route pattern here
     }
   };
   ```

2. **Role-Based Access**
   ```typescript
   // Check user role in components
   const { hasRole } = useAuth();
   if (hasRole([UserRole.ADMIN])) {
     // Show admin content
   }
   ```

3. **Internationalization**
   ```typescript
   // In server components
   import { unstable_setRequestLocale } from "next-intl/server";
   
   export default async function Page({ params: { locale } }) {
     unstable_setRequestLocale(locale);
     // Component logic
   }
   
   // In client components
   import { useTranslations } from "next-intl";
   
   export default function Component() {
     const t = useTranslations();
     return <div>{t("key")}</div>;
   }
   ```

4. **Error Handling**
   - Unauthorized access redirects to login page
   - Invalid role access redirects to home page
   - All redirects preserve the current locale

#### Security Considerations

1. **Route Protection**
   - Always add new routes to appropriate section in `ROUTES`
   - Never rely solely on UI hiding for security
   - Use server-side validation in API routes

2. **Role Validation**
   - Always check roles server-side
   - Use `requireAuth()` and `requireRole()` helpers
   - Implement both client and server validation

3. **API Security**
   - Protected API routes should validate session
   - Use appropriate error responses (401, 403)
   - Implement rate limiting for public endpoints
