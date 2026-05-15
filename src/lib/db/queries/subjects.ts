/**
 * subjects.ts
 * DB query helpers for subjects and courses — extended views.
 *
 * Re-exports core types from content.ts and adds:
 * - SubjectWithCourses: subject + its courses (for /subjects/[slug] API endpoint)
 * - getCourseWithLessons: course + its ordered lessons (for /courses/[id] API endpoint)
 *
 * Simple list queries (getSubjects, getSubjectBySlug, getCoursesBySubject,
 * getCourseById, getLessonsByCourse) live in content.ts and are used by page
 * components directly.
 */
import { db } from '@/lib/db/Index';
import {
  Subjects,
  SubjectTranslations,
  Courses,
  CourseTranslations,
  Lessons,
  LessonTranslations,
  Agents,
} from '@/lib/db/Schema';
import { eq, and, inArray } from 'drizzle-orm';
import type { SubjectRow, CourseRow, LessonRow } from '@/lib/db/queries/content';

// ─── Extended types ────────────────────────────────────────────────────────────

export type { SubjectRow, CourseRow, LessonRow };

export interface SubjectWithCourses extends SubjectRow {
  courses: CourseRow[];
}

export interface CourseWithLessons extends CourseRow {
  lessons: LessonRow[];
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

/** Batch-fetch subject translations for a locale with English fallback. */
async function GetSubjectTranslations(SubjectIds: string[], Locale: string) {
  if (SubjectIds.length === 0) {
    return {
      LocaleMap: new Map<string, typeof SubjectTranslations.$inferSelect>(),
      EnMap: new Map<string, typeof SubjectTranslations.$inferSelect>(),
    };
  }
  const [LocaleRows, EnRows] = await Promise.all([
    db
      .select()
      .from(SubjectTranslations)
      .where(
        and(
          inArray(SubjectTranslations.SubjectId, SubjectIds),
          eq(SubjectTranslations.Locale, Locale),
        ),
      ),
    Locale !== 'en'
      ? db
          .select()
          .from(SubjectTranslations)
          .where(
            and(
              inArray(SubjectTranslations.SubjectId, SubjectIds),
              eq(SubjectTranslations.Locale, 'en'),
            ),
          )
      : Promise.resolve([]),
  ]);
  return {
    LocaleMap: new Map(LocaleRows.map((R) => [R.SubjectId, R])),
    EnMap: new Map(EnRows.map((R) => [R.SubjectId, R])),
  };
}

/** Batch-fetch course translations for a locale with English fallback. */
async function GetCourseTranslations(CourseIds: string[], Locale: string) {
  if (CourseIds.length === 0) {
    return {
      LocaleMap: new Map<string, typeof CourseTranslations.$inferSelect>(),
      EnMap: new Map<string, typeof CourseTranslations.$inferSelect>(),
    };
  }
  const [LocaleRows, EnRows] = await Promise.all([
    db
      .select()
      .from(CourseTranslations)
      .where(
        and(
          inArray(CourseTranslations.CourseId, CourseIds),
          eq(CourseTranslations.Locale, Locale),
        ),
      ),
    Locale !== 'en'
      ? db
          .select()
          .from(CourseTranslations)
          .where(
            and(
              inArray(CourseTranslations.CourseId, CourseIds),
              eq(CourseTranslations.Locale, 'en'),
            ),
          )
      : Promise.resolve([]),
  ]);
  return {
    LocaleMap: new Map(LocaleRows.map((R) => [R.CourseId, R])),
    EnMap: new Map(EnRows.map((R) => [R.CourseId, R])),
  };
}

// ─── Query functions ───────────────────────────────────────────────────────────

/**
 * Get a single active subject by slug including all its active, non-deleted courses.
 * Returns null if the subject does not exist or is deleted/inactive.
 */
export async function getSubjectWithCourses(
  slug: string,
  locale: string,
): Promise<SubjectWithCourses | null> {
  const [S] = await db
    .select()
    .from(Subjects)
    .where(
      and(eq(Subjects.Slug, slug), eq(Subjects.IsActive, true), eq(Subjects.IsDeleted, false)),
    )
    .limit(1);

  if (!S) return null;

  const { LocaleMap: SLocaleMap, EnMap: SEnMap } = await GetSubjectTranslations([S.Id], locale);
  const ST = SLocaleMap.get(S.Id) ?? SEnMap.get(S.Id);

  const CourseRows = await db
    .select()
    .from(Courses)
    .where(
      and(eq(Courses.SubjectId, S.Id), eq(Courses.IsActive, true), eq(Courses.IsDeleted, false)),
    )
    .orderBy(Courses.Order);

  const CourseIds = CourseRows.map((C) => C.Id);
  const { LocaleMap: CLocaleMap, EnMap: CEnMap } = await GetCourseTranslations(CourseIds, locale);

  const courses: CourseRow[] = CourseRows.map((C) => {
    const CT = CLocaleMap.get(C.Id) ?? CEnMap.get(C.Id);
    return {
      id: C.Id,
      subjectId: C.SubjectId,
      order: C.Order,
      difficulty: C.Difficulty,
      estimatedHours: C.EstimatedHours,
      isActive: C.IsActive,
      name: CT?.Name ?? '',
      description: CT?.Description ?? '',
      lessonCount: 0,
    };
  });

  return {
    id: S.Id,
    slug: S.Slug,
    icon: S.Icon,
    color: S.Color,
    order: S.Order,
    isActive: S.IsActive,
    name: ST?.Name ?? S.Slug,
    description: ST?.Description ?? '',
    courseCount: courses.length,
    courses,
  };
}

/**
 * Get a single active course by ID with its ordered lessons and translations.
 * Returns null if the course does not exist or is deleted/inactive.
 */
export async function getCourseWithLessons(
  id: string,
  locale: string,
): Promise<CourseWithLessons | null> {
  const [C] = await db
    .select()
    .from(Courses)
    .where(
      and(eq(Courses.Id, id), eq(Courses.IsActive, true), eq(Courses.IsDeleted, false)),
    )
    .limit(1);

  if (!C) return null;

  const { LocaleMap: CLocaleMap, EnMap: CEnMap } = await GetCourseTranslations([C.Id], locale);
  const CT = CLocaleMap.get(C.Id) ?? CEnMap.get(C.Id);

  const lessons = await getLessonsByCourse(C.Id, locale);

  return {
    id: C.Id,
    subjectId: C.SubjectId,
    order: C.Order,
    difficulty: C.Difficulty,
    estimatedHours: C.EstimatedHours,
    isActive: C.IsActive,
    name: CT?.Name ?? '',
    description: CT?.Description ?? '',
    lessonCount: lessons.length,
    lessons,
  };
}

/**
 * Get lessons belonging to a course (ordered), with translations for locale.
 * Locale fallback to 'en'. Agent metadata batch-fetched.
 */
export async function getLessonsByCourse(
  courseId: string,
  locale: string,
): Promise<LessonRow[]> {
  const LessonRows = await db
    .select()
    .from(Lessons)
    .where(and(eq(Lessons.CourseId, courseId), eq(Lessons.IsDeleted, false)))
    .orderBy(Lessons.Order);

  if (LessonRows.length === 0) return [];

  const LessonIds = LessonRows.map((L) => L.Id);
  const [LLocaleRows, LEnRows] = await Promise.all([
    db
      .select()
      .from(LessonTranslations)
      .where(
        and(
          inArray(LessonTranslations.LessonId, LessonIds),
          eq(LessonTranslations.Locale, locale),
        ),
      ),
    locale !== 'en'
      ? db
          .select()
          .from(LessonTranslations)
          .where(
            and(
              inArray(LessonTranslations.LessonId, LessonIds),
              eq(LessonTranslations.Locale, 'en'),
            ),
          )
      : Promise.resolve([]),
  ]);

  const LTransMap = new Map(LLocaleRows.map((R) => [R.LessonId, R]));
  const LFallMap = new Map(LEnRows.map((R) => [R.LessonId, R]));

  // Batch-fetch agents for lesson metadata (lessons can belong to different agents)
  const UniqueAgentIds = [
    ...new Set(
      LessonRows.map((L) => L.AgentId).filter((id): id is string => id !== null),
    ),
  ];
  const AgentRows =
    UniqueAgentIds.length > 0
      ? await db.select().from(Agents).where(inArray(Agents.Id, UniqueAgentIds))
      : [];
  const AgentMap = new Map(AgentRows.map((A) => [A.Id, A]));

  return LessonRows.map((L) => {
    const T = LTransMap.get(L.Id) ?? LFallMap.get(L.Id);
    const Agent = L.AgentId ? AgentMap.get(L.AgentId) : undefined;
    return {
      id: L.Id,
      agentId: L.AgentId,
      order: L.Order,
      xpReward: L.XpReward,
      estimatedMinutes: L.EstimatedMinutes,
      title: T?.Title ?? '',
      description: T?.Description ?? '',
      content: T?.Content ?? '',
      agentSlug: Agent?.Slug ?? '',
      agentIcon: Agent?.Icon ?? '',
      agentColor: Agent?.Color ?? '',
    };
  });
}
