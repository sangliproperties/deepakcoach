import { z } from "zod";

export const recordedSchema = z.object({
  title: z.string().trim().min(2).max(120),

  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120),

  description: z.string().trim().min(2).max(2000),

  durationMins: z.coerce.number().int().min(1).max(10000),

  priceInr: z.coerce.number().int().min(0).max(1000000),

  active: z.boolean().default(false),
});

export const recordedLectureSchema = z.object({
  title: z.string().trim().min(2).max(120),

  description: z.string().trim().max(2000).default(""),

  dayNumber: z.coerce.number().int().min(1).max(10000),

  displayOrder: z.coerce.number().int().min(1).max(10000),

  durationMins: z.coerce.number().int().min(1).max(10000),

  active: z.boolean().default(true),
});
