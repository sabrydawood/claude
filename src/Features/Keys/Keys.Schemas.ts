import { z } from 'zod';

export const PROVIDER_VALUES = ['anthropic', 'openai', 'gemini', 'openrouter'] as const;
export type TProvider = typeof PROVIDER_VALUES[number];

export const SaveKeySchema = z.object({
  Provider: z.enum(PROVIDER_VALUES),
  ApiKey:   z.string().min(10).max(200),
});

export type TSaveKeyInput = z.infer<typeof SaveKeySchema>;
