import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userProgress, userStats, achievements, userAchievements } from '@/lib/db/schema';
import { eq, and, notInArray } from 'drizzle-orm';

function calcStreak(lastActivityDate: Date | null, currentStreak: number): number {
  if (!lastActivityDate) return 1;
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const last = new Date(
    lastActivityDate.getFullYear(),
    lastActivityDate.getMonth(),
    lastActivityDate.getDate(),
  );
  const diffDays = Math.round((todayMidnight.getTime() - last.getTime()) / 86_400_000);
  if (diffDays === 0) return currentStreak;
  if (diffDays === 1) return currentStreak + 1;
  return 1;
}

async function checkAndGrantAchievements(
  userId: string,
  lessonsCompleted: number,
  streakDays: number,
  totalXp: number,
) {
  // All achievements not yet earned by this user
  const earned = await db
    .select({ achievementId: userAchievements.achievementId })
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));

  const earnedIds = earned.map(r => r.achievementId);

  const pending = earnedIds.length > 0
    ? await db.select().from(achievements).where(notInArray(achievements.id, earnedIds))
    : await db.select().from(achievements);

  const newlyEarned: number[] = [];

  for (const ach of pending) {
    let met = false;
    if (ach.conditionType === 'lessons_completed' && lessonsCompleted >= ach.conditionValue) met = true;
    if (ach.conditionType === 'streak_days' && streakDays >= ach.conditionValue) met = true;
    if (ach.conditionType === 'xp_earned' && totalXp >= ach.conditionValue) met = true;
    if (met) newlyEarned.push(ach.id);
  }

  if (newlyEarned.length > 0) {
    await db.insert(userAchievements).values(
      newlyEarned.map(achievementId => ({ userId, achievementId })),
    );
  }

  return newlyEarned;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const lessonId = parseInt(id);
  if (isNaN(lessonId)) {
    return NextResponse.json({ error: 'Invalid lesson id' }, { status: 400 });
  }

  const body = await req.json() as { score: number; xpEarned: number };
  const { score, xpEarned } = body;
  const userId = session.user.id;

  const [existing] = await db
    .select()
    .from(userProgress)
    .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId)))
    .limit(1);

  const isNewCompletion = !existing?.completed;

  if (existing) {
    await db
      .update(userProgress)
      .set({ completed: true, score, completedAt: new Date(), updatedAt: new Date() })
      .where(eq(userProgress.id, existing.id));
  } else {
    await db.insert(userProgress).values({ userId, lessonId, completed: true, score, completedAt: new Date() });
  }

  const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
  const newStreak = calcStreak(stats?.lastActivityDate ?? null, stats?.streakDays ?? 0);
  const newLessons = (stats?.lessonsCompleted ?? 0) + (isNewCompletion ? 1 : 0);
  const newXp = (stats?.totalXp ?? 0) + (isNewCompletion ? xpEarned : 0);

  if (stats) {
    await db.update(userStats).set({
      totalXp: newXp,
      streakDays: newStreak,
      lastActivityDate: new Date(),
      lessonsCompleted: newLessons,
      quizzesCompleted: stats.quizzesCompleted + (isNewCompletion ? 1 : 0),
    }).where(eq(userStats.userId, userId));
  } else {
    await db.insert(userStats).values({
      userId, totalXp: xpEarned, streakDays: 1,
      lastActivityDate: new Date(), lessonsCompleted: 1, quizzesCompleted: 1,
    });
  }

  // Check achievements after updating stats
  const newAchievements = isNewCompletion
    ? await checkAndGrantAchievements(userId, newLessons, newStreak, newXp).catch(() => [])
    : [];

  return NextResponse.json({ ok: true, newStreak, newAchievements });
}
