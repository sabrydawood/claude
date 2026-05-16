import { z } from 'zod';

export const CreateSandboxConvSchema = z.object({});

export const SaveMascotPairSchema = z.object({
  ConversationId: z.string().uuid().optional(),
  Route:          z.string().min(1).max(500),
  UserMessage:    z.string().min(1).max(10_000),
  AssistMessage:  z.string().min(1).max(20_000),
  Provider:       z.string().max(50).optional(),
});

export type TSaveMascotPair = z.infer<typeof SaveMascotPairSchema>;
