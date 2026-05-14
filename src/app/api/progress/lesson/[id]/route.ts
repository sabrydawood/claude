import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userProgress, userStats } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

function calcStreak(lastActivityDate: Date | null, currentStreak: number): number {
  if (!lastActivityDate) return 1;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last = new Date(
    lastActivityDate.getFullYear(),
    lastActivityDate.getMonth(),
    lastActivityDate.getDate(),
  );
  const diffDays = Math.round((today.getTime() - last.getTime()) / 86_400_000);

  if (diffDays === 0) return currentStreak;        // already active today
  if (diffDays === 1) return currentStreak + 1;    // consecutive day
  return 1;                                         // streak broken
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

  // Upsert user_progress
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
    await db.insert(userProgress).values({
      userId,
      lessonId,
      completed: true,
      score,
      completedAt: new Date(),
    });
  }

  // Upsert user_stats with streak calculation
  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  const newStreak = calcStreak(stats?.lastActivityDate ?? null, stats?.streakDays ?? 0);

  if (stats) {
    await db
      .update(userStats)
      .set({
        totalXp: stats.totalXp + (isNewCompletion ? xpEarned : 0),
        streakDays: newStreak,
        lastActivityDate: new Date(),
        lessonsCompleted: stats.lessonsCompleted + (isNewCompletion ? 1 : 0),
        quizzesCompleted: stats.quizzesCompleted + (isNewCompletion ? 1 : 0),
      })
      .where(eq(userStats.userId, userId));
  } else {
    await db.insert(userStats).values({
      userId,
      totalXp: xpEarned,
      streakDays: 1,
      lastActivityDate: new Date(),
      lessonsCompleted: 1,
      quizzesCompleted: 1,
    });
  }

  return NextResponse.json({ ok: true, newStreak });
}
