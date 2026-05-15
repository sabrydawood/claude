/**
 * Progress.Controller.ts
 * HTTP handlers for the Progress feature.
 */
import { NextRequest, NextResponse } from 'next/server';
import { GetSessionOrUnauthorized } from '@/Shared/Middleware/Auth.Middleware';
import { ParseBodyOrBadRequest } from '@/Shared/Middleware/Validation.Middleware';
import { db } from '@/lib/db/Index';
import {
  UserProgress,
  UserStats,
  UserAchievements,
  Achievements,
  AchievementTranslations,
} from '@/lib/db/Schema';
import { eq, and, inArray } from 'drizzle-orm';
import { LessonCompletionSchema } from './Progress.Schemas';
import { CompleteLessonService } from './Progress.Service';
import type { IProgressResponse } from './Progress.Types';
import { GetValidLocale } from '@/lib/i18n/Locale.Utils';

/**
 * GET /api/v1/progress — returns user's full progress, stats, and achievements.
 */
export async function GetUserProgress(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const Locale = GetValidLocale(Req.nextUrl.searchParams.get('locale'));
  const UserId = Session.user.id;

  const [ProgressRows, StatsArr, EarnedRows, AllAchievements] = await Promise.all([
    db.select().from(UserProgress).where(eq(UserProgress.UserId, UserId)),
    db.select().from(UserStats).where(eq(UserStats.UserId, UserId)).limit(1),
    db.select({ AchievementId: UserAchievements.AchievementId }).from(UserAchievements).where(eq(UserAchievements.UserId, UserId)),
    db.select().from(Achievements),
  ]);

  const Stats = StatsArr[0];
  const CompletedLessons = ProgressRows.filter((R) => R.Completed).map((R) => R.LessonId);
  const Scores = Object.fromEntries(ProgressRows.map((R) => [R.LessonId, R.Score]));
  const EarnedIds = new Set(EarnedRows.map((R) => R.AchievementId));
  const AchIds = AllAchievements.map((A) => A.Id);

  const AchTrans = AchIds.length > 0
    ? await db.select().from(AchievementTranslations).where(
        and(inArray(AchievementTranslations.AchievementId, AchIds)),
      )
    : [];

  const TransMap = new Map<string, string>();
  for (const T of AchTrans) {
    TransMap.set(`${T.AchievementId}:${T.Locale}:name`, T.Name);
    TransMap.set(`${T.AchievementId}:${T.Locale}:description`, T.Description);
  }

  const AchievementList = AllAchievements.map((A) => ({
    Id: A.Id,
    Icon: A.Icon,
    Name: TransMap.get(`${A.Id}:${Locale}:name`) ?? TransMap.get(`${A.Id}:en:name`) ?? '',
    Description: TransMap.get(`${A.Id}:${Locale}:description`) ?? TransMap.get(`${A.Id}:en:description`) ?? '',
    Earned: EarnedIds.has(A.Id),
  }));

  const Response: IProgressResponse = {
    CompletedLessons,
    Scores,
    TotalXp: Stats?.TotalXp ?? 0,
    StreakDays: Stats?.StreakDays ?? 0,
    QuizzesCompleted: Stats?.QuizzesCompleted ?? 0,
    LessonsCompleted: Stats?.LessonsCompleted ?? 0,
    Achievements: AchievementList,
  };

  return NextResponse.json({ Success: true, Data: Response });
}

/**
 * PUT /api/v1/progress/lesson/:id — marks a lesson complete, awards XP from DB.
 */
export async function PutLessonProgress(
  Req: NextRequest,
  LessonId: string,
): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const Body = await ParseBodyOrBadRequest(Req, LessonCompletionSchema);
  if (Body instanceof NextResponse) return Body;

  try {
    const Result = await CompleteLessonService(Session.user.id, LessonId, Body.Score);
    return NextResponse.json({ Success: true, Data: Result });
  } catch (Err: unknown) {
    const Code = (Err as { Code?: string }).Code ?? 'INTERNAL_ERROR';
    if (Code === 'LESSON_NOT_FOUND') {
      return NextResponse.json({ Success: false, Error: { Code } }, { status: 404 });
    }
    return NextResponse.json({ Success: false, Error: { Code } }, { status: 500 });
  }
}
