/**
 * Cache.Service.ts
 * Permanent semantic cache for Mascot AI responses.
 * Reduces AI costs by returning cached answers for repeated questions.
 * Cache never expires — grows as a knowledge base.
 */

import { db } from '@/lib/db/Index';
import { SemanticCache } from '@/lib/db/Schema';
import { eq, sql } from 'drizzle-orm';

// SHA-256 hash using Web Crypto API (Bun native)
async function Sha256(Text: string): Promise<string> {
  const Data = new TextEncoder().encode(Text);
  const Hash = await crypto.subtle.digest('SHA-256', Data);
  return Array.from(new Uint8Array(Hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Build cache key from question + page context + locale
export async function BuildCacheKey(Question: string, PageKey: string, Locale: string): Promise<string> {
  return Sha256(`${Question.trim().slice(0, 500)}::${PageKey}::${Locale}`);
}

// Extract a simple page key from the pathname
export function GetPageKey(Pathname: string): string {
  const LessonMatch = Pathname.match(/\/lessons\/([^/]+)/);
  if (LessonMatch) return `lesson:${LessonMatch[1]}`;
  if (Pathname.includes('/dashboard'))   return 'page:dashboard';
  if (Pathname.includes('/agents'))      return 'page:agents';
  if (Pathname.includes('/sandbox'))     return 'page:sandbox';
  if (Pathname.includes('/leaderboard')) return 'page:leaderboard';
  return 'page:home';
}

export interface ICacheEntry {
  Id: string;
  Answer: string;
  HitCount: number;
}

// Check cache by hash — returns entry if found, null if miss
export async function CheckCache(QuestionHash: string): Promise<ICacheEntry | null> {
  const [Row] = await db
    .select({ Id: SemanticCache.Id, Answer: SemanticCache.Answer, HitCount: SemanticCache.HitCount })
    .from(SemanticCache)
    .where(eq(SemanticCache.QuestionHash, QuestionHash))
    .limit(1);
  return Row ?? null;
}

// Increment hit counter (fire-and-forget)
export function BumpCacheHit(CacheId: string): void {
  db.update(SemanticCache)
    .set({ HitCount: sql`${SemanticCache.HitCount} + 1` })
    .where(eq(SemanticCache.Id, CacheId))
    .catch(() => {});
}

// Save a new cache entry (fire-and-forget)
export function SaveToCache(
  QuestionHash: string,
  Question: string,
  Answer: string,
  PageKey: string,
  Locale: string,
): void {
  if (!Answer.trim()) return;
  db.insert(SemanticCache)
    .values({ QuestionHash, Question, Answer, PageKey, Locale })
    .catch(() => {}); // best-effort, never block the response
}

// Get cache statistics for the dev dashboard
export async function GetCacheStats(): Promise<{
  TotalEntries: number;
  TotalHits: number;
  ConceptEntries: number;
  ConceptHits: number;
}> {
  const Rows = await db.select({ HitCount: SemanticCache.HitCount, QuestionHash: SemanticCache.QuestionHash }).from(SemanticCache);
  const ConceptRows = Rows.filter(r => r.QuestionHash.startsWith('concept::'));
  return {
    TotalEntries: Rows.length,
    TotalHits: Rows.reduce((sum, r) => sum + r.HitCount, 0),
    ConceptEntries: ConceptRows.length,
    ConceptHits: ConceptRows.reduce((sum, r) => sum + r.HitCount, 0),
  };
}

// ─── Concept-centric Cache (D-001) ────────────────────────────────────────────
// Caches concept explanations by concept_id, not by question text.
// Hit rate target: 40-60% (vs 1-5% for question-based cache).

export function BuildConceptCacheKey(ConceptId: string, Locale: string, DetailLevel: string): string {
  return `concept::${ConceptId}::${Locale}::${DetailLevel}`;
}

export async function CheckConceptCache(
  ConceptId: string,
  Locale: string,
  DetailLevel: string,
): Promise<ICacheEntry | null> {
  const Key = BuildConceptCacheKey(ConceptId, Locale, DetailLevel);
  return CheckCache(Key);
}

export function SaveConceptCache(
  ConceptId: string,
  Locale: string,
  DetailLevel: string,
  Answer: string,
): void {
  const Key = BuildConceptCacheKey(ConceptId, Locale, DetailLevel);
  SaveToCache(Key, `concept:${ConceptId}`, Answer, `concept:${ConceptId}`, Locale);
}

export async function GetConceptCacheStats(): Promise<{ Entries: number; TotalHits: number }> {
  const Rows = await db
    .select({ HitCount: SemanticCache.HitCount })
    .from(SemanticCache)
    .where(sql`${SemanticCache.QuestionHash} LIKE 'concept::%'`);
  return {
    Entries: Rows.length,
    TotalHits: Rows.reduce((sum, r) => sum + r.HitCount, 0),
  };
}
