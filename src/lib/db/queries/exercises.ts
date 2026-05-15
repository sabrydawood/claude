/**
 * exercises.ts
 * DB query helpers for exercises.
 * Uses ExerciseTranslations with automatic fallback to 'en'.
 */
import { db } from '@/lib/db/Index';
import { Exercises, ExerciseTranslations } from '@/lib/db/Schema';
import { eq, and, asc, inArray } from 'drizzle-orm';

// ─── Exported types ────────────────────────────────────────────────────────────

export interface ExerciseRow {
  id: string;
  lessonId: string | null;
  courseId: string | null;
  type: 'fill_blank' | 'arrange_code' | 'spot_error' | 'build_it';
  difficulty: number;
  order: number;
  xpReward: number;
  title: string;
  instructions: string;
  hintText: string;
  starterCode: string;
  solutionCode: string;
  testCases: { input: string; expected: string }[];
}

// ─── Internal helper ───────────────────────────────────────────────────────────

/** Batch-fetch exercise translations for a locale with English fallback. */
async function GetExerciseTranslations(ExerciseIds: string[], Locale: string) {
  if (ExerciseIds.length === 0) {
    return {
      LocaleMap: new Map<string, typeof ExerciseTranslations.$inferSelect>(),
      EnMap: new Map<string, typeof ExerciseTranslations.$inferSelect>(),
    };
  }
  const [LocaleRows, EnRows] = await Promise.all([
    db
      .select()
      .from(ExerciseTranslations)
      .where(
        and(
          inArray(ExerciseTranslations.ExerciseId, ExerciseIds),
          eq(ExerciseTranslations.Locale, Locale),
        ),
      ),
    Locale !== 'en'
      ? db
          .select()
          .from(ExerciseTranslations)
          .where(
            and(
              inArray(ExerciseTranslations.ExerciseId, ExerciseIds),
              eq(ExerciseTranslations.Locale, 'en'),
            ),
          )
      : Promise.resolve([]),
  ]);
  return {
    LocaleMap: new Map(LocaleRows.map((R) => [R.ExerciseId, R])),
    EnMap: new Map(EnRows.map((R) => [R.ExerciseId, R])),
  };
}

/** Maps raw DB exercise row + translation into an ExerciseRow. */
function MapExerciseRow(
  E: typeof Exercises.$inferSelect,
  Trans: typeof ExerciseTranslations.$inferSelect | undefined,
): ExerciseRow {
  return {
    id: E.Id,
    lessonId: E.LessonId,
    courseId: E.CourseId,
    type: E.Type,
    difficulty: E.Difficulty,
    order: E.Order,
    xpReward: E.XpReward,
    title: Trans?.Title ?? '',
    instructions: Trans?.Instructions ?? '',
    hintText: Trans?.HintText ?? '',
    starterCode: Trans?.StarterCode ?? '',
    solutionCode: Trans?.SolutionCode ?? '',
    testCases: Trans?.TestCases ?? [],
  };
}

// ─── Query functions ───────────────────────────────────────────────────────────

/**
 * Get all non-deleted exercises for a lesson, ordered by Order.
 * Translations resolved for locale (fallback to 'en').
 */
export async function getExercisesByLesson(
  lessonId: string,
  locale: string,
): Promise<ExerciseRow[]> {
  const Rows = await db
    .select()
    .from(Exercises)
    .where(and(eq(Exercises.LessonId, lessonId), eq(Exercises.IsDeleted, false)))
    .orderBy(asc(Exercises.Order));

  if (Rows.length === 0) return [];

  const Ids = Rows.map((R) => R.Id);
  const { LocaleMap, EnMap } = await GetExerciseTranslations(Ids, locale);

  return Rows.map((R) => MapExerciseRow(R, LocaleMap.get(R.Id) ?? EnMap.get(R.Id)));
}

/**
 * Get all non-deleted exercises for a course, ordered by Order.
 * Translations resolved for locale (fallback to 'en').
 */
export async function getExercisesByCourse(
  courseId: string,
  locale: string,
): Promise<ExerciseRow[]> {
  const Rows = await db
    .select()
    .from(Exercises)
    .where(and(eq(Exercises.CourseId, courseId), eq(Exercises.IsDeleted, false)))
    .orderBy(asc(Exercises.Order));

  if (Rows.length === 0) return [];

  const Ids = Rows.map((R) => R.Id);
  const { LocaleMap, EnMap } = await GetExerciseTranslations(Ids, locale);

  return Rows.map((R) => MapExerciseRow(R, LocaleMap.get(R.Id) ?? EnMap.get(R.Id)));
}
