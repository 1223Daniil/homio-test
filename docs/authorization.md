# Authorization System Documentation

## Overview

The project uses a role-based authorization system implemented with Next.js, NextAuth.js, and custom middleware. The system consists of several layers of protection and role-based access control, integrated with i18n support.

## User Roles

The system uses a database-driven role system with the following default roles (defined in `UserRole` enum):
- `ADMIN` - Full access to all features and management capabilities
- `DEVELOPER` - Access to development-related features and project management
- `AGENT` - Limited access to projects and courses
- `CLIENT` - Basic access to public features

Roles are stored in the database and linked to users through a relation. Some roles (like DEVELOPER) may have additional attributes (developerId).

## Implementation Components

### 1. Authentication Hook (`useAuth`)

Located in `src/hooks/useAuth.ts`, this hook provides:

#### Authentication Functions:
- `login(email, password)` - Handles user login with credentials
- `logout()` - Handles user logout with proper session cleanup
- `requireAuth()` - Enforces authentication with locale support
- `requireSuperAdmin()` - Enforces admin-only access

#### Role Check Functions:
- `isAdmin()` - Checks if user has admin role
- `isDeveloper()` - Checks if user has developer role
- `hasRole(roles)` - Checks if user has any of the specified roles
- `canAccessProjects()` - Checks if user can access projects (Admin, Developer, Agent)
- `canEditProject()` - Checks if user can edit projects (Admin, Developer)
- `canAccessCourses()` - Checks if user can access courses (Admin, Developer, Agent)

### 2. Middleware Protection

The middleware (`middleware.ts`) provides route-based protection with i18n support:

```typescript
const ROUTES = {
  public: [
    "/[locale]/login",
    "/[locale]/login/error",
    "/[locale]/error",
    "/api/auth",
    "/api/auth/*"
  ],

  protected: {
    admin: [
      "/[locale]/management",
      "/[locale]/management/*",
      "/[locale]/admin",
      "/[locale]/admin/*"
    ],

    developer: [
      "/[locale]/projects/new",
      "/[locale]/projects/[id]/edit"
    ],

    projects: [
      "/[locale]/projects",
      "/[locale]/projects/[id]"
    ],

    courses: [
      "/[locale]/courses",
      "/[locale]/courses/*"
    ],

    common: [
      "/[locale]",
      "/[locale]/dashboard",
      "/[locale]/profile",
      "/[locale]/search"
    ]
  }
};
```

### 3. Server-Side Protection

Server components and API routes use server-side validation with proper error handling:

```typescript
// Server-side role validation
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();
  if (!session.user?.role || !allowedRoles.includes(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session;
}

// API route protection
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(null, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    });

    if (!user) {
      return NextResponse.json(null, { status: 401 });
    }

    const { password, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 4. Database Integration

The system uses Prisma for database operations with the following schema:

```prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  password    String
  name        String
  role        Role      @relation(fields: [roleId], references: [id])
  roleId      String
  developerId String?
  // ... other fields
}

model Role {
  id    String @id @default(cuid())
  name  String @unique
  users User[]
}
```

## Usage Examples

### 1. Protected Pages

```typescript
// Client-side protection with i18n
export default function ProtectedPage() {
  const { requireAuth } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);
  
  return <ProtectedContent />;
}

// Server-side protection
export default async function AdminPage() {
  const session = await requireRole([UserRole.ADMIN]);
  return <AdminContent session={session} />;
}
```

### 2. Conditional Rendering

```typescript
function ProjectActions({ project }: { project: Project }) {
  const { isDeveloper, isAdmin } = useAuth();
  
  return (
    <div>
      {(isDeveloper() || isAdmin()) && (
        <Button
          onClick={() => router.push(`/projects/${project.id}/edit`)}
        >
          Edit Project
        </Button>
      )}
    </div>
  );
}
```

### 3. API Route Protection

```typescript
export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.role || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Handle request with proper error handling
    const data = await prisma.someModel.findMany();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Best Practices

1. **Multiple Layers of Protection**
   - Use typed middleware for route-level protection
   - Implement component-level checks with proper hooks
   - Always validate on the server side with database integration
   - Handle i18n routes properly

2. **Role-Based Access**
   - Use database-driven roles
   - Implement role hierarchy when needed
   - Use specific capability checks
   - Handle developer-specific features

3. **Error Handling**
   - Provide clear error messages with i18n support
   - Implement proper redirects with locale
   - Handle loading states in UI
   - Log errors properly

4. **Security Considerations**
   - Never trust client-side checks alone
   - Always validate sessions server-side
   - Use HTTPS for all requests
   - Implement proper CSRF protection
   - Sanitize user input
   - Handle sensitive data properly

## Common Patterns

### Protected Routes
```typescript
// pages/[locale]/protected/page.tsx
export default function ProtectedPage() {
  const { requireAuth } = useAuth();
  const locale = useLocale();
  
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);
  
  return <ProtectedContent />;
}
```

### Role-Based Access
```typescript
// components/AdminPanel.tsx
export function AdminPanel() {
  const { isAdmin } = useAuth();
  const t = useTranslations();
  
  if (!isAdmin()) {
    return (
      <div className="text-center">
        {t("common.accessDenied")}
      </div>
    );
  }
  
  return <AdminContent />;
}
```

### API Protection
```typescript
// app/api/protected/route.ts
export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Handle request
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Troubleshooting

Common issues and solutions:

1. **Circular Redirects**
   - Ensure middleware and client-side checks are consistent
   - Check for proper role validation
   - Verify redirect paths include locale
   - Check session handling

2. **Access Control Issues**
   - Verify role assignments in database
   - Check middleware configuration
   - Validate session handling
   - Check role hierarchy

3. **Session Problems**
   - Check session persistence
   - Verify token expiration
   - Validate session storage
   - Check for proper session updates

4. **i18n Issues**
   - Verify locale in URLs
   - Check middleware handling of locales
   - Validate translations
   - Check redirect URLs

## Future Improvements

1. Implement permission-based access control
2. Add role hierarchies with inheritance
3. Implement audit logging for security events
4. Add two-factor authentication
5. Enhance session management
6. Add rate limiting for auth endpoints
7. Implement OAuth providers
8. Add IP-based access control 