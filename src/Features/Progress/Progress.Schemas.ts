/**
 * Progress.Schemas.ts
 * Zod schemas for the Progress feature.
 * XpEarned is intentionally excluded — computed server-side from DB.
 */
import { z } from 'zod';

/** Schema for completing a lesson. Score is validated 0-100. No XP from client. */
export const LessonCompletionSchema = z.object({
  Score: z.number().int().min(0).max(100),
});

export type TLessonCompletionInput = z.infer<typeof LessonCompletionSchema>;
