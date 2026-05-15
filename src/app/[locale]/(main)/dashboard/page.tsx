import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/server-session';
import { db } from '@/lib/db/Index';
import {
  UserPreferences,
  LearningPaths,
  UserProgress,
  UserStats,
  UserAchievements,
  Achievements,
  AchievementTranslations,
} from '@/lib/db/Schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getLessonsByAgent, getSubjects } from '@/lib/db/queries/content';
import { GetValidLocale } from '@/lib/i18n/Locale.Utils';
import DashboardClient from './dashboard-client';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession();

  if (!session?.user?.id) redirect(`/${locale}/login`);

  const userId = session.user.id;
  const validLocale = GetValidLocale(locale);

  const [prefs] = await db
    .select({ OnboardingCompleted: UserPreferences.OnboardingCompleted })
    .from(UserPreferences)
    .where(eq(UserPreferences.UserId, userId))
    .limit(1);

  if (!prefs?.OnboardingCompleted) redirect(`/${locale}/onboarding`);

  const [progressRows, statsArr, earnedRows, allAchievements, lessonOrderRow, lessons, subjects] = await Promise.all([
    db.select().from(UserProgress).where(eq(UserProgress.UserId, userId)),
    db.select().from(UserStats).where(eq(UserStats.UserId, userId)).limit(1),
    db.select({ AchievementId: UserAchievements.AchievementId }).from(UserAchievements).where(eq(UserAchievements.UserId, userId)),
    db.select().from(Achievements),
    db.select({ LessonOrder: LearningPaths.LessonOrder }).from(LearningPaths).where(eq(LearningPaths.UserId, userId)).limit(1),
    getLessonsByAgent('claude', validLocale),
    getSubjects(validLocale),
  ]);

  const stats = statsArr[0];
  const completedLessons = progressRows.filter(r => r.Completed).map(r => r.LessonId);
  const scores = Object.fromEntries(progressRows.map(r => [r.LessonId, r.Score ?? 0]));
  const earnedIds = new Set(earnedRows.map(r => r.AchievementId));
  const achIds = allAchievements.map(a => a.Id);

  const achTrans = achIds.length > 0
    ? await db.select().from(AchievementTranslations).where(
        and(inArray(AchievementTranslations.AchievementId, achIds)),
      )
    : [];

  const transMap = new Map<string, string>();
  for (const t of achTrans) {
    transMap.set(`${t.AchievementId}:${t.Locale}:name`, t.Name);
    transMap.set(`${t.AchievementId}:${t.Locale}:description`, t.Description);
  }

  const achievements = allAchievements.map(a => ({
    id: a.Id,
    icon: a.Icon,
    name: transMap.get(`${a.Id}:${validLocale}:name`) ?? transMap.get(`${a.Id}:en:name`) ?? '',
    description: transMap.get(`${a.Id}:${validLocale}:description`) ?? transMap.get(`${a.Id}:en:description`) ?? '',
    earned: earnedIds.has(a.Id),
  }));

  return (
    <DashboardClient
      userName={session.user.name ?? ''}
      progress={{
        completedLessons,
        totalXp: stats?.TotalXp ?? 0,
        streakDays: stats?.StreakDays ?? 0,
        quizzesCompleted: stats?.QuizzesCompleted ?? 0,
        scores,
        achievements,
      }}
      lessons={lessons.map(l => ({
        id: l.id,
        title: l.title,
        estimatedMinutes: l.estimatedMinutes,
        xpReward: l.xpReward,
      }))}
      lessonOrder={lessonOrderRow[0]?.LessonOrder as string[] | null ?? null}
      subjects={subjects}
    />
  );
}
