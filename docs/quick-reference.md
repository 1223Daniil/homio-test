# Quick Reference Guide

## Component Structure

```
Page Component (page.tsx)
├── State Management
│   ├── Data ([data, setData])
│   ├── Loading State
│   └── Error State
├── Data Fetching (useEffect)
└── Layout (DashboardLayout)
    └── Feature Components
        ├── Lists (ProjectList)
        └── Forms (ProjectForm)
```

## Standard Component Template

```typescript
"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Container, LoadingOverlay } from "@mantine/core";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function FeaturePage() {
  // 1. State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Hooks
  const t = useTranslations("Namespace");
  const locale = useLocale();

  // 3. Data Fetching
  useEffect(() => {
    fetchData();
  }, [dependencies]);

  // 4. Event Handlers
  const handleAction = async () => {
    try {
      setLoading(true);
      // Action logic
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Render
  return (
    <DashboardLayout>
      <Container size="xl" pos="relative">
        <LoadingOverlay visible={loading} />
        {/* Content */}
      </Container>
    </DashboardLayout>
  );
}
```

## API Route Template

```typescript
export async function GET(request: NextRequest) {
  try {
    // 1. Get params/query
    const searchParams = request.nextUrl.searchParams;

    // 2. Fetch data
    const data = await prisma.model.findMany({
      include: { relations: true }
    });

    // 3. Return response
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error message" }, { status: 500 });
  }
}
```

## Translation Structure

```json
{
  "FeatureName": {
    "title": "Title",
    "actions": {
      "create": "Create",
      "edit": "Edit",
      "delete": "Delete"
    },
    "form": {
      "fields": {},
      "validation": {},
      "errors": {}
    }
  }
}
```

## Common Patterns

### Data Fetching

```typescript
async function fetchData() {
  try {
    setLoading(true);
    const response = await fetch(`/api/endpoint?locale=${locale}`);
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    setData(data);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}
```

### Form Handling

```typescript
const handleSubmit = async () => {
  try {
    setError(null);
    setLoading(true);
    const response = await fetch("/api/endpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    onSuccess?.(data);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Error Display

```typescript
{error && (
  <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
    {error}
  </Alert>
)}
```

### Loading State

```typescript
<Container pos="relative">
  <LoadingOverlay visible={loading} />
  {/* Content */}
</Container>
```

## API Endpoints

### Projects

#### Update Project

```typescript
// PATCH /api/projects/[id] (preferred)
// PUT /api/projects/[id] (legacy)

// Request body (all fields optional)
{
  "type": "COMMERCIAL",
  "status": "CONSTRUCTION",
  "translations": [
    {
      "language": "en",
      "name": "Project Name",
      "description": "Description"
    }
  ],
  "location": {
    "address": "123 Street",
    "city": "Bangkok",
    "area": "Central",
    "coordinates": {
      "lat": 13.7563,
      "lng": 100.5018
    }
  }
}

// Response
{
  "id": "...",
  "type": "COMMERCIAL",
  "status": "CONSTRUCTION",
  "translations": [...],
  "location": {...},
  "media": [...],
  "yield": {...},
  "pricing": {...},
  "units": [...]
}
```

### Common Patterns

#### Transactions

```typescript
await prisma.$transaction(async (tx) => {
  // Delete old records
  await tx.relatedEntity.deleteMany({...});

  // Create new records
  return tx.mainEntity.update({...});
});
```

#### Error Handling

```typescript
try {
  // Operation
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
    // Handle specific error
  }
  throw error;
}
```

#### Type Guards

```typescript
function isValidData(data: unknown): data is DataType {
  return typeof data === "object" && data !== null && "field" in data;
}
```
