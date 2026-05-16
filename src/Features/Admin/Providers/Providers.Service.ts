import { db } from '@/lib/db/Index';
import { eq } from 'drizzle-orm';
import { Providers, ProviderModels } from '@/lib/db/Schema';
import { EncryptApiKey } from '@/Lib/Ai/Crypto';
import { InvalidateProviderCache } from '@/Lib/Ai/ProviderRouter';
import { uuidv7 } from 'uuidv7';
import type { z } from 'zod';
import type { CreateProviderSchema, UpdateProviderSchema, CreateModelSchema } from './Providers.Schemas';

export async function ListProviders() {
  return db.select({
    Id:          Providers.Id,
    Name:        Providers.Name,
    Description: Providers.Description,
    BaseUrl:     Providers.BaseUrl,
    IsActive:    Providers.IsActive,
    CreatedAt:   Providers.CreatedAt,
  }).from(Providers).orderBy(Providers.CreatedAt);
}

export async function CreateProvider(data: z.infer<typeof CreateProviderSchema>) {
  const ApiKeyEnc = await EncryptApiKey(data.ApiKey);
  const [provider] = await db.insert(Providers).values({
    Id:          uuidv7(),
    Name:        data.Name,
    Description: data.Description,
    BaseUrl:     data.BaseUrl,
    ApiKeyEnc,
    IsActive:    true,
  }).returning();
  InvalidateProviderCache();
  return provider;
}

export async function UpdateProvider(id: string, data: z.infer<typeof UpdateProviderSchema>) {
  const updates: Record<string, unknown> = { UpdatedAt: new Date() };
  if (data.Name)                    updates.Name        = data.Name;
  if (data.Description !== undefined) updates.Description = data.Description;
  if (data.BaseUrl)                 updates.BaseUrl     = data.BaseUrl;
  if (data.ApiKey)                  updates.ApiKeyEnc   = await EncryptApiKey(data.ApiKey);
  const [provider] = await db.update(Providers)
    .set(updates)
    .where(eq(Providers.Id, id))
    .returning();
  InvalidateProviderCache();
  return provider;
}

export async function ToggleProvider(id: string, isActive: boolean) {
  const [provider] = await db.update(Providers)
    .set({ IsActive: isActive, UpdatedAt: new Date() })
    .where(eq(Providers.Id, id))
    .returning();
  InvalidateProviderCache();
  return provider;
}

export async function ListModels(providerId: string) {
  return db.select().from(ProviderModels).where(eq(ProviderModels.ProviderId, providerId));
}

export async function CreateModel(data: z.infer<typeof CreateModelSchema>) {
  const [model] = await db.insert(ProviderModels).values({
    Id:             uuidv7(),
    ProviderId:     data.ProviderId,
    ModelName:      data.ModelName,
    InputCostPerM:  data.InputCostPerM,
    OutputCostPerM: data.OutputCostPerM,
    MaxTokens:      data.MaxTokens,
    IsActive:       true,
  }).returning();
  InvalidateProviderCache();
  return model;
}
