import { db } from '@/lib/db/Index';
import { users, UserStats, UserAchievements, Achievements, AchievementTranslations } from '@/lib/db/Schema';
import { eq, and, inArray } from 'drizzle-orm';
import { GetValidLocale } from '@/lib/i18n/Locale.Utils';
import ProfileClient from './profile-client';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}) {
  const { locale, userId } = await params;
  const validLocale = GetValidLocale(locale);

  const [userRow] = await db
    .select({ Id: users.id, Name: users.name, Image: users.image, CreatedAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userRow) return <ProfileClient data={null} />;

  const [stats] = await db
    .select()
    .from(UserStats)
    .where(eq(UserStats.UserId, userId))
    .limit(1);

  const earnedData = await db
    .select({
      Id: Achievements.Id,
      Icon: Achievements.Icon,
      AchievementId: UserAchievements.AchievementId,
      EarnedAt: UserAchievements.EarnedAt,
    })
    .from(UserAchievements)
    .innerJoin(Achievements, eq(UserAchievements.AchievementId, Achievements.Id))
    .where(eq(UserAchievements.UserId, userId));

  const achIds = earnedData.map(e => e.Id);
  const transRows = achIds.length > 0
    ? await db.select().from(AchievementTranslations).where(
        and(inArray(AchievementTranslations.AchievementId, achIds)),
      )
    : [];

  const transMap = new Map<string, string>();
  for (const t of transRows) {
    transMap.set(`${t.AchievementId}_${t.Locale}`, t.Name);
  }
  const earnedAtMap = new Map(earnedData.map(e => [e.Id, e.EarnedAt]));

  const achievements = earnedData.map(e => ({
    id: e.Id,
    icon: e.Icon,
    name: transMap.get(`${e.Id}_${validLocale}`) ?? transMap.get(`${e.Id}_en`) ?? '',
    earnedAt: earnedAtMap.get(e.Id)?.toISOString() ?? '',
  }));

  return (
    <ProfileClient
      data={{
        user: {
          id: userRow.Id,
          name: userRow.Name ?? '',
          image: userRow.Image,
          memberSince: userRow.CreatedAt?.toISOString() ?? '',
        },
        stats: {
          totalXp: stats?.TotalXp ?? 0,
          streakDays: stats?.StreakDays ?? 0,
          lessonsCompleted: stats?.LessonsCompleted ?? 0,
          quizzesCompleted: stats?.QuizzesCompleted ?? 0,
        },
        achievements,
      }}
    />
  );
}
