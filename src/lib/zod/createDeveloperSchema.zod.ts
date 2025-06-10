import { developerTranslationSchema } from "./developerTranslationSchema.zod";
import { z } from "zod";

export const createDeveloperSchema = z.object({
  logo: z.string().nullable().optional(),
  banner: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  address: z.string().nullable().optional(),
  contactEmail: z.string().email().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  establishedYear: z.coerce
    .number()
    .min(1900)
    .max(new Date().getFullYear())
    .nullable()
    .optional(),
  completedUnits: z.coerce.number().min(0).nullable().optional(),
  completedProjects: z.coerce.number().min(0).nullable().optional(),
  ongoingUnits: z.coerce.number().min(0).nullable().optional(),
  ongoingProjects: z.coerce.number().min(0).nullable().optional(),
  deliveryRate: z.coerce
    .number()
    .min(0)
    .max(100)
    .transform(val => (val ? Number(val) : null))
    .nullable()
    .optional(),
  translations: z.array(developerTranslationSchema)
});
