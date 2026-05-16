import { z } from 'zod';

export const TaskTypeSchema = z.enum([
  'simple_chat', 'explanation', 'socratic',
  'assessment', 'content_gen', 'translation',
]);

export const UpsertRoutingRuleSchema = z.object({
  TaskType: TaskTypeSchema,
  ModelId:  z.string().uuid(),
  Priority: z.number().int().min(1).max(100).default(1),
});

export const ToggleRuleSchema = z.object({
  IsActive: z.boolean(),
});
