import { db } from '@/lib/db/Index';
import { eq, asc } from 'drizzle-orm';
import { RoutingRules, ProviderModels, Providers } from '@/lib/db/Schema';
import { InvalidateProviderCache } from '@/lib/ai/ProviderRouter';
import { uuidv7 } from 'uuidv7';
import type { z } from 'zod';
import type { UpsertRoutingRuleSchema } from './RoutingRules.Schemas';

export async function ListRoutingRules() {
  return db
    .select({
      Id:           RoutingRules.Id,
      TaskType:     RoutingRules.TaskType,
      Priority:     RoutingRules.Priority,
      IsActive:     RoutingRules.IsActive,
      ModelName:    ProviderModels.ModelName,
      ProviderName: Providers.Name,
      ModelId:      RoutingRules.ModelId,
    })
    .from(RoutingRules)
    .innerJoin(ProviderModels, eq(RoutingRules.ModelId, ProviderModels.Id))
    .innerJoin(Providers, eq(ProviderModels.ProviderId, Providers.Id))
    .orderBy(asc(RoutingRules.Priority));
}

export async function UpsertRoutingRule(data: z.infer<typeof UpsertRoutingRuleSchema>) {
  const [rule] = await db
    .insert(RoutingRules)
    .values({ Id: uuidv7(), ...data, IsActive: true, UpdatedAt: new Date() })
    .onConflictDoUpdate({
      target: [RoutingRules.TaskType, RoutingRules.ModelId],
      set: { Priority: data.Priority, IsActive: true, UpdatedAt: new Date() },
    })
    .returning();
  InvalidateProviderCache();
  return rule;
}

export async function ToggleRule(id: string, isActive: boolean) {
  const [rule] = await db
    .update(RoutingRules)
    .set({ IsActive: isActive, UpdatedAt: new Date() })
    .where(eq(RoutingRules.Id, id))
    .returning();
  InvalidateProviderCache();
  return rule;
}
