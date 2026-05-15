/**
 * Keys.Schemas.ts
 * Zod validation for API key storage.
 */
import { z } from 'zod';

export const SaveKeySchema = z.object({
  ApiKey: z.string()
    .min(10)
    .max(120)
    .refine((V) => V.startsWith('sk-ant-'), {
      message: 'مفتاح غير صحيح — لازم يبدأ بـ sk-ant-',
    }),
});

export type TSaveKeyInput = z.infer<typeof SaveKeySchema>;
