import { z } from 'zod';

export const CreateProviderSchema = z.object({
  Name: z.string().min(1).max(100),
  Description: z.string().optional(),
  BaseUrl: z.string().url(),
  ApiKey: z.string().min(10),
});

export const UpdateProviderSchema = CreateProviderSchema.partial();

export const CreateModelSchema = z.object({
  ProviderId: z.string().uuid(),
  ModelName: z.string().min(1),
  InputCostPerM: z.string().regex(/^\d+(\.\d+)?$/),
  OutputCostPerM: z.string().regex(/^\d+(\.\d+)?$/),
  MaxTokens: z.number().int().positive().default(8192),
});

export const ToggleSchema = z.object({
  IsActive: z.boolean(),
});
