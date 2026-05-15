/**
 * Admin.Controller.ts
 * Admin-only lesson management endpoints.
 */
import { NextRequest, NextResponse } from 'next/server';
import { GetSessionOrUnauthorized } from '@/Shared/Middleware/Auth.Middleware';
import { ParseBodyOrBadRequest } from '@/Shared/Middleware/Validation.Middleware';
import { IsAdminEmail } from '@/Features/Auth/Auth.Admin';
import { db } from '@/lib/db/Index';
import { Agents, Lessons, LessonTranslations } from '@/lib/db/Schema';
import { eq, and, inArray } from 'drizzle-orm';
import { CreateLessonSchema } from './Admin.Schemas';
import { GetRequestError } from '@/lib/i18n/Api.Errors';

async function GetAdminSession(Req: NextRequest) {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;
  if (!IsAdminEmail(Session.user.email)) {
    return NextResponse.json({ Success: false, Error: { Code: 'FORBIDDEN', Message: 'غير مصرح' } }, { status: 403 });
  }
  return Session;
}

/**
 * GET /api/v1/admin/lessons — lists all lessons with translations.
 */
export async function GetAdminLessons(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetAdminSession(Req);
  if (Session instanceof NextResponse) return Session;

  const AllLessons = await db.select().from(Lessons).orderBy(Lessons.AgentId, Lessons.Order);
  if (AllLessons.length === 0) return NextResponse.json({ Success: true, Data: { Lessons: [] } });

  const Ids = AllLessons.map((L) => L.Id);
  const [Trans, AllAgents] = await Promise.all([
    db.select().from(LessonTranslations).where(inArray(LessonTranslations.LessonId, Ids)),
    db.select({ Id: Agents.Id, Slug: Agents.Slug }).from(Agents),
  ]);

  const TransByLesson = new Map<string, string>();
  for (const T of Trans) {
    TransByLesson.set(`${T.LessonId}:${T.Locale}:title`, T.Title);
    TransByLesson.set(`${T.LessonId}:${T.Locale}:description`, T.Description);
  }
  const AgentMap = new Map(AllAgents.map((A) => [A.Id, A.Slug]));

  const Result = AllLessons.map((L) => ({
    Id: L.Id,
    AgentId: L.AgentId,
    AgentSlug: AgentMap.get(L.AgentId) ?? '',
    Order: L.Order,
    XpReward: L.XpReward,
    EstimatedMinutes: L.EstimatedMinutes,
    TitleAr: TransByLesson.get(`${L.Id}:ar:title`) ?? '',
    TitleEn: TransByLesson.get(`${L.Id}:en:title`) ?? '',
    DescriptionAr: TransByLesson.get(`${L.Id}:ar:description`) ?? '',
    DescriptionEn: TransByLesson.get(`${L.Id}:en:description`) ?? '',
  }));

  return NextResponse.json({ Success: true, Data: { Lessons: Result } });
}

/**
 * POST /api/v1/admin/lessons — creates a new lesson with translations.
 */
export async function PostCreateLesson(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetAdminSession(Req);
  if (Session instanceof NextResponse) return Session;

  const Body = await ParseBodyOrBadRequest(Req, CreateLessonSchema);
  if (Body instanceof NextResponse) return Body;

  const [AgentRow] = await db.select({ Id: Agents.Id }).from(Agents).where(eq(Agents.Id, Body.AgentId)).limit(1);
  if (!AgentRow) {
    const Error = await GetRequestError(Req, 'AGENT_NOT_FOUND');
    return NextResponse.json({ Success: false, Error }, { status: 404 });
  }

  const [Lesson] = await db
    .insert(Lessons)
    .values({
      AgentId: Body.AgentId,
      Order: Body.Order ?? 0,
      XpReward: Body.XpReward ?? 50,
      EstimatedMinutes: Body.EstimatedMinutes ?? 5,
    })
    .returning();

  const TransRows: { LessonId: string; Locale: string; Title: string; Description: string; Content: string }[] = [
    { LessonId: Lesson.Id, Locale: 'ar', Title: Body.TitleAr, Description: Body.DescriptionAr ?? '', Content: '' },
    { LessonId: Lesson.Id, Locale: 'en', Title: Body.TitleEn, Description: Body.DescriptionEn ?? '', Content: '' },
  ];

  await db.insert(LessonTranslations).values(TransRows);

  return NextResponse.json({ Success: true, Data: { LessonId: Lesson.Id } }, { status: 201 });
}
