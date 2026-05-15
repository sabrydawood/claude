/**
 * Admin.Schemas.ts
 */
import { z } from 'zod';

export const CreateLessonSchema = z.object({
  AgentId:        z.string().uuid(),
  Order:          z.number().int().min(0).optional(),
  XpReward:       z.number().int().min(1).max(1000).optional(),
  EstimatedMinutes: z.number().int().min(1).max(120).optional(),
  TitleAr:        z.string().min(3).max(200),
  TitleEn:        z.string().min(3).max(200),
  DescriptionAr:  z.string().max(500).optional(),
  DescriptionEn:  z.string().max(500).optional(),
});

export type TCreateLessonInput = z.infer<typeof CreateLessonSchema>;
