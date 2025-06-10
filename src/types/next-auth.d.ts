import { User as PrismaUser, UserRole } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User extends Omit<PrismaUser, "password"> {
    role: UserRole;
    developerId: string | null;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    developerId: string | null;
  }
}
