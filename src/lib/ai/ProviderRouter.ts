// src/Lib/Ai/ProviderRouter.ts
import { db } from '@/lib/db/Index';
import { eq, and, asc } from 'drizzle-orm';
import { Providers, ProviderModels, RoutingRules } from '@/lib/db/Schema';
import { DecryptApiKey } from '@/Lib/Ai/Crypto';
import type { TaskType } from '@/Lib/Ai/Tools';

export interface ResolvedModel {
  providerId: string;
  providerName: string;
  baseUrl: string;
  modelName: string;
  apiKey: string;
  inputCostPerM: string;
  outputCostPerM: string;
}

// In-memory cache with 60-second TTL
let RouteCache: Map<string, ResolvedModel> | null = null;
let RouteCacheExpiry = 0;
const CACHE_TTL_MS = 60_000;

export function InvalidateProviderCache(): void {
  RouteCache = null;
  RouteCacheExpiry = 0;
}

async function LoadRouteCache(): Promise<Map<string, ResolvedModel>> {
  if (RouteCache && Date.now() < RouteCacheExpiry) return RouteCache;

  const rules = await db
    .select({
      TaskType: RoutingRules.TaskType,
      Priority: RoutingRules.Priority,
      ModelName: ProviderModels.ModelName,
      InputCostPerM: ProviderModels.InputCostPerM,
      OutputCostPerM: ProviderModels.OutputCostPerM,
      BaseUrl: Providers.BaseUrl,
      ApiKeyEnc: Providers.ApiKeyEnc,
      ProviderName: Providers.Name,
      ProviderId: Providers.Id,
    })
    .from(RoutingRules)
    .innerJoin(ProviderModels, eq(RoutingRules.ModelId, ProviderModels.Id))
    .innerJoin(Providers, eq(ProviderModels.ProviderId, Providers.Id))
    .where(and(eq(RoutingRules.IsActive, true), eq(Providers.IsActive, true), eq(ProviderModels.IsActive, true)))
    .orderBy(asc(RoutingRules.Priority));

  const cache = new Map<string, ResolvedModel>();

  for (const rule of rules) {
    // Only store the highest priority (first) for each TaskType
    if (!cache.has(rule.TaskType)) {
      let apiKey: string;
      try {
        apiKey = await DecryptApiKey(rule.ApiKeyEnc);
      } catch {
        continue; // Skip providers with invalid encryption
      }
      cache.set(rule.TaskType, {
        providerId: rule.ProviderId,
        providerName: rule.ProviderName,
        baseUrl: rule.BaseUrl,
        modelName: rule.ModelName,
        apiKey,
        inputCostPerM: rule.InputCostPerM,
        outputCostPerM: rule.OutputCostPerM,
      });
    }
  }

  RouteCache = cache;
  RouteCacheExpiry = Date.now() + CACHE_TTL_MS;
  return cache;
}

export async function GetModelForTask(taskType: TaskType): Promise<ResolvedModel> {
  const cache = await LoadRouteCache();
  const resolved = cache.get(taskType) ?? cache.get('explanation');

  if (resolved) return resolved;

  // Final fallback to env vars
  const fallbackKey = process.env.ANTHROPIC_API_KEY ?? '';
  const fallbackModel = process.env.DEFAULT_AI_MODEL ?? 'claude-haiku-4-5-20251001';
  return {
    providerId: 'env-fallback',
    providerName: 'Anthropic (fallback)',
    baseUrl: 'https://api.anthropic.com',
    modelName: fallbackModel,
    apiKey: fallbackKey,
    inputCostPerM: '1.00',
    outputCostPerM: '5.00',
  };
}
