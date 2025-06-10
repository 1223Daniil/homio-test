import { z } from "zod";

export const developerTranslationSchema = z.object({
  language: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional()
});
