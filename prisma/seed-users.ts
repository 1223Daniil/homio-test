import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log("🌱 Seeding demo users...");

  try {
    // Create roles if they don't exist
    const roles = await Promise.all(
      Object.values(UserRole).map(async roleName => {
        return prisma.role.upsert({
          where: { name: roleName },
          update: {},
          create: {
            name: roleName,
            permissions: {}
          }
        });
      })
    );

    const rolesMap = roles.reduce(
      (acc, role) => {
        acc[role.name] = role.id;
        return acc;
      },
      {} as Record<string, string>
    );

    // Hash password for all users
    const password = await bcrypt.hash("demo123", 10);

    // Create demo agency first
    const agency = await prisma.agency.create({
      data: {
        name: "Demo Agency",
        description: "A demo real estate agency",
        contactEmail: "agency@demo.com",
        contactPhone: "+1234567890",
        address: "123 Demo Street"
      }
    });

    // Create demo users
    const users = [
      // Admin
      {
        email: "admin@homio.com",
        username: "admin",
        password,
        name: "Admin User",
        roleId: rolesMap.ADMIN
      },
      // Developer
      {
        email: "developer@homio.com",
        username: "developer",
        password,
        name: "Developer User",
        roleId: rolesMap.DEVELOPER
      },
      // Agent
      {
        email: "agent@homio.com",
        username: "agent",
        password,
        name: "Agent User",
        roleId: rolesMap.AGENT
      },
      // Client
      {
        email: "client@homio.com",
        username: "client",
        password,
        name: "Client User",
        roleId: rolesMap.CLIENT
      }
    ];

    // Create users one by one with their related records
    for (const userData of users) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData
      });

      // Create related records based on role
      switch (userData.roleId) {
        case rolesMap.DEVELOPER:
          await prisma.developer.create({
            data: {
              logo: "https://example.com/logo.png",
              website: "https://example.com",
              address: "123 Developer St",
              contactEmail: userData.email,
              contactPhone: "+1234567891",
              users: {
                connect: { id: user.id }
              },
              translations: {
                create: [
                  {
                    language: "en",
                    name: "Demo Developer",
                    description: "A demo developer company"
                  },
                  {
                    language: "ru",
                    name: "Демо Застройщик",
                    description: "Демонстрационная компания застройщика"
                  }
                ]
              }
            }
          });
          break;

        case rolesMap.AGENT:
          await prisma.agent.upsert({
            where: { email: userData.email },
            update: {},
            create: {
              firstName: "Agent",
              lastName: "Demo",
              email: userData.email,
              phone: "+1234567892",
              agencyId: agency.id,
              userId: user.id
            }
          });
          break;

        case rolesMap.CLIENT:
          await prisma.client.upsert({
            where: { email: userData.email },
            update: {},
            create: {
              firstName: "Client",
              lastName: "Demo",
              email: userData.email,
              phone: "+1234567893",
              userId: user.id
            }
          });
          break;
      }
    }

    console.log("✅ Demo users seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding demo users:", error);
    throw error;
  }
}
