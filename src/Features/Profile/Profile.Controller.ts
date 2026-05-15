/**
 * Profile.Controller.ts
 * Public user profile endpoint.
 *
 * SEV-012: Uses JOIN query and Map for O(1) lookups instead of N+1 pattern.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/Index';
import { users, UserStats, UserAchievements, Achievements, AchievementTranslations } from '@/lib/db/Schema';
import { eq, and, inArray } from 'drizzle-orm';
import { GetValidLocale } from '@/lib/i18n/Locale.Utils';

/**
 * GET /api/v1/profile/:userId — public user profile with stats and achievements.
 */
export async function GetUserProfile(
  Req: NextRequest,
  UserId: string,
): Promise<NextResponse> {
  const Locale = GetValidLocale(new URL(Req.url).searchParams.get('locale'));

  const [UserRow] = await db
    .select({ Id: users.id, Name: users.name, Image: users.image, CreatedAt: users.createdAt })
    .from(users)
    .where(eq(users.id, UserId))
    .limit(1);

  if (!UserRow) {
    return NextResponse.json({ Success: false, Error: { Code: 'NOT_FOUND', Message: 'المستخدم غير موجود' } }, { status: 404 });
  }

  const [Stats] = await db
    .select()
    .from(UserStats)
    .where(eq(UserStats.UserId, UserId))
    .limit(1);

  // SEV-012: Single JOIN query — no N+1
  const EarnedData = await db
    .select({
      Id: Achievements.Id,
      Emoji: Achievements.Emoji,
      AchievementId: UserAchievements.AchievementId,
      EarnedAt: UserAchievements.EarnedAt,
    })
    .from(UserAchievements)
    .innerJoin(Achievements, eq(UserAchievements.AchievementId, Achievements.Id))
    .where(eq(UserAchievements.UserId, UserId));

  const AchIds = EarnedData.map((E) => E.Id);
  const TransRows = AchIds.length > 0
    ? await db.select().from(AchievementTranslations).where(
        and(inArray(AchievementTranslations.AchievementId, AchIds)),
      )
    : [];

  // SEV-012: Map for O(1) name lookup instead of find() inside map()
  const TransMap = new Map<string, string>();
  for (const T of TransRows) {
    TransMap.set(`${T.AchievementId}_${T.Locale}`, T.Name);
  }
  const EarnedAtMap = new Map(EarnedData.map((E) => [E.Id, E.EarnedAt]));

  const AchievementList = EarnedData.map((E) => ({
    Id: E.Id,
    Emoji: E.Emoji,
    Name: TransMap.get(`${E.Id}_${Locale}`) ?? TransMap.get(`${E.Id}_en`) ?? '',
    EarnedAt: EarnedAtMap.get(E.Id)!,
  }));

  return NextResponse.json({
    Success: true,
    Data: {
      User: { Id: UserRow.Id, Name: UserRow.Name, Image: UserRow.Image, MemberSince: UserRow.CreatedAt },
      Stats: {
        TotalXp: Stats?.TotalXp ?? 0,
        StreakDays: Stats?.StreakDays ?? 0,
        LessonsCompleted: Stats?.LessonsCompleted ?? 0,
        QuizzesCompleted: Stats?.QuizzesCompleted ?? 0,
      },
      Achievements: AchievementList,
    },
  });
}
