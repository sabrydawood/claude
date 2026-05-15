import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userProgress, userStats, userAchievements, achievements, translations } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const locale = req.nextUrl.searchParams.get('locale') ?? 'ar';

  const [progressRows, stats, earnedRows, allAchievementRows] = await Promise.all([
    db.select().from(userProgress).where(eq(userProgress.userId, session.user.id)),
    db.select().from(userStats).where(eq(userStats.userId, session.user.id)).limit(1),
    db.select({ achievementId: userAchievements.achievementId })
      .from(userAchievements)
      .where(eq(userAchievements.userId, session.user.id)),
    db.select().from(achievements),
  ]);

  const completedLessons = progressRows.filter(r => r.completed).map(r => r.lessonId);
  const scores = Object.fromEntries(progressRows.map(r => [r.lessonId, r.score]));
  const stat = stats[0];

  // Build achievement list with translations
  const earnedIds = new Set(earnedRows.map(r => r.achievementId));
  const achIds = allAchievementRows.map(a => a.id);

  let transMap: Map<number, Record<string, string>> = new Map();
  let fallbackMap: Map<number, Record<string, string>> = new Map();

  if (achIds.length > 0) {
    const [localeTrans, enTrans] = await Promise.all([
      db.select({ entityId: translations.entityId, field: translations.field, value: translations.value })
        .from(translations)
        .where(and(eq(translations.entityType, 'achievement'), inArray(translations.entityId, achIds), eq(translations.locale, locale))),
      locale !== 'en'
        ? db.select({ entityId: translations.entityId, field: translations.field, value: translations.value })
            .from(translations)
            .where(and(eq(translations.entityType, 'achievement'), inArray(translations.entityId, achIds), eq(translations.locale, 'en')))
        : Promise.resolve([]),
    ]);

    for (const t of localeTrans) {
      if (!transMap.has(t.entityId)) transMap.set(t.entityId, {});
      transMap.get(t.entityId)![t.field] = t.value;
    }
    for (const t of enTrans) {
      if (!fallbackMap.has(t.entityId)) fallbackMap.set(t.entityId, {});
      fallbackMap.get(t.entityId)![t.field] = t.value;
    }
  }

  const userAchievementList = allAchievementRows.map(a => ({
    id: a.id,
    emoji: a.emoji,
    name: transMap.get(a.id)?.['name'] ?? fallbackMap.get(a.id)?.['name'] ?? '',
    description: transMap.get(a.id)?.['description'] ?? fallbackMap.get(a.id)?.['description'] ?? '',
    earned: earnedIds.has(a.id),
  }));

  return NextResponse.json({
    completedLessons,
    scores,
    totalXp: stat?.totalXp ?? 0,
    streakDays: stat?.streakDays ?? 0,
    quizzesCompleted: stat?.quizzesCompleted ?? 0,
    lessonsCompleted: stat?.lessonsCompleted ?? 0,
    achievements: userAchievementList,
  });
}
