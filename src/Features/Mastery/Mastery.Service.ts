/**
 * Mastery.Service.ts
 * Business logic for Student Mastery — signal recording and score computation.
 *
 * Score formula: delta = SIGNAL_DELTA[type] * (Value / 100), rounded to integer.
 * Score is clamped to [0, 100] at all times.
 * StudentInsights.Insights is stored as a JSON string — parsed safely on read.
 */
import { db } from '@/lib/db/Index';
import {
  StudentMastery,
  LearningSignals,
  StudentInsights,
  Concepts,
} from '@/lib/db/Schema';
import { and, eq, sql } from 'drizzle-orm';
import type { IMasteryScore, IStudentMasteryProfile } from './Mastery.Types';

// ─── Signal weights ───────────────────────────────────────────────────────────

const SIGNAL_DELTA: Record<string, number> = {
  quiz_correct:   15,
  quiz_wrong:     -8,
  socratic_pass:  25,
  practical_done: 20,
  peer_taught:    12,
};

// ─── Public service functions ─────────────────────────────────────────────────

/**
 * Records a learning signal and upserts the mastery score for a concept.
 *
 * @param UserId     - Authenticated user's UUID
 * @param ConceptId  - Concept UUID
 * @param SignalType - One of the recognised signal type strings
 * @param Value      - Scaling factor 1-100 (100 = full delta applied)
 */
export async function RecordSignal(
  UserId: string,
  ConceptId: string,
  SignalType: string,
  Value: number,
): Promise<void> {
  // Guard: reject unknown signal types before touching the DB.
  if (!(SignalType in SIGNAL_DELTA)) {
    throw new Error(`Unknown SignalType: ${SignalType}`);
  }

  const BaseDelta = SIGNAL_DELTA[SignalType];
  const ScaledDelta = Math.round(BaseDelta * (Value / 100));

  // Insert the raw signal for audit / Data Flywheel.
  await db.insert(LearningSignals).values({
    UserId,
    ConceptId,
    SignalType,
    Value,
  });

  // Initial score for a brand-new row — clamped to [0, 100].
  const InitialScore = Math.min(100, Math.max(0, ScaledDelta));

  // Upsert: on duplicate (UserId, ConceptId) update score and increment attempts.
  await db
    .insert(StudentMastery)
    .values({
      UserId,
      ConceptId,
      Score:      InitialScore,
      Attempts:   1,
      LastTested: new Date(),
    })
    .onConflictDoUpdate({
      target: [StudentMastery.UserId, StudentMastery.ConceptId],
      set: {
        Score:      sql`LEAST(100, GREATEST(0, ${StudentMastery.Score} + ${ScaledDelta}))`,
        Attempts:   sql`${StudentMastery.Attempts} + 1`,
        LastTested: new Date(),
        UpdatedAt:  new Date(),
      },
    });
}

/**
 * Returns the full mastery profile for a user, including per-concept scores
 * and aggregated counts.
 *
 * @param UserId - Authenticated user's UUID
 */
export async function GetStudentMasteryProfile(UserId: string): Promise<IStudentMasteryProfile> {
  // Fetch all mastery rows with concept names via a join.
  const Rows = await db
    .select({
      ConceptId:     StudentMastery.ConceptId,
      ConceptNameAr: Concepts.NameAr,
      ConceptNameEn: Concepts.NameEn,
      Score:         StudentMastery.Score,
      Attempts:      StudentMastery.Attempts,
      LastTested:    StudentMastery.LastTested,
    })
    .from(StudentMastery)
    .innerJoin(Concepts, and(
      eq(StudentMastery.ConceptId, Concepts.Id),
      eq(Concepts.IsDeleted, false),
    ))
    .where(eq(StudentMastery.UserId, UserId));

  const Scores: IMasteryScore[] = Rows.map((R) => ({
    ConceptId:     R.ConceptId,
    ConceptNameAr: R.ConceptNameAr,
    ConceptNameEn: R.ConceptNameEn,
    Score:         R.Score,
    Attempts:      R.Attempts,
    LastTested:    R.LastTested ? R.LastTested.toISOString() : null,
  }));

  const MasteredCount   = Scores.filter((S) => S.Score >= 80).length;
  const InProgressCount = Scores.filter((S) => S.Score >= 1 && S.Score < 80).length;

  // Load student insights — may not exist yet; return {} gracefully.
  const InsightRows = await db
    .select({ Insights: StudentInsights.Insights })
    .from(StudentInsights)
    .where(eq(StudentInsights.UserId, UserId))
    .limit(1);

  let ParsedInsights: Record<string, unknown> = {};
  if (InsightRows.length > 0) {
    try {
      ParsedInsights = JSON.parse(InsightRows[0].Insights) as Record<string, unknown>;
    } catch {
      ParsedInsights = {};
    }
  }

  return {
    UserId,
    Scores,
    TotalConcepts:  Scores.length,
    MasteredCount,
    InProgressCount,
    Insights: ParsedInsights,
  };
}

/**
 * Returns mastery data for a single concept, or null if the user has no record.
 *
 * @param UserId    - Authenticated user's UUID
 * @param ConceptId - Concept UUID
 */
export async function GetConceptMastery(
  UserId: string,
  ConceptId: string,
): Promise<IMasteryScore | null> {
  const Rows = await db
    .select({
      ConceptId:     StudentMastery.ConceptId,
      ConceptNameAr: Concepts.NameAr,
      ConceptNameEn: Concepts.NameEn,
      Score:         StudentMastery.Score,
      Attempts:      StudentMastery.Attempts,
      LastTested:    StudentMastery.LastTested,
    })
    .from(StudentMastery)
    .innerJoin(Concepts, and(
      eq(StudentMastery.ConceptId, Concepts.Id),
      eq(Concepts.IsDeleted, false),
    ))
    .where(and(
      eq(StudentMastery.UserId, UserId),
      eq(StudentMastery.ConceptId, ConceptId),
    ))
    .limit(1);

  if (Rows.length === 0) return null;

  const R = Rows[0];
  return {
    ConceptId:     R.ConceptId,
    ConceptNameAr: R.ConceptNameAr,
    ConceptNameEn: R.ConceptNameEn,
    Score:         R.Score,
    Attempts:      R.Attempts,
    LastTested:    R.LastTested ? R.LastTested.toISOString() : null,
  };
}
