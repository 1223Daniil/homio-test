# API Design Guidelines

## HTTP Methods

We follow REST principles for our API design:

- GET: Retrieve resources
- POST: Create new resources
- PUT: Full update of resources (legacy support)
- PATCH: Partial update of resources (preferred)
- DELETE: Remove resources

### PATCH vs PUT

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

## Data Structure

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

## Database Operations

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

## Error Handling

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

## Best Practices

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