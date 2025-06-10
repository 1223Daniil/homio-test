import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create all roles
  const roles = [
    { 
      name: UserRole.ADMIN,
      permissions: {
        users: ["create", "read", "update", "delete"],
        projects: ["create", "read", "update", "delete"],
        developers: ["create", "read", "update", "delete"],
      }
    },
    { 
      name: UserRole.DEVELOPER,
      permissions: {
        projects: ["create", "read", "update"],
        developers: ["read"],
      }
    },
    { 
      name: UserRole.AGENT,
      permissions: {
        projects: ["read"],
        developers: ["read"],
      }
    },
    { 
      name: UserRole.CLIENT,
      permissions: {
        projects: ["read"],
        developers: ["read"],
      }
    }
  ];

  // Create roles and store their IDs
  const rolesMap: Record<string, string> = {};
  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: {
        name: roleData.name,
        permissions: roleData.permissions,
      },
    });
    rolesMap[role.name] = role.id;
  }

  // Create demo agency
  const agency = await prisma.agency.upsert({
    where: { id: "demo-agency" },
    update: {},
    create: {
      id: "demo-agency",
      name: "Demo Agency",
      description: "A demo real estate agency",
      address: "456 Agency St",
      contactEmail: "agency@homio.pro",
      contactPhone: "+1234567894"
    }
  });

  // Hash password for all users
  const hashedPassword = await bcrypt.hash("H0m!o@dm1n2024", 10);

  // Create system users
  const users = [
    // Admin
    {
      email: "admin@homio.pro",
      username: "admin_system",
      password: hashedPassword,
      name: "Admin User",
      roleId: rolesMap[UserRole.ADMIN]
    },
    // Developer
    {
      email: "developer@homio.pro",
      username: "developer_system",
      password: hashedPassword,
      name: "Developer User",
      roleId: rolesMap[UserRole.DEVELOPER]
    },
    // Agent
    {
      email: "agent@homio.pro",
      username: "agent_system",
      password: hashedPassword,
      name: "Agent User",
      roleId: rolesMap[UserRole.AGENT]
    },
    // Client
    {
      email: "client@homio.pro",
      username: "client_system",
      password: hashedPassword,
      name: "Client User",
      roleId: rolesMap[UserRole.CLIENT]
    }
  ];

  // Create users and their related records
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { 
        email: userData.email,
      },
      update: {
        username: userData.username,
        password: userData.password,
        name: userData.name,
        roleId: userData.roleId,
      },
      create: userData
    });

    // Create related records based on role
    switch (userData.roleId) {
      case rolesMap[UserRole.DEVELOPER]:
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

      case rolesMap[UserRole.AGENT]:
        await prisma.agent.create({
          data: {
            firstName: "Agent",
            lastName: "Demo",
            email: userData.email,
            phone: "+1234567892",
            agencyId: agency.id,
            userId: user.id
          }
        });
        break;

      case rolesMap[UserRole.CLIENT]:
        await prisma.client.create({
          data: {
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

  console.log("✅ System users created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 