# Database Management with Prisma and Next.js 15

This document describes how to work with the PostgreSQL database in Docker environment and Prisma ORM.

## Configuration

### Database Container

The database is configured using Docker Compose:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: homio_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-homio}
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-homio}"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### Prisma Configuration

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### Environment Variables

```env
# .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/homio"
```

## Data Access with Prisma

### Server Components

```typescript
// app/[locale]/projects/page.tsx
import { prisma } from '@/lib/prisma';

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      developer: true,
    },
  });
  
  return <ProjectsList projects={projects} />;
}
```

### Server Actions

```typescript
// app/[locale]/projects/actions.ts
'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createProject(data: ProjectCreateInput) {
  const project = await prisma.project.create({
    data,
    include: {
      developer: true,
    },
  });
  
  revalidatePath('/projects');
  return project;
}
```

### Route Handlers

```typescript
// app/api/projects/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const projects = await prisma.project.findMany();
  return NextResponse.json(projects);
}
```

## Database Operations

### Backup and Restore

#### Creating a Backup

```bash
./scripts/backup-db.sh
```

This will:
1. Create a timestamped SQL dump
2. Compress it with gzip
3. Save it to the `backup` directory

#### Restoring from Backup

```bash
./scripts/restore-db.sh ./backup/backup_20240101_120000.sql.gz
```

### Prisma Operations

```bash
# Generate Prisma Client
yarn prisma generate

# Run migrations
yarn prisma migrate deploy

# Reset database
yarn prisma migrate reset

# Seed data
yarn prisma db seed
```

## Development Setup

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Start the database:
```bash
docker-compose up -d
```

3. Initialize the database:
```bash
# Run migrations
yarn prisma migrate deploy

# Seed minimal data
yarn prisma db seed
```

## Best Practices

### 1. Use Server Components

```typescript
// ✅ Good: Data fetching in Server Component
export default async function Page() {
  const data = await prisma.project.findMany();
  return <Component data={data} />;
}

// ❌ Bad: Data fetching in Client Component
'use client'
export default function Page() {
  const { data } = useQuery(['projects'], fetchProjects);
  return <Component data={data} />;
}
```

### 2. Implement Server Actions

```typescript
// ✅ Good: Server Action for mutations
export async function createProject(data: ProjectCreateInput) {
  const project = await prisma.project.create({ data });
  revalidatePath('/projects');
  return project;
}

// ❌ Bad: API route for mutations
export async function POST(req: Request) {
  const data = await req.json();
  const project = await prisma.project.create({ data });
  return NextResponse.json(project);
}
```

### 3. Handle Transactions

```typescript
// ✅ Good: Use transactions for related operations
const result = await prisma.$transaction(async (tx) => {
  const project = await tx.project.create({ data });
  await tx.activity.create({
    data: { type: 'PROJECT_CREATED', projectId: project.id }
  });
  return project;
});
```

### 4. Error Handling

```typescript
try {
  const result = await prisma.project.create({ data });
  return result;
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new Error('Unique constraint violation');
    }
  }
  throw error;
}
```

## Troubleshooting

### Common Issues

1. **Prisma Client Generation**
   - Run `yarn prisma generate` after schema changes
   - Check if Prisma Client is imported correctly
   - Verify TypeScript types are up to date

2. **Database Connection**
   - Verify DATABASE_URL in .env
   - Check if container is healthy
   - Ensure port is exposed correctly

3. **Migration Issues**
   - Check migration history
   - Use `prisma migrate reset` for clean start
   - Review migration files for conflicts

### Data Recovery

1. Stop the container and services
```bash
docker-compose down
```

2. Restore from backup
```bash
./scripts/restore-db.sh ./backup/latest_backup.sql.gz
```

3. Restart and verify
```bash
docker-compose up -d
yarn prisma migrate status
```

## Data Models

### Core Models

```prisma
model Property {
  id          String      @id @default(cuid())
  title       String
  description String?
  price       Float?
  status      PropertyStatus
  type        PropertyType
  location    Location?   @relation(fields: [locationId], references: [id])
  locationId  String?
  project     Project?    @relation(fields: [projectId], references: [id])
  projectId   String?
  units       Unit[]
  features    Feature[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Vector search
  titleVector        Unsupported("vector")?
  descriptionVector  Unsupported("vector")?
}

model Unit {
  id          String    @id @default(cuid())
  number      String
  floor       Int
  rooms       Int
  area        Float
  price       Float?
  status      UnitStatus
  property    Property  @relation(fields: [propertyId], references: [id])
  propertyId  String
  features    Feature[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Feature {
  id          String    @id @default(cuid())
  name        String
  value       String?
  properties  Property[]
  units       Unit[]
}
```

### Vector Search Configuration

```sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector columns
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS title_vector vector(384);
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS description_vector vector(384);

-- Create vector index
CREATE INDEX IF NOT EXISTS property_title_vector_idx ON "Property" USING ivfflat (title_vector vector_cosine_ops);
CREATE INDEX IF NOT EXISTS property_description_vector_idx ON "Property" USING ivfflat (description_vector vector_cosine_ops);
```

## Server Actions Examples

```typescript
// app/[locale]/properties/actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { generateEmbedding } from '@/lib/ai'

export async function createProperty(data: PropertyCreateInput) {
  const [titleVector, descriptionVector] = await Promise.all([
    generateEmbedding(data.title),
    data.description ? generateEmbedding(data.description) : null
  ]);

  const property = await prisma.property.create({
    data: {
      ...data,
      titleVector,
      descriptionVector
    },
    include: {
      location: true,
      features: true
    }
  });
  
  revalidatePath('/properties');
  return property;
}

export async function searchProperties(query: string) {
  const queryVector = await generateEmbedding(query);
  
  const properties = await prisma.$queryRaw`
    SELECT *, (title_vector <=> ${queryVector}::vector) as similarity
    FROM "Property"
    WHERE title_vector IS NOT NULL
    ORDER BY similarity
    LIMIT 10
  `;
  
  return properties;
}
``` 