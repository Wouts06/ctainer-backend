import { z } from "zod";

export const successSchema = z.object({
  clearanceEventId: z.string().uuid()
});

export const partialSchema = z.object({
  clearanceEventId: z.string()
});


export const failedSchema = z.object({
  clearanceEventId: z.string().uuid(),
  reason: z.string().min(3)
});
