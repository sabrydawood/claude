/**
 * Mascot.Schemas.ts
 * Zod validation for mascot chat requests.
 */
import { z } from 'zod';
import { SUPPORTED_LOCALES } from '@/Shared/Types/Common.Types';

export const MascotChatSchema = z.object({
  Messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().max(5_000),
    }),
  ).min(1).max(12)
   .transform(msgs => msgs.filter(m => m.content.trim().length > 0)), // strip empty assistant messages
  Pathname: z.string().max(500).default('/'),
  Locale: z.enum(SUPPORTED_LOCALES as unknown as [string, ...string[]]).default('ar'),
});

export type TMascotChatInput = z.infer<typeof MascotChatSchema>;
