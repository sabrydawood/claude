// src/Lib/Ai/ToolHandlers.ts
// Handlers for every tool declared in Tools.ts (MascotTools).
// Called by the Mascot stream route after the AI emits a tool_use block.

import * as Sentry from '@sentry/nextjs';
import { db } from '@/lib/db/Index';
import { and, eq, inArray } from 'drizzle-orm';
import { Concepts, ConceptChunks, ConceptEdges, StudentMastery, StudentInsights, LearningSignals } from '@/lib/db/Schema';
import { CheckConceptCache, SaveConceptCache, BumpCacheHit } from '@/lib/ai/Cache.Service';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToolResult = { content: string; error?: boolean };

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function HandleTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  userId?: string,
): Promise<ToolResult> {
  try {
    switch (toolName) {
      case 'get_concept':
        return await HandleGetConcept(
          toolInput.concept_id as string,
          (toolInput.detail_level as 'brief' | 'full') ?? 'brief',
        );
      case 'get_prerequisites':
        return await HandleGetPrerequisites(toolInput.concept_id as string);
      case 'check_student_mastery':
        return await HandleCheckMastery(
          toolInput.user_id as string,
          toolInput.concept_id as string,
        );
      case 'get_student_profile':
        return await HandleGetProfile(toolInput.user_id as string);
      case 'get_related_examples':
        return await HandleGetExamples(
          toolInput.concept_id as string,
          toolInput.age_range as string,
        );
      case 'record_signal':
        return await HandleRecordSignal(
          (toolInput.user_id as string) || userId || '',
          toolInput.concept_id as string,
          toolInput.signal_type as string,
          toolInput.value as number,
        );
      default:
        return { content: `أداة غير معروفة: ${toolName}`, error: true };
    }
  } catch (Err) {
    Sentry.captureException(Err, { extra: { toolName, toolInput } });
    const Msg = Err instanceof Error ? Err.message : String(Err);
    return { content: `خطأ في الأداة: ${Msg}`, error: true };
  }
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * get_concept — fetch concept description from ConceptChunks (RAG),
 * with fallback to the concept's own NameAr/NameEn fields.
 */
async function HandleGetConcept(ConceptId: string, DetailLevel: 'brief' | 'full'): Promise<ToolResult> {
  // Check concept cache first (D-001: concept-centric cache)
  const Locale = 'ar'; // default locale for cache key — actual locale passed via context in future
  const Cached = await CheckConceptCache(ConceptId, Locale, DetailLevel);
  if (Cached) {
    BumpCacheHit(Cached.Id);
    return { content: Cached.Answer };
  }

  const Limit = DetailLevel === 'brief' ? 1 : 3;

  const Chunks = await db
    .select({ Content: ConceptChunks.Content })
    .from(ConceptChunks)
    .where(eq(ConceptChunks.ConceptId, ConceptId))
    .limit(Limit);

  if (Chunks.length > 0) {
    const Content = Chunks.map(C => C.Content).join('\n\n');
    // Save to concept cache for future requests
    SaveConceptCache(ConceptId, Locale, DetailLevel, Content);
    return { content: Content };
  }

  // Fallback: return the concept names directly from the Concepts table
  const [Concept] = await db
    .select({ NameAr: Concepts.NameAr, NameEn: Concepts.NameEn })
    .from(Concepts)
    .where(and(eq(Concepts.Id, ConceptId), eq(Concepts.IsDeleted, false)))
    .limit(1);

  if (!Concept) return { content: 'المفهوم غير موجود', error: true };

  const Result = `${Concept.NameAr} (${Concept.NameEn})`;
  SaveConceptCache(ConceptId, Locale, DetailLevel, Result);
  return { content: Result };
}

/**
 * get_prerequisites — find concepts that must be mastered BEFORE this one.
 * Uses ConceptEdges WHERE ToConceptId = ConceptId AND RelationType = 'PREREQUISITE_OF',
 * matching the direction used in Graph.Service.GetPrerequisites.
 */
async function HandleGetPrerequisites(ConceptId: string): Promise<ToolResult> {
  const Edges = await db
    .select({ FromConceptId: ConceptEdges.FromConceptId })
    .from(ConceptEdges)
    .where(
      and(
        eq(ConceptEdges.ToConceptId, ConceptId),
        eq(ConceptEdges.RelationType, 'PREREQUISITE_OF'),
      ),
    )
    .limit(10);

  if (Edges.length === 0) return { content: 'لا توجد متطلبات مسبقة لهذا المفهوم.' };

  const PrereqIds = Edges.map(E => E.FromConceptId);

  const Prereqs = await db
    .select({ NameAr: Concepts.NameAr, NameEn: Concepts.NameEn })
    .from(Concepts)
    .where(and(inArray(Concepts.Id, PrereqIds), eq(Concepts.IsDeleted, false)));

  if (Prereqs.length === 0) return { content: 'لا توجد متطلبات مسبقة لهذا المفهوم.' };

  return { content: `المتطلبات المسبقة: ${Prereqs.map(C => C.NameAr).join('، ')}` };
}

/**
 * check_student_mastery — return a student's mastery score (0-100) for a concept.
 * Derives a human-readable level label from the numeric score.
 */
async function HandleCheckMastery(UserId: string, ConceptId: string): Promise<ToolResult> {
  const [Mastery] = await db
    .select({ Score: StudentMastery.Score })
    .from(StudentMastery)
    .where(
      and(
        eq(StudentMastery.UserId, UserId),
        eq(StudentMastery.ConceptId, ConceptId),
      ),
    )
    .limit(1);

  if (!Mastery) return { content: 'لم يتعلم الطالب هذا المفهوم بعد (مستوى: 0%)' };

  const Level =
    Mastery.Score >= 80 ? 'متقن'
    : Mastery.Score >= 50 ? 'متوسط'
    : 'يحتاج تدعيم';

  return { content: `مستوى الإتقان: ${Mastery.Score}% — ${Level}` };
}

/**
 * get_student_profile — return the student's learning insights summary.
 * StudentInsights stores a single JSON string per user in the Insights column.
 */
async function HandleGetProfile(UserId: string): Promise<ToolResult> {
  const [Row] = await db
    .select({ Insights: StudentInsights.Insights })
    .from(StudentInsights)
    .where(eq(StudentInsights.UserId, UserId))
    .limit(1);

  if (!Row) return { content: 'لا توجد بيانات شخصية للطالب بعد.' };

  try {
    const Parsed = JSON.parse(Row.Insights) as Record<string, unknown>;
    const Entries = Object.entries(Parsed);
    if (Entries.length === 0) return { content: 'لا توجد بيانات شخصية للطالب بعد.' };
    return { content: Entries.map(([K, V]) => `${K}: ${JSON.stringify(V)}`).join('\n') };
  } catch {
    return { content: Row.Insights };
  }
}

/**
 * get_related_examples — fetch example concepts linked via EXAMPLE_OF edges,
 * then return their chunks. Falls back to a note if none found.
 * ConceptChunks has no ChunkType column — the graph edge is the source of truth.
 */
async function HandleGetExamples(ConceptId: string, AgeRange: string): Promise<ToolResult> {
  // Find concepts that are examples of this concept (EXAMPLE_OF edges from examples → concept)
  const ExampleEdges = await db
    .select({ FromConceptId: ConceptEdges.FromConceptId })
    .from(ConceptEdges)
    .where(
      and(
        eq(ConceptEdges.ToConceptId, ConceptId),
        eq(ConceptEdges.RelationType, 'EXAMPLE_OF'),
      ),
    )
    .limit(3);

  if (ExampleEdges.length > 0) {
    const ExampleIds = ExampleEdges.map(E => E.FromConceptId);
    const Chunks = await db
      .select({ Content: ConceptChunks.Content })
      .from(ConceptChunks)
      .where(inArray(ConceptChunks.ConceptId, ExampleIds))
      .limit(3);

    if (Chunks.length > 0) {
      return { content: Chunks.map(C => C.Content).join('\n\n') };
    }
  }

  // Fallback: return chunks directly from this concept
  const Chunks = await db
    .select({ Content: ConceptChunks.Content })
    .from(ConceptChunks)
    .where(eq(ConceptChunks.ConceptId, ConceptId))
    .limit(2);

  if (Chunks.length > 0) {
    return { content: Chunks.map(C => C.Content).join('\n\n') };
  }

  return { content: `لا تتوفر أمثلة محددة لهذا المفهوم للفئة العمرية ${AgeRange}` };
}

/**
 * record_signal — insert a LearningSignals row.
 * Id and CreatedAt are generated by the DB defaults — no need to provide them.
 * Value is an integer column (not text).
 */
async function HandleRecordSignal(
  UserId: string,
  ConceptId: string,
  SignalType: string,
  Value: number,
): Promise<ToolResult> {
  await db.insert(LearningSignals).values({
    UserId,
    ConceptId,
    SignalType,
    Value: Math.round(Value), // DB column is integer
  });

  return { content: 'تم تسجيل الـ signal بنجاح.' };
}
