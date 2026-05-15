// @ts-nocheck
// Deprecated: replaced by per-entity translation tables (AgentTranslations, LessonTranslations, etc.)
/**
 * Helper utilities for querying the translations table.
 *
 * Usage:
 *   const t = await getTranslations('agent', agentId, 'ar');
 *   console.log(t.name, t.description);
 *
 *   await setTranslation('agent', agentId, 'fr', 'name', 'Claude');
 *   await upsertTranslations('agent', agentId, 'fr', { name: 'Claude', description: '...' });
 */
import { and, eq, inArray } from 'drizzle-orm';
import { db } from './index';
import { translations, type TranslationMap } from './Schema';

// ─── Read ─────────────────────────────────────────────────────────────────────

/** Returns all fields for one entity+locale as a plain object { field: value } */
export async function getTranslations(
  entityType: string,
  entityId: number,
  locale: string,
): Promise<TranslationMap> {
  const rows = await db
    .select({ field: translations.field, value: translations.value })
    .from(translations)
    .where(
      and(
        eq(translations.entityType, entityType),
        eq(translations.entityId, entityId),
        eq(translations.locale, locale),
      ),
    );
  return Object.fromEntries(rows.map((r) => [r.field, r.value]));
}

/** Returns all locales available for a given entity */
export async function getAvailableLocales(
  entityType: string,
  entityId: number,
): Promise<string[]> {
  const rows = await db
    .selectDistinct({ locale: translations.locale })
    .from(translations)
    .where(
      and(
        eq(translations.entityType, entityType),
        eq(translations.entityId, entityId),
      ),
    );
  return rows.map((r) => r.locale);
}

/**
 * Batch-load translations for multiple entities of the same type.
 * Returns a Map keyed by entityId.
 *
 * Example:
 *   const map = await batchGetTranslations('lesson', [1, 2, 3], 'ar');
 *   const t = map.get(1); // { title: '...', description: '...', content: '...' }
 */
export async function batchGetTranslations(
  entityType: string,
  entityIds: number[],
  locale: string,
): Promise<Map<number, TranslationMap>> {
  if (entityIds.length === 0) return new Map();

  const rows = await db
    .select({
      entityId: translations.entityId,
      field: translations.field,
      value: translations.value,
    })
    .from(translations)
    .where(
      and(
        eq(translations.entityType, entityType),
        inArray(translations.entityId, entityIds),
        eq(translations.locale, locale),
      ),
    );

  const result = new Map<number, TranslationMap>();
  for (const row of rows) {
    if (!result.has(row.entityId)) result.set(row.entityId, {});
    result.get(row.entityId)![row.field] = row.value;
  }
  return result;
}

// ─── Write ────────────────────────────────────────────────────────────────────

/** Insert or update a single translation field */
export async function upsertTranslation(
  entityType: string,
  entityId: number,
  locale: string,
  field: string,
  value: string,
): Promise<void> {
  await db
    .insert(translations)
    .values({ entityType, entityId, locale, field, value })
    .onConflictDoUpdate({
      target: [
        translations.entityType,
        translations.entityId,
        translations.locale,
        translations.field,
      ],
      set: { value },
    });
}

/** Insert or update multiple fields at once for one entity+locale */
export async function upsertTranslations(
  entityType: string,
  entityId: number,
  locale: string,
  fields: TranslationMap,
): Promise<void> {
  const values = Object.entries(fields).map(([field, value]) => ({
    entityType,
    entityId,
    locale,
    field,
    value,
  }));

  if (values.length === 0) return;

  await db
    .insert(translations)
    .values(values)
    .onConflictDoUpdate({
      target: [
        translations.entityType,
        translations.entityId,
        translations.locale,
        translations.field,
      ],
      set: { value: translations.value },
    });
}

/** Delete all translations for one entity+locale (useful when removing a language) */
export async function deleteTranslations(
  entityType: string,
  entityId: number,
  locale: string,
): Promise<void> {
  await db
    .delete(translations)
    .where(
      and(
        eq(translations.entityType, entityType),
        eq(translations.entityId, entityId),
        eq(translations.locale, locale),
      ),
    );
}
