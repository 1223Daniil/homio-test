import { z } from "zod";
import { UserRole } from "@prisma/client";

export const RoleStatsSchema = z.object({
  admin: z.number(),
  developer: z.number(),
  agent: z.number(),
  client: z.number()
});

export const StatusStatsSchema = z.object({
  draft: z.number(),
  active: z.number(),
  completed: z.number()
});

export const DashboardStatsSchema = z.object({
  users: z.object({
    total: z.number(),
    byRole: RoleStatsSchema
  }),
  developers: z.number(),
  projects: z.object({
    total: z.number(),
    byStatus: StatusStatsSchema
  }),
  courses: z.number()
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const RecentUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().nullable(),
  role: z.nativeEnum(UserRole),
  createdAt: z.string()
});

export type RecentUser = z.infer<typeof RecentUserSchema>;

export const RecentUsersSchema = z.array(RecentUserSchema); 