# Архитектура проекта

## Технологический стек

- Next.js 15 с App Router
- TypeScript
- HeroUI (основной UI фреймворк)
- next-intl для интернационализации
- NextAuth.js для аутентификации
- Prisma с PostgreSQL
- React Hook Form для форм
- Zod для валидации
- Jest и Cypress для тестирования
- Docker для разработки и деплоя

## Каркас проекта

### 1. База данных (Фундамент)
```prisma
// Основные сущности
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  role          Role      @relation(fields: [roleId], references: [id])
  // ...другие поля
}

model Project {
  id          String    @id @default(uuid())
  type        ProjectType
  status      ProjectStatus
  developer   Developer @relation(fields: [developerId], references: [id])
  // ...другие поля
}

model Developer {
  id        String    @id @default(cuid())
  projects  Project[]
  // ...другие поля
}

model Property {
  id        String    @id @default(cuid())
  title     String
  price     Float?
  // ...другие поля
}

model Unit {
  id        String    @id @default(cuid())
  project   Project   @relation(fields: [projectId], references: [id])
  // ...другие поля
}
```

### 2. Провайдеры (Основной каркас)
```typescript
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NextAuthProvider>        {/* Аутентификация */}
          <I18nProvider>         {/* Интернационализация */}
            <HeroUIProvider>     {/* UI компоненты */}
              {children}
            </HeroUIProvider>
          </I18nProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
```

### 3. Роутинг и Интернационализация
```
src/
├── app/                # Next.js App Router
│   ├── [locale]/      # Мультиязычная маршрутизация
│   │   ├── page.tsx   # Главная страница
│   │   ├── projects/  # Проекты
│   │   ├── users/     # Пользователи
│   │   ├── settings/  # Настройки
│   │   ├── developers/# Застройщики
│   │   ├── courses/   # Курсы
│   │   ├── ai/        # AI функционал
│   │   ├── search/    # Поиск
│   │   ├── dashboard/ # Панель управления
│   │   └── auth/      # Аутентификация
│   ├── api/           # API endpoints
│   └── auth/          # NextAuth конфигурация
├── locales/           # Файлы переводов
│   ├── en.json       # Английский
│   └── ru.json       # Русский
└── i18n/             # Конфигурация i18n
    ├── index.ts     # Основная конфигурация
    └── request.ts   # Конфигурация запросов
```

### 4. Архитектурные особенности

#### Масштабируемость
- Server Components по умолчанию
- Четкое разделение ответственности
- Горизонтальное масштабирование через Docker
- Независимые микросервисы

#### Безопасность
- Аутентификация через NextAuth.js
- Защита API через middleware
- Валидация на всех уровнях:
  - База данных (Prisma)
  - API (Zod)
  - Формы (React Hook Form)

#### Производительность
- Server Components
- Оптимизация сборки (Next.js)
- Lazy loading компонентов
- Оптимизация изображений (next/image)

#### Поддерживаемость
- TypeScript для типобезопасности
- Единый стиль кода (ESLint/Prettier)
- Автоматические тесты
- Подробная документация

### 5. Ключевые возможности каркаса

1. **Быстрая разработка**
   - Готовые HeroUI компоненты
   - Автогенерация API типов
   - Переиспользуемые хуки
   - Шаблоны компонентов

2. **Мультиязычность**
   - Динамическая загрузка переводов
   - SEO-оптимизация для разных языков
   - Автоматическое определение языка
   - Fallback на дефолтный язык

3. **Управление данными**
   - Типобезопасные запросы к БД
   - Валидация через Zod
   - Server Actions
   - Кэширование и revalidation

4. **Мониторинг и отладка**
   - Логирование ошибок
   - Метрики производительности
   - Отслеживание состояния
   - Инструменты разработчика

## Структура проекта

```
├── src/                    # Исходный код
│   ├── app/               # Next.js App Router
│   │   ├── [locale]/     # Локализованные маршруты
│   │   ├── api/          # API маршруты
│   │   ├── components/   # React компоненты
│   │   │   ├── ui/      # Базовые UI компоненты
│   │   │   └── features/ # Компоненты функционала
│   │   ├── lib/          # Core utilities
│   │   ├── hooks/        # Custom hooks
│   │   ├── store/        # Глобальное состояние
│   │   ├── types/        # TypeScript типы
│   │   └── utils/        # Утилиты
│   ├── prisma/           # Схема и миграции Prisma
│   ├── public/           # Статические файлы
│   ├── cypress/         # E2E тесты
│   ├── __tests__/       # Unit тесты
│   └── docs/            # Документация
├── locales/               # Файлы переводов
│   ├── en.json          # Английский
│   └── ru.json          # Русский
└── i18n/                # Конфигурация i18n
    ├── index.ts         # Основная конфигурация
    └── request.ts       # Конфигурация запросов
```

## Ключевые конфигурации

### Next.js (next.config.mjs)
```javascript
const config = {
  // Интернационализация через next-intl
  i18n: {
    locales: ['en', 'ru'],
    defaultLocale: 'ru'
  },
  
  // Оптимизации
  experimental: {
    serverActions: true,
    optimizeCss: true
  },
  
  // Настройки изображений
  images: {
    domains: ["localhost"]
  }
}
```

### TypeScript (tsconfig.json)
- Строгий режим
- Поддержка путей импорта
- Конфигурация для Next.js 15

### Тестирование
- Jest для unit-тестов
- Cypress для E2E тестов
- Моки и фикстуры

### Docker
- Multi-stage сборка
- Оптимизация для production
- Поддержка разработки

### Переменные окружения
- `.env` - базовые переменные
- `.env.local` - локальные переменные
- `.env.production` - production переменные

## Архитектура компонентов

### Страничные компоненты
- Расположены в `src/app/[locale]/**/page.tsx`
- По умолчанию Server Components
- Использование Server Actions
- Использование HeroUI компонентов
- Поддержка интернационализации

Пример:
```typescript
import { useTranslations } from "next-intl";
import { Card, Container } from "@heroui/react";

export default async function FeaturePage() {
  const t = useTranslations("Feature");
  const data = await getData(); // Server Action

  return (
    <Container>
      <Card>
        {/* Контент страницы */}
      </Card>
    </Container>
  );
}
```

### Компоненты функционала
- Расположены в `src/components/features/`
- Используют HeroUI компоненты
- Поддержка i18n через useTranslations
- Обработка специфичной логики
