/**
 * content.ts
 * Database query helpers for agents, lessons, quiz, and sitemap.
 * Uses per-entity translation tables (AgentTranslations, LessonTranslations, etc.)
 * with automatic fallback to 'en' when the requested locale has no entry.
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
} from '@/lib/db/Schema';
import { eq, and, inArray } from 'drizzle-orm';

// ─── Exported types ────────────────────────────────────────────────────────────

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
  agentId: string;
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

// ─── Internal helper ───────────────────────────────────────────────────────────

/** Fetches agent translations for a locale, with English fallback. */
async function GetAgentTranslations(AgentIds: string[], Locale: string) {
  if (AgentIds.length === 0) return { LocaleMap: new Map<string, typeof AgentTranslations.$inferSelect>(), EnMap: new Map<string, typeof AgentTranslations.$inferSelect>() };
  const [LocaleRows, EnRows] = await Promise.all([
    db.select().from(AgentTranslations).where(and(inArray(AgentTranslations.AgentId, AgentIds), eq(AgentTranslations.Locale, Locale))),
    Locale !== 'en' ? db.select().from(AgentTranslations).where(and(inArray(AgentTranslations.AgentId, AgentIds), eq(AgentTranslations.Locale, 'en'))) : Promise.resolve([]),
  ]);
  return {
    LocaleMap: new Map(LocaleRows.map((R) => [R.AgentId, R])),
    EnMap: new Map(EnRows.map((R) => [R.AgentId, R])),
  };
}

/** Fetches lesson translations for a locale, with English fallback. */
async function GetLessonTranslations(LessonIds: string[], Locale: string) {
  if (LessonIds.length === 0) return { LocaleMap: new Map<string, typeof LessonTranslations.$inferSelect>(), EnMap: new Map<string, typeof LessonTranslations.$inferSelect>() };
  const [LocaleRows, EnRows] = await Promise.all([
    db.select().from(LessonTranslations).where(and(inArray(LessonTranslations.LessonId, LessonIds), eq(LessonTranslations.Locale, Locale))),
    Locale !== 'en' ? db.select().from(LessonTranslations).where(and(inArray(LessonTranslations.LessonId, LessonIds), eq(LessonTranslations.Locale, 'en'))) : Promise.resolve([]),
  ]);
  return {
    LocaleMap: new Map(LocaleRows.map((R) => [R.LessonId, R])),
    EnMap: new Map(EnRows.map((R) => [R.LessonId, R])),
  };
}

// ─── Query functions ───────────────────────────────────────────────────────────

/**
 * Get all active agents ordered by Order, with translations resolved for locale.
 */
export async function getAgents(locale: string): Promise<AgentRow[]> {
  const Rows = await db.select().from(Agents).where(eq(Agents.IsActive, true)).orderBy(Agents.Order);
  if (Rows.length === 0) return [];

  const Ids = Rows.map((A) => A.Id);
  const { LocaleMap, EnMap } = await GetAgentTranslations(Ids, locale);

  return Rows.map((A) => {
    const T = LocaleMap.get(A.Id) ?? EnMap.get(A.Id);
    return {
      id: A.Id, slug: A.Slug, color: A.Color, icon: A.Icon,
      isActive: A.IsActive, order: A.Order,
      name: T?.Name ?? '', description: T?.Description ?? '', fullDescription: T?.FullDescription ?? '',
    };
  });
}

/**
 * Get a single agent by slug, with translations resolved for locale.
 */
export async function getAgentBySlug(slug: string, locale: string): Promise<AgentRow | null> {
  const [A] = await db.select().from(Agents).where(eq(Agents.Slug, slug)).limit(1);
  if (!A) return null;

  const { LocaleMap, EnMap } = await GetAgentTranslations([A.Id], locale);
  const T = LocaleMap.get(A.Id) ?? EnMap.get(A.Id);

  return {
    id: A.Id, slug: A.Slug, color: A.Color, icon: A.Icon,
    isActive: A.IsActive, order: A.Order,
    name: T?.Name ?? '', description: T?.Description ?? '', fullDescription: T?.FullDescription ?? '',
  };
}

/**
 * Get lessons for an agent (by slug), with translations for locale.
 */
export async function getLessonsByAgent(agentSlug: string, locale: string): Promise<LessonRow[]> {
  const [Agent] = await db.select().from(Agents).where(eq(Agents.Slug, agentSlug)).limit(1);
  if (!Agent) return [];

  const LessonRows = await db.select().from(Lessons).where(eq(Lessons.AgentId, Agent.Id)).orderBy(Lessons.Order);
  if (LessonRows.length === 0) return [];

  const Ids = LessonRows.map((L) => L.Id);
  const { LocaleMap, EnMap } = await GetLessonTranslations(Ids, locale);

  return LessonRows.map((L) => {
    const T = LocaleMap.get(L.Id) ?? EnMap.get(L.Id);
    return {
      id: L.Id, agentId: L.AgentId, order: L.Order,
      xpReward: L.XpReward, estimatedMinutes: L.EstimatedMinutes,
      title: T?.Title ?? '', description: T?.Description ?? '', content: T?.Content ?? '',
      agentSlug: Agent.Slug, agentIcon: Agent.Icon, agentColor: Agent.Color,
    };
  });
}

/**
 * Get a single lesson by ID with full translations, quiz questions, and options.
 */
export async function getLessonById(id: string, locale: string): Promise<LessonFull | null> {
  const [L] = await db.select().from(Lessons).where(eq(Lessons.Id, id)).limit(1);
  if (!L) return null;

  const [Agent] = await db.select().from(Agents).where(eq(Agents.Id, L.AgentId)).limit(1);
  if (!Agent) return null;

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
    GetAgentTranslations([Agent.Id], locale),
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
  const AT = ATrans.get(Agent.Id) ?? AFallback.get(Agent.Id);

  return {
    id: L.Id, agentId: L.AgentId, order: L.Order,
    xpReward: L.XpReward, estimatedMinutes: L.EstimatedMinutes,
    title: LT?.Title ?? '', description: LT?.Description ?? '', content: LT?.Content ?? '',
    agentSlug: Agent.Slug, agentIcon: Agent.Icon, agentColor: Agent.Color,
    agentName: AT?.Name ?? '', questions: Questions,
  };
}

/**
 * Get all agents for sitemap — ids and slugs only.
 */
export async function getAllAgentsForSitemap(): Promise<{ id: string; slug: string }[]> {
  return (await db.select({ id: Agents.Id, slug: Agents.Slug }).from(Agents).where(eq(Agents.IsActive, true)))
    .map((R) => ({ id: R.id, slug: R.slug }));
}

/**
 * Get all lessons for sitemap — lesson ids with their agent slugs.
 */
export async function getAllLessonsForSitemap(): Promise<{ id: string; agentSlug: string }[]> {
  const Rows = await db.select({ id: Lessons.Id, agentId: Lessons.AgentId }).from(Lessons);
  const AgentIds = [...new Set(Rows.map((R) => R.agentId))];
  const AgentSlugs = await db.select({ id: Agents.Id, slug: Agents.Slug }).from(Agents).where(inArray(Agents.Id, AgentIds));
  const SlugMap = new Map(AgentSlugs.map((A) => [A.id, A.slug]));
  return Rows.map((R) => ({ id: R.id, agentSlug: SlugMap.get(R.agentId) ?? '' }));
}
