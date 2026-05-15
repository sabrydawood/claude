/**
 * Sandbox.Schemas.ts
 * Zod validation for sandbox chat — limits message count and content size.
 */
import { z } from 'zod';

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 10_000;

export const SandboxChatSchema = z.object({
  Messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
    }),
  ).min(1).max(MAX_MESSAGES),
});

export type TSandboxChatInput = z.infer<typeof SandboxChatSchema>;
