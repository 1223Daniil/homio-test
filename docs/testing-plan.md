# План тестирования проекта

## 1. Компонентные тесты (Unit Tests)

### Формы проекта

```typescript
// GeneralInfoForm.test.tsx
describe("GeneralInfoForm", () => {
  it("renders form with initial values");
  it("validates required fields");
  it("submits form with valid data");
  it("handles translations correctly");
  it("shows loading state");
});

// LocationForm.test.tsx
describe("LocationForm", () => {
  it("renders map component");
  it("handles location selection");
  it("validates coordinates");
});

// Другие формы проекта...
```

### UI компоненты

```typescript
// BuildingCard.test.tsx
describe("BuildingCard", () => {
  it("renders building information");
  it("shows correct status badge");
  it("handles media gallery");
});

// UnitCard.test.tsx
describe("UnitCard", () => {
  it("displays unit details");
  it("shows price formatting");
  it("handles availability status");
});
```

## 2. Интеграционные тесты (Integration Tests)

### API Endpoints

```typescript
describe("Projects API", () => {
  describe("GET /api/projects", () => {
    it("returns list of projects");
    it("handles pagination");
    it("applies filters correctly");
  });

  describe("POST /api/projects", () => {
    it("creates new project with valid data");
    it("handles validation errors");
    it("creates related records (translations, etc)");
  });

  describe("PATCH /api/projects/[id]", () => {
    it("updates project details");
    it("handles media updates");
    it("updates translations");
  });
});
```

### Взаимодействие компонентов

```typescript
describe("Project Edit Flow", () => {
  it("loads project data correctly");
  it("updates all sections properly");
  it("handles form submissions");
  it("shows success/error messages");
});
```

## 3. E2E тесты (Cypress)

### Основные пользовательские сценарии

```typescript
describe("Project Management", () => {
  beforeEach(() => {
    cy.login();
  });

  it("creates new project", () => {
    cy.visit("/projects/new");
    cy.fillProjectForm();
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/projects/");
  });

  it("edits existing project", () => {
    cy.visit("/projects/1/edit");
    cy.updateProjectDetails();
    cy.contains("Project updated successfully");
  });
});
```

## 4. Вспомогательные утилиты

### Mock Data

```typescript
// mockData.ts
export const createMockProject = (overrides = {}) => ({
  id: "test-id",
  name: "Test Project",
  status: ProjectStatus.DRAFT,
  type: ProjectType.RESIDENTIAL,
  translations: [
    {
      locale: "en",
      name: "Test Project",
      description: "Test Description",
    },
  ],
  location: {
    latitude: 7.8,
    longitude: 98.3,
    address: "Test Address",
  },
  ...overrides,
});
```

### Test Setup

```typescript
// jest.setup.ts
import "@testing-library/jest-dom";
import { server } from "./mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 5. Приоритеты тестирования

### Высокий приоритет

- Создание/редактирование проекта
- API endpoints
- Валидация данных
- Загрузка медиафайлов

### Средний приоритет

- Фильтрация и поиск
- Локализация
- UI компоненты

### Низкий приоритет

- Вспомогательные функции
- Edge cases
- UI анимации

## 6. Метрики покрытия

Целевые показатели покрытия кода:

- Компоненты: 90%
- API routes: 85%
- Утилиты: 80%
- Общее покрытие: 85%

## 7. Инструменты

- Jest + React Testing Library для unit тестов
- Cypress для E2E тестов
- MSW для мокирования API
- jest-coverage для анализа покрытия

## 8. CI/CD интеграция

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run E2E tests
        run: npm run test:e2e
```

## 9. Документация тестов

Каждый тестовый файл должен содержать:

- Описание тестируемой функциональности
- Примеры использования моков
- Описание edge cases
- Комментарии к сложным тестовым сценариям
