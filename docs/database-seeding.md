# Database Seeding Best Practices

## Sequential Data Creation

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

## Common Pitfalls

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

## Best Practices

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

## Running Seeds

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