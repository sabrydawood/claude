/**
 * Graph.Service.ts
 * Knowledge Graph query service — ALI Phase 1.
 *
 * Provides functions for querying concepts, edges, and student mastery
 * from the graph layer. All queries filter IsDeleted = false on Concepts.
 */
import { db } from '@/lib/db/Index';
import { Concepts, ConceptEdges, StudentMastery } from '@/lib/db/Schema';
import { and, eq, inArray, or, ilike } from 'drizzle-orm';
import type { IConceptNode, IConceptEdge, IGraphState, IStudentGraphState } from './Graph.Types';

// ─── Internal helpers ──────────────────────────────────────────────────────────

function MapConceptRow(Row: typeof Concepts.$inferSelect): IConceptNode {
  return {
    Id:         Row.Id,
    NameAr:     Row.NameAr,
    NameEn:     Row.NameEn,
    Difficulty: Row.Difficulty,
    Type:       Row.Type,
  };
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Get a single concept by ID.
 * Returns null if not found or soft-deleted.
 */
export async function GetConceptById(ConceptId: string): Promise<IConceptNode | null> {
  const Rows = await db
    .select()
    .from(Concepts)
    .where(and(eq(Concepts.Id, ConceptId), eq(Concepts.IsDeleted, false)))
    .limit(1);

  return Rows[0] ? MapConceptRow(Rows[0]) : null;
}

/**
 * Get all concepts that MUST be learned before this concept.
 * Traverses PREREQUISITE_OF edges where ToConceptId = ConceptId.
 */
export async function GetPrerequisites(ConceptId: string): Promise<IConceptNode[]> {
  // Find edges where this concept is the target (i.e. others are prerequisites)
  const Edges = await db
    .select({ FromConceptId: ConceptEdges.FromConceptId })
    .from(ConceptEdges)
    .where(
      and(
        eq(ConceptEdges.ToConceptId, ConceptId),
        eq(ConceptEdges.RelationType, 'PREREQUISITE_OF'),
      ),
    );

  if (Edges.length === 0) return [];

  const Ids = Edges.map((E) => E.FromConceptId);
  const Rows = await db
    .select()
    .from(Concepts)
    .where(and(inArray(Concepts.Id, Ids), eq(Concepts.IsDeleted, false)));

  return Rows.map(MapConceptRow);
}

/**
 * Get all concepts unlocked BY mastering this concept.
 * Traverses PREREQUISITE_OF edges where FromConceptId = ConceptId.
 */
export async function GetUnlocks(ConceptId: string): Promise<IConceptNode[]> {
  // Find edges where this concept is the source prerequisite
  const Edges = await db
    .select({ ToConceptId: ConceptEdges.ToConceptId })
    .from(ConceptEdges)
    .where(
      and(
        eq(ConceptEdges.FromConceptId, ConceptId),
        eq(ConceptEdges.RelationType, 'PREREQUISITE_OF'),
      ),
    );

  if (Edges.length === 0) return [];

  const Ids = Edges.map((E) => E.ToConceptId);
  const Rows = await db
    .select()
    .from(Concepts)
    .where(and(inArray(Concepts.Id, Ids), eq(Concepts.IsDeleted, false)));

  return Rows.map(MapConceptRow);
}

/**
 * Get the full Knowledge Graph — all active concepts and their edges.
 * Used for rendering the concept map.
 * Locale is accepted for future use (e.g. locale-filtered chunks) but
 * concept nodes currently include both NameAr and NameEn.
 */
export async function GetFullGraph(_Locale: 'ar' | 'en'): Promise<IGraphState> {
  const [ConceptRows, EdgeRows] = await Promise.all([
    db.select().from(Concepts).where(eq(Concepts.IsDeleted, false)),
    db.select({
      FromConceptId: ConceptEdges.FromConceptId,
      ToConceptId:   ConceptEdges.ToConceptId,
      RelationType:  ConceptEdges.RelationType,
    }).from(ConceptEdges),
  ]);

  const ConceptList: IConceptNode[] = ConceptRows.map(MapConceptRow);
  const EdgeList: IConceptEdge[] = EdgeRows;

  return { Concepts: ConceptList, Edges: EdgeList };
}

/**
 * Get the Knowledge Graph overlaid with a student's mastery scores.
 * Returns the full graph plus a MasteryMap keyed by concept ID.
 */
export async function GetStudentGraphState(
  UserId: string,
  Locale: 'ar' | 'en',
): Promise<IStudentGraphState> {
  const [BaseGraph, MasteryRows] = await Promise.all([
    GetFullGraph(Locale),
    db
      .select({ ConceptId: StudentMastery.ConceptId, Score: StudentMastery.Score })
      .from(StudentMastery)
      .where(eq(StudentMastery.UserId, UserId)),
  ]);

  const MasteryMap: Record<string, number> = {};
  for (const Row of MasteryRows) {
    MasteryMap[Row.ConceptId] = Row.Score;
  }

  // Annotate each concept node with the student's mastery score
  const AnnotatedConcepts = BaseGraph.Concepts.map((C) => ({
    ...C,
    MasteryScore: MasteryMap[C.Id] ?? 0,
  }));

  return {
    Concepts:   AnnotatedConcepts,
    Edges:      BaseGraph.Edges,
    MasteryMap,
  };
}

/**
 * Search concepts by name in the requested locale.
 * Performs a case-insensitive partial match on NameAr or NameEn.
 */
export async function SearchConcepts(Query: string, Locale: 'ar' | 'en'): Promise<IConceptNode[]> {
  const Pattern = `%${Query}%`;

  const Rows = await db
    .select()
    .from(Concepts)
    .where(
      and(
        eq(Concepts.IsDeleted, false),
        Locale === 'ar'
          ? ilike(Concepts.NameAr, Pattern)
          : or(ilike(Concepts.NameEn, Pattern), ilike(Concepts.NameAr, Pattern)),
      ),
    );

  return Rows.map(MapConceptRow);
}
