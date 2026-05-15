import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userStats, userAchievements, achievements, translations } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const locale = new URL(req.url).searchParams.get('locale') ?? 'ar';

  const [user] = await db
    .select({ id: users.id, name: users.name, image: users.image, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  const earnedRows = await db
    .select({ achievementId: userAchievements.achievementId, earnedAt: userAchievements.earnedAt })
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));

  let earnedAchievements: { id: number; emoji: string; name: string; earnedAt: Date }[] = [];

  if (earnedRows.length > 0) {
    const ids = earnedRows.map(r => r.achievementId);
    const achRows = await db
      .select({ id: achievements.id, emoji: achievements.emoji })
      .from(achievements)
      .where(inArray(achievements.id, ids));

    const transRows = await db
      .select()
      .from(translations)
      .where(
        and(
          eq(translations.entityType, 'achievement'),
          inArray(translations.entityId, ids),
        ),
      );

    const transMap = new Map<string, string>();
    for (const t of transRows) {
      transMap.set(`${t.entityId}_${t.locale}_${t.field}`, t.value);
    }

    earnedAchievements = achRows.map(a => ({
      id: a.id,
      emoji: a.emoji,
      name: transMap.get(`${a.id}_${locale}_name`) ?? transMap.get(`${a.id}_en_name`) ?? '',
      earnedAt: earnedRows.find(r => r.achievementId === a.id)!.earnedAt,
    }));
  }

  return NextResponse.json({
    user: { id: user.id, name: user.name, image: user.image, memberSince: user.createdAt },
    stats: {
      totalXp: stats?.totalXp ?? 0,
      streakDays: stats?.streakDays ?? 0,
      lessonsCompleted: stats?.lessonsCompleted ?? 0,
      quizzesCompleted: stats?.quizzesCompleted ?? 0,
    },
    achievements: earnedAchievements,
  });
}
