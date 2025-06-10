import { User as PrismaUser, UserRole } from "@prisma/client";

export type UserWithRole = PrismaUser & {
  role: {
    name: UserRole;
  };
};

export interface CustomUser extends Omit<PrismaUser, "password"> {
  role: UserRole;
  phone?: string | null;
  avatar?: string | null;
  developerId: string | null;
}

export type { UserRole, CustomUser as User }; 