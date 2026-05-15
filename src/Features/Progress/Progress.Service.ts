/**
 * Progress.Service.ts
 * Business logic for learning progress, XP, streaks, and achievements.
 *
 * SECURITY: XP is always fetched from lessons.XpReward in the DB.
 * It is never accepted from the request body (SEV-001 fix).
 */
import { db } from '@/lib/db/Index';
import {
  Lessons,
  UserProgress,
  UserStats,
  Achievements,
  UserAchievements,
  AchievementTranslations,
} from '@/lib/db/Schema';
import { eq, and, notInArray, inArray } from 'drizzle-orm';
import type { IAchievementInfo, ILessonCompletionResponse } from './Progress.Types';

/**
 * Calculates the new streak count based on last activity date.
 * @param LastActivityDate - Date of last completed lesson, or null if never
 * @param CurrentStreak - Current consecutive days count
 */
export function CalcStreak(LastActivityDate: Date | null, CurrentStreak: number): number {
  if (!LastActivityDate) return 1;
  const Today = new Date();
  const TodayMidnight = new Date(Today.getFullYear(), Today.getMonth(), Today.getDate());
  const Last = new Date(
    LastActivityDate.getFullYear(),
    LastActivityDate.getMonth(),
    LastActivityDate.getDate(),
  );
  const DiffDays = Math.round((TodayMidnight.getTime() - Last.getTime()) / 86_400_000);
  if (DiffDays === 0) return CurrentStreak;
  if (DiffDays === 1) return CurrentStreak + 1;
  return 1;
}

/**
 * Checks which achievements the user newly qualifies for and grants them.
 * @param UserId - User's UUID
 * @param LessonsCompleted - Updated lesson count
 * @param StreakDays - Updated streak count
 * @param TotalXp - Updated XP total
 */
async function CheckAndGrantAchievements(
  UserId: string,
  LessonsCompleted: number,
  StreakDays: number,
  TotalXp: number,
): Promise<IAchievementInfo[]> {
  const Earned = await db
    .select({ AchievementId: UserAchievements.AchievementId })
    .from(UserAchievements)
    .where(eq(UserAchievements.UserId, UserId));

  const EarnedIds = Earned.map((R) => R.AchievementId);

  const Pending =
    EarnedIds.length > 0
      ? await db.select().from(Achievements).where(notInArray(Achievements.Id, EarnedIds))
      : await db.select().from(Achievements);

  const NewlyEarned = Pending.filter((Ach) => {
    if (Ach.ConditionType === 'lessons_completed') return LessonsCompleted >= Ach.ConditionValue;
    if (Ach.ConditionType === 'streak_days') return StreakDays >= Ach.ConditionValue;
    if (Ach.ConditionType === 'xp_earned') return TotalXp >= Ach.ConditionValue;
    return false;
  });

  if (NewlyEarned.length === 0) return [];

  await db.insert(UserAchievements).values(
    NewlyEarned.map(({ Id: AchievementId }) => ({ UserId, AchievementId })),
  );

  const NewIds = NewlyEarned.map((A) => A.Id);
  const AchTrans = await db
    .select()
    .from(AchievementTranslations)
    .where(and(inArray(AchievementTranslations.AchievementId, NewIds)));

  const NameMap = new Map<string, string>();
  for (const T of AchTrans) {
    NameMap.set(`${T.AchievementId}:${T.Locale}`, T.Name);
  }

  return NewlyEarned.map((Ach) => ({
    Id: Ach.Id,
    Emoji: Ach.Emoji,
    NameAr: NameMap.get(`${Ach.Id}:ar`) ?? Ach.Emoji,
    NameEn: NameMap.get(`${Ach.Id}:en`) ?? Ach.Emoji,
  }));
}

/**
 * Marks a lesson as complete, awards XP from DB (not from client), updates streak.
 * @param UserId - Authenticated user's ID
 * @param LessonId - Lesson being completed
 * @param Score - Quiz score (0–100), validated by caller
 */
export async function CompleteLessonService(
  UserId: string,
  LessonId: string,
  Score: number,
): Promise<ILessonCompletionResponse> {
  // SECURITY: XP is fetched from DB — never trusted from the client
  const [LessonRow] = await db
    .select({ XpReward: Lessons.XpReward })
    .from(Lessons)
    .where(eq(Lessons.Id, LessonId))
    .limit(1);

  if (!LessonRow) throw Object.assign(new Error('Lesson not found'), { Code: 'LESSON_NOT_FOUND' });

  const XpEarned = LessonRow.XpReward;

  // Upsert progress record (UNIQUE constraint on UserId+LessonId prevents duplicates)
  const [Existing] = await db
    .select({ Id: UserProgress.Id, Completed: UserProgress.Completed })
    .from(UserProgress)
    .where(and(eq(UserProgress.UserId, UserId), eq(UserProgress.LessonId, LessonId)))
    .limit(1);

  const IsNewCompletion = !Existing?.Completed;

  if (Existing) {
    await db
      .update(UserProgress)
      .set({ Completed: true, Score, CompletedAt: new Date(), UpdatedAt: new Date() })
      .where(eq(UserProgress.Id, Existing.Id));
  } else {
    await db
      .insert(UserProgress)
      .values({ UserId, LessonId, Completed: true, Score, CompletedAt: new Date() });
  }

  const [Stats] = await db
    .select()
    .from(UserStats)
    .where(eq(UserStats.UserId, UserId))
    .limit(1);

  const NewStreak = CalcStreak(Stats?.LastActivityDate ?? null, Stats?.StreakDays ?? 0);
  const NewLessons = (Stats?.LessonsCompleted ?? 0) + (IsNewCompletion ? 1 : 0);
  const NewXp = (Stats?.TotalXp ?? 0) + (IsNewCompletion ? XpEarned : 0);

  if (Stats) {
    await db
      .update(UserStats)
      .set({
        TotalXp: NewXp,
        StreakDays: NewStreak,
        LastActivityDate: new Date(),
        LessonsCompleted: NewLessons,
        QuizzesCompleted: Stats.QuizzesCompleted + (IsNewCompletion ? 1 : 0),
      })
      .where(eq(UserStats.UserId, UserId));
  } else {
    await db.insert(UserStats).values({
      UserId,
      TotalXp: XpEarned,
      StreakDays: 1,
      LastActivityDate: new Date(),
      LessonsCompleted: 1,
      QuizzesCompleted: 1,
    });
  }

  const NewAchievements = IsNewCompletion
    ? await CheckAndGrantAchievements(UserId, NewLessons, NewStreak, NewXp).catch(() => [])
    : [];

  return { Ok: true, NewStreak, NewAchievements };
}
