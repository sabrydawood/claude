/**
 * content.ts
 * Database query helpers for agents, lessons, quiz, subjects, courses, and sitemap.
 * Uses per-entity translation tables with automatic fallback to 'en'.
 */
import { db } from '@/lib/db/Index';
import {
  Agents,
  AgentTranslations,
  Lessons,
  LessonTranslations,
  QuizQuestions,
  QuizQuestionTranslations,
  QuizOptions,
  QuizOptionTranslations,
  Subjects,
  SubjectTranslations,
  Courses,
  CourseTranslations,
} from '@/lib/db/Schema';
import { eq, and, inArray, isNotNull } from 'drizzle-orm';

// --- Exported types ---

export interface AgentRow {
  id: string;
  slug: string;
  color: string;
  icon: string;
  isActive: boolean;
  order: number;
  name: string;
  description: string;
  fullDescription: string;
}

export interface LessonRow {
  id: string;
  agentId: string | null;
  order: number;
  xpReward: number;
  estimatedMinutes: number;
  title: string;
  description: string;
  content: string;
  agentSlug: string;
  agentIcon: string;
  agentColor: string;
}

export interface QuizOptionRow {
  id: string;
  questionId: string;
  isCorrect: boolean;
  order: number;
  text: string;
}

export interface QuizQuestionRow {
  id: string;
  lessonId: string;
  type: 'multiple_choice' | 'true_false';
  order: number;
  question: string;
  options: QuizOptionRow[];
}

export interface LessonFull extends LessonRow {
  agentName: string;
  questions: QuizQuestionRow[];
}

export interface SubjectRow {
  id: string;
  slug: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
  name: string;
  description: string;
  courseCount: number;
}

export interface CourseRow {
  id: string;
  subjectId: string;
  order: number;
  difficulty: number;
  estimatedHours: number;
  isActive: boolean;
  name: string;
  description: string;
  lessonCount: number;
}

// --- Translation cache ---

const CACHE_TTL_MS = 3_600_000; // 1 hour

const _cache = new Map<string, { data: unknown; expiresAt: number }>();

function cacheGet<T>(key: string): T | null {
  const entry = _cache.get(key);
  if (!entry || entry.expiresAt < Date.now()) {
    _cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function cacheSet(key: string, data: unknown): void {
  _cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// --- Internal translation helpers ---

async function GetAgentTranslations(AgentIds: string[], Locale: string) {
  if (AgentIds.length === 0)
    return {
      LocaleMap: new Map<string, typeof AgentTranslations.$inferSelect>(),
      EnMap: new Map<string, typeof AgentTranslations.$inferSelect>(),
    };
  const [LocaleRows, EnRows] = await Promise.all([
    db.select().from(AgentTranslations).where(and(inArray(AgentTranslations.AgentId, AgentIds), eq(AgentTranslations.Locale, Locale))),
    Locale !== 'en'
      ? db.select().from(AgentTranslations).where(and(inArray(AgentTranslations.AgentId, AgentIds), eq(AgentTranslations.Locale, 'en')))
      : Promise.resolve([]),
  ]);
  return {
    LocaleMap: new Map(LocaleRows.map((R) => [R.AgentId, R])),
    EnMap: new Map(EnRows.map((R) => [R.AgentId, R])),
  };
}

async function GetLessonTranslations(LessonIds: string[], Locale: string) {
  if (LessonIds.length === 0)
    return {
      LocaleMap: new Map<string, typeof LessonTranslations.$inferSelect>(),
      EnMap: new Map<string, typeof LessonTranslations.$inferSelect>(),
    };
  const [LocaleRows, EnRows] = await Promise.all([
    db.select().from(LessonTranslations).where(and(inArray(LessonTranslations.LessonId, LessonIds), eq(LessonTranslations.Locale, Locale))),
    Locale !== 'en'
      ? db.select().from(LessonTranslations).where(and(inArray(LessonTranslations.LessonId, LessonIds), eq(LessonTranslations.Locale, 'en')))
      : Promise.resolve([]),
  ]);
  return {
    LocaleMap: new Map(LocaleRows.map((R) => [R.LessonId, R])),
    EnMap: new Map(EnRows.map((R) => [R.LessonId, R])),
  };
}

async function GetSubjectTranslations(SubjectIds: string[], Locale: string) {
  if (SubjectIds.length === 0)
    return {
      LocaleMap: new Map<string, typeof SubjectTranslations.$inferSelect>(),
      EnMap: new Map<string, typeof SubjectTranslations.$inferSelect>(),
    };
  const [LocaleRows, EnRows] = await Promise.all([
    db.select().from(SubjectTranslations).where(and(inArray(SubjectTranslations.SubjectId, SubjectIds), eq(SubjectTranslations.Locale, Locale))),
    Locale !== 'en'
      ? db.select().from(SubjectTranslations).where(and(inArray(SubjectTranslations.SubjectId, SubjectIds), eq(SubjectTranslations.Locale, 'en')))
      : Promise.resolve([]),
  ]);
  return {
    LocaleMap: new Map(LocaleRows.map((R) => [R.SubjectId, R])),
    EnMap: new Map(EnRows.map((R) => [R.SubjectId, R])),
  };
}

async function GetCourseTranslations(CourseIds: string[], Locale: string) {
  if (CourseIds.length === 0)
    return {
      LocaleMap: new Map<string, typeof CourseTranslations.$inferSelect>(),
      EnMap: new Map<string, typeof CourseTranslations.$inferSelect>(),
    };
  const [LocaleRows, EnRows] = await Promise.all([
    db.select().from(CourseTranslations).where(and(inArray(CourseTranslations.CourseId, CourseIds), eq(CourseTranslations.Locale, Locale))),
    Locale !== 'en'
      ? db.select().from(CourseTranslations).where(and(inArray(CourseTranslations.CourseId, CourseIds), eq(CourseTranslations.Locale, 'en')))
      : Promise.resolve([]),
  ]);
  return {
    LocaleMap: new Map(LocaleRows.map((R) => [R.CourseId, R])),
    EnMap: new Map(EnRows.map((R) => [R.CourseId, R])),
  };
}

// --- Agent queries ---

export async function getAgents(locale: string): Promise<AgentRow[]> {
  const key = `agents:${locale}`;
  const cached = cacheGet<AgentRow[]>(key);
  if (cached) return cached;

  const Rows = await db.select().from(Agents).where(eq(Agents.IsActive, true)).orderBy(Agents.Order);
  if (Rows.length === 0) return [];

  const Ids = Rows.map((A) => A.Id);
  const { LocaleMap, EnMap } = await GetAgentTranslations(Ids, locale);

  const result = Rows.map((A) => {
    const T = LocaleMap.get(A.Id) ?? EnMap.get(A.Id);
    return {
      id: A.Id, slug: A.Slug, color: A.Color, icon: A.Icon,
      isActive: A.IsActive, order: A.Order,
      name: T?.Name ?? '', description: T?.Description ?? '', fullDescription: T?.FullDescription ?? '',
    };
  });

  cacheSet(key, result);
  return result;
}

export async function getAgentBySlug(slug: string, locale: string): Promise<AgentRow | null> {
  const key = `agent:${slug}:${locale}`;
  const cached = _cache.get(key);
  if (cached && cached.expiresAt >= Date.now()) return cached.data as AgentRow | null;

  const [A] = await db.select().from(Agents).where(eq(Agents.Slug, slug)).limit(1);
  if (!A) { cacheSet(key, null); return null; }

  const { LocaleMap, EnMap } = await GetAgentTranslations([A.Id], locale);
  const T = LocaleMap.get(A.Id) ?? EnMap.get(A.Id);

  const result: AgentRow = {
    id: A.Id, slug: A.Slug, color: A.Color, icon: A.Icon,
    isActive: A.IsActive, order: A.Order,
    name: T?.Name ?? '', description: T?.Description ?? '', fullDescription: T?.FullDescription ?? '',
  };

  cacheSet(key, result);
  return result;
}

// --- Lesson queries ---

export async function getLessonsByAgent(agentSlug: string, locale: string): Promise<LessonRow[]> {
  const key = `lessons:${agentSlug}:${locale}`;
  const cached = cacheGet<LessonRow[]>(key);
  if (cached) return cached;

  const [Agent] = await db.select().from(Agents).where(eq(Agents.Slug, agentSlug)).limit(1);
  if (!Agent) return [];

  const LessonRows = await db.select().from(Lessons).where(eq(Lessons.AgentId, Agent.Id)).orderBy(Lessons.Order);
  if (LessonRows.length === 0) return [];

  const Ids = LessonRows.map((L) => L.Id);
  const { LocaleMap, EnMap } = await GetLessonTranslations(Ids, locale);

  const result = LessonRows.map((L) => {
    const T = LocaleMap.get(L.Id) ?? EnMap.get(L.Id);
    return {
      id: L.Id, agentId: L.AgentId, order: L.Order,
      xpReward: L.XpReward, estimatedMinutes: L.EstimatedMinutes,
      title: T?.Title ?? '', description: T?.Description ?? '', content: T?.Content ?? '',
      agentSlug: Agent.Slug, agentIcon: Agent.Icon, agentColor: Agent.Color,
    };
  });

  cacheSet(key, result);
  return result;
}

export async function getLessonById(id: string, locale: string): Promise<LessonFull | null> {
  const key = `lesson:${id}:${locale}`;
  const cached = _cache.get(key);
  if (cached && cached.expiresAt >= Date.now()) return cached.data as LessonFull | null;

  const [L] = await db.select().from(Lessons).where(eq(Lessons.Id, id)).limit(1);
  if (!L) { cacheSet(key, null); return null; }

  // Agent is optional — course-based lessons have AgentId = null
  const Agent = L.AgentId
    ? (await db.select().from(Agents).where(eq(Agents.Id, L.AgentId)).limit(1))[0] ?? null
    : null;

  const QuestionRows = await db.select().from(QuizQuestions).where(eq(QuizQuestions.LessonId, id)).orderBy(QuizQuestions.Order);
  const QIds = QuestionRows.map((Q) => Q.Id);

  const OptionRows = QIds.length > 0
    ? await db.select().from(QuizOptions).where(inArray(QuizOptions.QuestionId, QIds)).orderBy(QuizOptions.Order)
    : [];
  const OIds = OptionRows.map((O) => O.Id);

  const [
    { LocaleMap: LTrans, EnMap: LFallback },
    { LocaleMap: ATrans, EnMap: AFallback },
    [QLocaleRows, QEnRows],
    [OLocaleRows, OEnRows],
  ] = await Promise.all([
    GetLessonTranslations([L.Id], locale),
    Agent ? GetAgentTranslations([Agent.Id], locale) : Promise.resolve({ LocaleMap: new Map(), EnMap: new Map() }),
    QIds.length > 0
      ? Promise.all([
          db.select().from(QuizQuestionTranslations).where(and(inArray(QuizQuestionTranslations.QuestionId, QIds), eq(QuizQuestionTranslations.Locale, locale))),
          locale !== 'en' ? db.select().from(QuizQuestionTranslations).where(and(inArray(QuizQuestionTranslations.QuestionId, QIds), eq(QuizQuestionTranslations.Locale, 'en'))) : Promise.resolve([]),
        ])
      : Promise.resolve([[], []]),
    OIds.length > 0
      ? Promise.all([
          db.select().from(QuizOptionTranslations).where(and(inArray(QuizOptionTranslations.OptionId, OIds), eq(QuizOptionTranslations.Locale, locale))),
          locale !== 'en' ? db.select().from(QuizOptionTranslations).where(and(inArray(QuizOptionTranslations.OptionId, OIds), eq(QuizOptionTranslations.Locale, 'en'))) : Promise.resolve([]),
        ])
      : Promise.resolve([[], []]),
  ]);

  const QTransMap = new Map(QLocaleRows.map((R) => [R.QuestionId, R]));
  const QFallMap  = new Map(QEnRows.map((R) => [R.QuestionId, R]));
  const OTransMap = new Map(OLocaleRows.map((R) => [R.OptionId, R]));
  const OFallMap  = new Map(OEnRows.map((R) => [R.OptionId, R]));

  const OptionsByQuestion = new Map<string, QuizOptionRow[]>();
  for (const Opt of OptionRows) {
    const T = OTransMap.get(Opt.Id) ?? OFallMap.get(Opt.Id);
    if (!OptionsByQuestion.has(Opt.QuestionId)) OptionsByQuestion.set(Opt.QuestionId, []);
    OptionsByQuestion.get(Opt.QuestionId)!.push({
      id: Opt.Id, questionId: Opt.QuestionId, isCorrect: Opt.IsCorrect,
      order: Opt.Order, text: T?.Text ?? '',
    });
  }

  const Questions: QuizQuestionRow[] = QuestionRows.map((Q) => {
    const T = QTransMap.get(Q.Id) ?? QFallMap.get(Q.Id);
    return {
      id: Q.Id, lessonId: Q.LessonId, type: Q.Type as 'multiple_choice' | 'true_false',
      order: Q.Order, question: T?.Question ?? '',
      options: OptionsByQuestion.get(Q.Id) ?? [],
    };
  });

  const LT = LTrans.get(L.Id) ?? LFallback.get(L.Id);
  const AT = Agent ? (ATrans.get(Agent.Id) ?? AFallback.get(Agent.Id)) : null;

  const result: LessonFull = {
    id: L.Id, agentId: L.AgentId, order: L.Order,
    xpReward: L.XpReward, estimatedMinutes: L.EstimatedMinutes,
    title: LT?.Title ?? '', description: LT?.Description ?? '', content: LT?.Content ?? '',
    agentSlug: Agent?.Slug ?? '', agentIcon: Agent?.Icon ?? 'BookOpen', agentColor: Agent?.Color ?? '#7C3AED',
    agentName: AT?.Name ?? '', questions: Questions,
  };

  cacheSet(key, result);
  return result;
}

// --- Subject queries ---

export async function getSubjects(locale: string): Promise<SubjectRow[]> {
  const key = `subjects:${locale}`;
  const cached = cacheGet<SubjectRow[]>(key);
  if (cached) return cached;

  const Rows = await db.select().from(Subjects).where(and(eq(Subjects.IsActive, true), eq(Subjects.IsDeleted, false))).orderBy(Subjects.Order);
  if (Rows.length === 0) return [];

  const Ids = Rows.map((S) => S.Id);
  const { LocaleMap, EnMap } = await GetSubjectTranslations(Ids, locale);

  const CourseCounts = await db.select({ SubjectId: Courses.SubjectId }).from(Courses).where(and(inArray(Courses.SubjectId, Ids), eq(Courses.IsDeleted, false)));
  const CourseCountMap = new Map<string, number>();
  for (const C of CourseCounts) CourseCountMap.set(C.SubjectId, (CourseCountMap.get(C.SubjectId) ?? 0) + 1);

  const result = Rows.map((S) => {
    const T = LocaleMap.get(S.Id) ?? EnMap.get(S.Id);
    return {
      id: S.Id, slug: S.Slug, icon: S.Icon, color: S.Color,
      order: S.Order, isActive: S.IsActive,
      name: T?.Name ?? '', description: T?.Description ?? '',
      courseCount: CourseCountMap.get(S.Id) ?? 0,
    };
  });

  cacheSet(key, result);
  return result;
}

export async function getSubjectBySlug(slug: string, locale: string): Promise<SubjectRow | null> {
  const key = `subject:${slug}:${locale}`;
  const cachedEntry = _cache.get(key);
  if (cachedEntry && cachedEntry.expiresAt >= Date.now()) return cachedEntry.data as SubjectRow | null;

  const [S] = await db.select().from(Subjects).where(and(eq(Subjects.Slug, slug), eq(Subjects.IsDeleted, false))).limit(1);
  if (!S) { cacheSet(key, null); return null; }

  const { LocaleMap, EnMap } = await GetSubjectTranslations([S.Id], locale);
  const T = LocaleMap.get(S.Id) ?? EnMap.get(S.Id);

  const CourseRows = await db.select({ SubjectId: Courses.SubjectId }).from(Courses).where(and(eq(Courses.SubjectId, S.Id), eq(Courses.IsDeleted, false)));

  const result: SubjectRow = {
    id: S.Id, slug: S.Slug, icon: S.Icon, color: S.Color,
    order: S.Order, isActive: S.IsActive,
    name: T?.Name ?? '', description: T?.Description ?? '',
    courseCount: CourseRows.length,
  };

  cacheSet(key, result);
  return result;
}

// --- Course queries ---

export async function getCoursesBySubject(subjectId: string, locale: string): Promise<CourseRow[]> {
  const key = `courses:${subjectId}:${locale}`;
  const cached = cacheGet<CourseRow[]>(key);
  if (cached) return cached;

  const Rows = await db.select().from(Courses).where(and(eq(Courses.SubjectId, subjectId), eq(Courses.IsDeleted, false))).orderBy(Courses.Order);
  if (Rows.length === 0) return [];

  const Ids = Rows.map((C) => C.Id);
  const { LocaleMap, EnMap } = await GetCourseTranslations(Ids, locale);

  const LessonCounts = await db.select({ CourseId: Lessons.CourseId }).from(Lessons).where(and(isNotNull(Lessons.CourseId), eq(Lessons.IsDeleted, false)));
  const LessonCountMap = new Map<string, number>();
  for (const L of LessonCounts) {
    if (L.CourseId && Ids.includes(L.CourseId)) LessonCountMap.set(L.CourseId, (LessonCountMap.get(L.CourseId) ?? 0) + 1);
  }

  const result = Rows.map((C) => {
    const T = LocaleMap.get(C.Id) ?? EnMap.get(C.Id);
    return {
      id: C.Id, subjectId: C.SubjectId, order: C.Order,
      difficulty: C.Difficulty, estimatedHours: C.EstimatedHours,
      isActive: C.IsActive,
      name: T?.Name ?? '', description: T?.Description ?? '',
      lessonCount: LessonCountMap.get(C.Id) ?? 0,
    };
  });

  cacheSet(key, result);
  return result;
}

export async function getCourseById(id: string, locale: string): Promise<(CourseRow & { subject: SubjectRow }) | null> {
  const key = `course:${id}:${locale}`;
  const cachedEntry = _cache.get(key);
  if (cachedEntry && cachedEntry.expiresAt >= Date.now()) return cachedEntry.data as (CourseRow & { subject: SubjectRow }) | null;

  const [C] = await db.select().from(Courses).where(and(eq(Courses.Id, id), eq(Courses.IsDeleted, false))).limit(1);
  if (!C) { cacheSet(key, null); return null; }

  const [{ LocaleMap, EnMap }, LessonCounts, subjectResult] = await Promise.all([
    GetCourseTranslations([C.Id], locale),
    db.select({ CourseId: Lessons.CourseId }).from(Lessons).where(and(eq(Lessons.CourseId, C.Id), eq(Lessons.IsDeleted, false))),
    (async () => {
      const [S] = await db.select().from(Subjects).where(eq(Subjects.Id, C.SubjectId)).limit(1);
      if (!S) return null;
      const { LocaleMap: SLMap, EnMap: SEMap } = await GetSubjectTranslations([S.Id], locale);
      const ST = SLMap.get(S.Id) ?? SEMap.get(S.Id);
      return {
        id: S.Id, slug: S.Slug, icon: S.Icon, color: S.Color,
        order: S.Order, isActive: S.IsActive,
        name: ST?.Name ?? '', description: ST?.Description ?? '', courseCount: 0,
      } as SubjectRow;
    })(),
  ]);

  const T = LocaleMap.get(C.Id) ?? EnMap.get(C.Id);
  const subjectRow: SubjectRow = subjectResult ?? {
    id: '', slug: '', icon: 'BookOpen', color: '#7C3AED',
    order: 0, isActive: false, name: '', description: '', courseCount: 0,
  };

  const result = {
    id: C.Id, subjectId: C.SubjectId, order: C.Order,
    difficulty: C.Difficulty, estimatedHours: C.EstimatedHours,
    isActive: C.IsActive,
    name: T?.Name ?? '', description: T?.Description ?? '',
    lessonCount: LessonCounts.length,
    subject: subjectRow,
  };

  cacheSet(key, result);
  return result;
}

export async function getLessonsByCourse(courseId: string, locale: string): Promise<LessonRow[]> {
  const key = `lessonsForCourse:${courseId}:${locale}`;
  const cached = cacheGet<LessonRow[]>(key);
  if (cached) return cached;

  const LessonRows = await db.select().from(Lessons).where(and(eq(Lessons.CourseId, courseId), eq(Lessons.IsDeleted, false))).orderBy(Lessons.Order);
  if (LessonRows.length === 0) return [];

  const Ids = LessonRows.map((L) => L.Id);
  const { LocaleMap, EnMap } = await GetLessonTranslations(Ids, locale);

  const AgentIds = [...new Set(LessonRows.map((L) => L.AgentId).filter((aid): aid is string => aid !== null))];
  const AgentRows = AgentIds.length > 0 ? await db.select().from(Agents).where(inArray(Agents.Id, AgentIds)) : [];
  const AgentMap = new Map(AgentRows.map((A) => [A.Id, A]));

  const result = LessonRows.map((L) => {
    const T = LocaleMap.get(L.Id) ?? EnMap.get(L.Id);
    const A = L.AgentId ? AgentMap.get(L.AgentId) : undefined;
    return {
      id: L.Id, agentId: L.AgentId, order: L.Order,
      xpReward: L.XpReward, estimatedMinutes: L.EstimatedMinutes,
      title: T?.Title ?? '', description: T?.Description ?? '', content: T?.Content ?? '',
      agentSlug: A?.Slug ?? '', agentIcon: A?.Icon ?? 'Bot', agentColor: A?.Color ?? '#7C3AED',
    };
  });

  cacheSet(key, result);
  return result;
}

// --- Sitemap queries ---

export async function getAllAgentsForSitemap(): Promise<{ id: string; slug: string }[]> {
  return (await db.select({ id: Agents.Id, slug: Agents.Slug }).from(Agents).where(eq(Agents.IsActive, true)))
    .map((R) => ({ id: R.id, slug: R.slug }));
}

export async function getAllLessonsForSitemap(): Promise<{ id: string; agentSlug: string }[]> {
  const Rows = await db.select({ id: Lessons.Id, agentId: Lessons.AgentId }).from(Lessons);
  const AgentIds = [...new Set(Rows.map((R) => R.agentId).filter((aid): aid is string => aid !== null))];
  const AgentSlugs = AgentIds.length > 0
    ? await db.select({ id: Agents.Id, slug: Agents.Slug }).from(Agents).where(inArray(Agents.Id, AgentIds))
    : [];
  const SlugMap = new Map(AgentSlugs.map((A) => [A.id, A.slug]));
  return Rows.map((R) => ({ id: R.id, agentSlug: R.agentId ? (SlugMap.get(R.agentId) ?? '') : '' }));
}
