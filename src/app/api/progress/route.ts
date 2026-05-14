import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userProgress, userStats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [progressRows, stats] = await Promise.all([
    db.select().from(userProgress).where(eq(userProgress.userId, session.user.id)),
    db.select().from(userStats).where(eq(userStats.userId, session.user.id)).limit(1),
  ]);

  const completedLessons = progressRows.filter(r => r.completed).map(r => r.lessonId);
  const scores = Object.fromEntries(progressRows.map(r => [r.lessonId, r.score]));
  const stat = stats[0];

  return NextResponse.json({
    completedLessons,
    scores,
    totalXp: stat?.totalXp ?? 0,
    streakDays: stat?.streakDays ?? 0,
    quizzesCompleted: stat?.quizzesCompleted ?? 0,
    lessonsCompleted: stat?.lessonsCompleted ?? 0,
  });
}
