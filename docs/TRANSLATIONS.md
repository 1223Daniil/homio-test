# Translation System Guidelines (next-intl)

## Key Structure

### Main Sections (PascalCase)
Main sections that are used directly with `useTranslations()` hook from next-intl:
```json
{
    "Common": {
        "actions": {
            "save": "Save",
            "cancel": "Cancel",
            "delete": "Delete",
            "edit": "Edit",
            "create": "Create",
            "update": "Update"
        },
        "status": {
            "active": "Active",
            "inactive": "Inactive",
            "draft": "Draft",
            "planning": "Planning",
            "construction": "Construction",
            "completed": "Completed"
        },
        "types": {
            "residential": "Residential",
            "commercial": "Commercial",
            "mixedUse": "Mixed Use"
        },
        "validation": {
            "required": "This field is required",
            "invalid": "Invalid value",
            "tooLong": "Value is too long",
            "tooShort": "Value is too short"
        }
    },
    "Forms": {
        "fields": {
            "name": {
                "label": "Name",
                "hint": "Enter name",
                "error": "Invalid name"
            },
            "description": {
                "label": "Description",
                "hint": "Enter description",
                "error": "Invalid description"
            },
            "email": {
                "label": "Email",
                "hint": "Enter email",
                "error": "Invalid email format"
            }
        }
    },
    "Projects": {
        "actions": {
            "create": "Create Project",
            "edit": "Edit Project",
            "delete": "Delete Project"
        },
        "sections": {
            "general": {
                "title": "General Information",
                "description": "Basic project details"
            },
            "location": {
                "title": "Location",
                "description": "Project location details"
            }
        },
        "fields": {
            "name": {
                "label": "Project Name",
                "hint": "Enter project name",
                "error": "Invalid project name"
            },
            "type": {
                "label": "Project Type",
                "hint": "Select project type"
            },
            "status": {
                "label": "Project Status",
                "hint": "Select project status"
            }
        }
    }
}
```

## Naming Conventions

### 1. Section Names
- Use PascalCase for main sections: `Common`, `Projects`, `Forms`
- Use camelCase for subsections: `actions`, `fields`, `status`

### 2. Key Types
- **Actions**: `create`, `edit`, `delete`, `save`, `cancel`
- **States**: `active`, `inactive`, `loading`, `error`
- **Field Types**: `label`, `hint`, `error`, `placeholder`
- **Messages**: `success`, `error`, `warning`, `info`

### 3. Field Structure
```json
"fieldName": {
    "label": "Field Label",
    "hint": "Help text",
    "error": "Error message",
    "placeholder": "Placeholder text"
}
```

## Usage in Code

### 1. Basic Usage with next-intl
```typescript
// Server Components
import { useTranslations } from 'next-intl';

// Client Components
'use client';
import { useTranslations } from 'next-intl';

// Usage
const t = useTranslations("Projects");
t("actions.create"); // -> "Create Project"

// Common translations
const t = useTranslations("Common");
t("actions.save"); // -> "Save"
```

### 2. Form Fields with HeroUI
```typescript
const t = useTranslations("Forms");

<Input
    label={t("fields.name.label")}
    placeholder={t("fields.name.hint")}
    error={t("fields.name.error")}
/>
```

### 3. Dynamic Values
```typescript
// Use curly braces for variables
"messages": {
    "deleteConfirm": "Are you sure you want to delete {name}?"
}

// Usage
t("messages.deleteConfirm", { name: projectName })
```

## Project Structure

### 1. Translation Files
```
src/
  locales/           # Translation messages
    en.json          # English translations
    ru.json          # Russian translations
  i18n/              # i18n configuration
    index.ts         # Main configuration
    request.ts       # Request configuration
  config/
    i18n.ts         # i18n setup
```

### 2. Configuration
```typescript
// i18n.ts
import { getRequestConfig } from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => ({
  messages: (await import(`@/locales/${locale}.json`)).default,
  timeZone: 'Asia/Bangkok',
  now: new Date()
}));

// middleware.ts
import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['en', 'ru'],
  defaultLocale: 'ru'
});
 
export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
```

## Adding New Translations

1. Add keys to all language files
2. Follow the section structure
3. Include all necessary forms (label, hint, error)
4. Run type checking
5. Test in all supported locales

## Type Safety

### 1. Type Generation
```bash
# Generate types from messages
npx typesafe-i18n --generator
```

### 2. Usage with TypeScript
```typescript
// Typed translations
const t = useTranslations<Messages>("Common");
t("actions.save"); // Type-safe
```

## Best Practices

### 1. Server Components
- Use translations directly in Server Components
- Avoid unnecessary "use client" directives
- Keep translations close to usage

### 2. Performance
- Messages are loaded at build time
- No client-side translation bundles
- Automatic static optimization

### 3. SEO
- Proper language tags in HTML
- Alternate links for languages
- Static generation with all locales

### 4. Validation
1. All keys must exist in all language files
2. Main sections must be PascalCase
3. Nested keys must be camelCase
4. Field keys must have label, hint, error structure
5. No duplicate keys in different contexts
6. No missing translations

### 5. Error Handling
- Fallback to default locale
- Missing key warnings in development
- Type checking for all translations

# Интернационализация в Next.js 15

## Структура

```
src/
├── locales/           # Файлы переводов
│   ├── en.json       # Английский
│   └── ru.json       # Русский
└── i18n/             # Конфигурация i18n
    ├── index.ts      # Основная конфигурация
    └── request.ts    # Конфигурация запросов
```

## Конфигурация

Основная конфигурация находится в `src/i18n/index.ts`:

```typescript
import { getRequestConfig } from './request'
import { createI18nServer } from 'next-intl/server'

export const locales = ['en', 'ru'] as const
export const defaultLocale = 'en' as const

export type Locale = (typeof locales)[number]

export const i18n = {
  defaultLocale,
  locales,
  getRequestConfig
}

export const createI18n = createI18nServer({
  locales,
  defaultLocale,
  messages: async (locale) => {
    return (await import(`@/locales/${locale}.json`)).default
  }
})
```

## Метаданные и SEO

Для страниц используем динамические метаданные с переводами:

```typescript
// app/[locale]/layout.tsx
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params: { locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('og.title'),
      description: t('og.description')
    }
  }
}
```

## Использование в компонентах

### Server Components

```typescript
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('Page')
  
  return <h1>{t('title')}</h1>
}
```

### Client Components

```typescript
'use client'

import { useTranslations } from 'next-intl'

export default function Counter() {
  const t = useTranslations('Counter')
  
  return <button>{t('increment')}</button>
}
```

## Файлы переводов

Пример структуры `locales/en.json`:

```json
{
  "Metadata": {
    "title": "Homio - Real Estate Platform",
    "description": "Find your perfect home",
    "og": {
      "title": "Homio - Real Estate Platform",
      "description": "Find your perfect home with AI assistance"
    }
  },
  "Navigation": {
    "home": "Home",
    "projects": "Projects",
    "developers": "Developers"
  }
}
```
