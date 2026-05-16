/**
 * Mastery.Schemas.ts
 * Zod validation schemas for the Mastery feature.
 */
import { z } from 'zod';

export const RecordSignalSchema = z.object({
  ConceptId:  z.string().uuid(),
  SignalType: z.enum(['quiz_correct', 'quiz_wrong', 'socratic_pass', 'practical_done', 'peer_taught']),
  Value:      z.number().int().min(1).max(100).default(1),
});

export type TRecordSignalInput = z.infer<typeof RecordSignalSchema>;
