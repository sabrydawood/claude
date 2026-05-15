import { db } from '@/lib/db';
import { agents, lessons, quizQuestions, quizOptions, translations } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

// ─── Exported types ────────────────────────────────────────────────────────────

export interface AgentRow {
  id: number;
  slug: string;
  color: string;
  emoji: string;
  isActive: boolean;
  order: number;
  name: string;
  description: string;
  fullDescription: string;
}

export interface LessonRow {
  id: number;
  agentId: number;
  order: number;
  xpReward: number;
  estimatedMinutes: number;
  title: string;
  description: string;
  content: string;
  agentSlug: string;
  agentEmoji: string;
  agentColor: string;
}

export interface QuizOptionRow {
  id: number;
  questionId: number;
  isCorrect: boolean;
  order: number;
  text: string;
}

export interface QuizQuestionRow {
  id: number;
  lessonId: number;
  type: 'multiple_choice' | 'true_false';
  order: number;
  question: string;
  options: QuizOptionRow[];
}

export interface LessonFull extends LessonRow {
  agentName: string;
  agentSlug: string;
  questions: QuizQuestionRow[];
}

// ─── Internal helper ───────────────────────────────────────────────────────────

function buildTransMap(
  trans: Array<{ entityId: number; field: string; value: string }>,
): Map<number, Record<string, string>> {
  const map = new Map<number, Record<string, string>>();
  for (const t of trans) {
    if (!map.has(t.entityId)) map.set(t.entityId, {});
    map.get(t.entityId)![t.field] = t.value;
  }
  return map;
}

// Fetch translations for a given entity type, set of IDs, and locale
async function fetchTranslations(
  entityType: string,
  entityIds: number[],
  locale: string,
) {
  if (entityIds.length === 0) return [];
  return db
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
}

// Fetch both locale and 'en' fallback translations, return [transMap, fallbackMap]
async function fetchWithFallback(
  entityType: string,
  entityIds: number[],
  locale: string,
): Promise<[Map<number, Record<string, string>>, Map<number, Record<string, string>>]> {
  const [localeTrans, enTrans] = await Promise.all([
    fetchTranslations(entityType, entityIds, locale),
    locale !== 'en' ? fetchTranslations(entityType, entityIds, 'en') : Promise.resolve([]),
  ]);
  return [buildTransMap(localeTrans), buildTransMap(enTrans)];
}

function resolve(
  id: number,
  field: string,
  transMap: Map<number, Record<string, string>>,
  fallbackMap: Map<number, Record<string, string>>,
): string {
  return transMap.get(id)?.[field] ?? fallbackMap.get(id)?.[field] ?? '';
}

// ─── Query functions ───────────────────────────────────────────────────────────

/**
 * Get all active agents ordered by `order`, with translations resolved for `locale`.
 */
export async function getAgents(locale: string): Promise<AgentRow[]> {
  const rows = await db
    .select()
    .from(agents)
    .where(eq(agents.isActive, true))
    .orderBy(agents.order);

  if (rows.length === 0) return [];

  const ids = rows.map((a) => a.id);
  const [transMap, fallbackMap] = await fetchWithFallback('agent', ids, locale);

  return rows.map((a) => ({
    id: a.id,
    slug: a.slug,
    color: a.color,
    emoji: a.emoji,
    isActive: a.isActive,
    order: a.order,
    name: resolve(a.id, 'name', transMap, fallbackMap),
    description: resolve(a.id, 'description', transMap, fallbackMap),
    fullDescription: resolve(a.id, 'full_description', transMap, fallbackMap),
  }));
}

/**
 * Get a single agent by slug, with translations resolved for `locale`.
 */
export async function getAgentBySlug(
  slug: string,
  locale: string,
): Promise<AgentRow | null> {
  const rows = await db
    .select()
    .from(agents)
    .where(eq(agents.slug, slug))
    .limit(1);

  if (rows.length === 0) return null;
  const a = rows[0];

  const [transMap, fallbackMap] = await fetchWithFallback('agent', [a.id], locale);

  return {
    id: a.id,
    slug: a.slug,
    color: a.color,
    emoji: a.emoji,
    isActive: a.isActive,
    order: a.order,
    name: resolve(a.id, 'name', transMap, fallbackMap),
    description: resolve(a.id, 'description', transMap, fallbackMap),
    fullDescription: resolve(a.id, 'full_description', transMap, fallbackMap),
  };
}

/**
 * Get lessons for an agent (identified by slug), with translations for `locale`.
 */
export async function getLessonsByAgent(
  agentSlug: string,
  locale: string,
): Promise<LessonRow[]> {
  const agentRows = await db
    .select()
    .from(agents)
    .where(eq(agents.slug, agentSlug))
    .limit(1);

  if (agentRows.length === 0) return [];
  const agent = agentRows[0];

  const lessonRows = await db
    .select()
    .from(lessons)
    .where(eq(lessons.agentId, agent.id))
    .orderBy(lessons.order);

  if (lessonRows.length === 0) return [];

  const lessonIds = lessonRows.map((l) => l.id);
  const [transMap, fallbackMap] = await fetchWithFallback('lesson', lessonIds, locale);

  return lessonRows.map((l) => ({
    id: l.id,
    agentId: l.agentId,
    order: l.order,
    xpReward: l.xpReward,
    estimatedMinutes: l.estimatedMinutes,
    title: resolve(l.id, 'title', transMap, fallbackMap),
    description: resolve(l.id, 'description', transMap, fallbackMap),
    content: resolve(l.id, 'content', transMap, fallbackMap),
    agentSlug: agent.slug,
    agentEmoji: agent.emoji,
    agentColor: agent.color,
  }));
}

/**
 * Get a single lesson by ID with full translations, quiz questions, and options.
 */
export async function getLessonById(
  id: number,
  locale: string,
): Promise<LessonFull | null> {
  const lessonRows = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, id))
    .limit(1);

  if (lessonRows.length === 0) return null;
  const lesson = lessonRows[0];

  // Fetch agent
  const agentRows = await db
    .select()
    .from(agents)
    .where(eq(agents.id, lesson.agentId))
    .limit(1);

  if (agentRows.length === 0) return null;
  const agent = agentRows[0];

  // Fetch quiz questions and options
  const questionRows = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.lessonId, id))
    .orderBy(quizQuestions.order);

  const questionIds = questionRows.map((q) => q.id);

  const optionRows =
    questionIds.length > 0
      ? await db
          .select()
          .from(quizOptions)
          .where(inArray(quizOptions.questionId, questionIds))
          .orderBy(quizOptions.order)
      : [];

  const optionIds = optionRows.map((o) => o.id);

  // Fetch all translations in parallel
  const [
    [lessonTransMap, lessonFallbackMap],
    [agentTransMap, agentFallbackMap],
    [questionTransMap, questionFallbackMap],
    [optionTransMap, optionFallbackMap],
  ] = await Promise.all([
    fetchWithFallback('lesson', [lesson.id], locale),
    fetchWithFallback('agent', [agent.id], locale),
    questionIds.length > 0
      ? fetchWithFallback('quiz_question', questionIds, locale)
      : Promise.resolve([new Map(), new Map()] as [Map<number, Record<string, string>>, Map<number, Record<string, string>>]),
    optionIds.length > 0
      ? fetchWithFallback('quiz_option', optionIds, locale)
      : Promise.resolve([new Map(), new Map()] as [Map<number, Record<string, string>>, Map<number, Record<string, string>>]),
  ]);

  // Build options grouped by questionId
  const optionsByQuestion = new Map<number, QuizOptionRow[]>();
  for (const opt of optionRows) {
    if (!optionsByQuestion.has(opt.questionId)) optionsByQuestion.set(opt.questionId, []);
    optionsByQuestion.get(opt.questionId)!.push({
      id: opt.id,
      questionId: opt.questionId,
      isCorrect: opt.isCorrect,
      order: opt.order,
      text: resolve(opt.id, 'text', optionTransMap, optionFallbackMap),
    });
  }

  const questions: QuizQuestionRow[] = questionRows.map((q) => ({
    id: q.id,
    lessonId: q.lessonId,
    type: q.type as 'multiple_choice' | 'true_false',
    order: q.order,
    question: resolve(q.id, 'question', questionTransMap, questionFallbackMap),
    options: optionsByQuestion.get(q.id) ?? [],
  }));

  return {
    id: lesson.id,
    agentId: lesson.agentId,
    order: lesson.order,
    xpReward: lesson.xpReward,
    estimatedMinutes: lesson.estimatedMinutes,
    title: resolve(lesson.id, 'title', lessonTransMap, lessonFallbackMap),
    description: resolve(lesson.id, 'description', lessonTransMap, lessonFallbackMap),
    content: resolve(lesson.id, 'content', lessonTransMap, lessonFallbackMap),
    agentSlug: agent.slug,
    agentEmoji: agent.emoji,
    agentColor: agent.color,
    agentName: resolve(agent.id, 'name', agentTransMap, agentFallbackMap),
    questions,
  };
}

/**
 * Get all agents for sitemap — just ids and slugs.
 */
export async function getAllAgentsForSitemap(): Promise<{ id: number; slug: string }[]> {
  return db
    .select({ id: agents.id, slug: agents.slug })
    .from(agents)
    .where(eq(agents.isActive, true));
}

/**
 * Get all lessons for sitemap — lesson ids with their agent slugs (inner join).
 */
export async function getAllLessonsForSitemap(): Promise<
  { id: number; agentSlug: string }[]
> {
  const rows = await db
    .select({
      id: lessons.id,
      agentSlug: agents.slug,
    })
    .from(lessons)
    .innerJoin(agents, eq(lessons.agentId, agents.id));

  return rows;
}
