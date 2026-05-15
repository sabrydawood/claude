import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userStats } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(_req: NextRequest) {
  const rows = await db
    .select({
      userId: userStats.userId,
      totalXp: userStats.totalXp,
      streakDays: userStats.streakDays,
      lessonsCompleted: userStats.lessonsCompleted,
      name: users.name,
      image: users.image,
    })
    .from(userStats)
    .innerJoin(users, eq(users.id, userStats.userId))
    .orderBy(desc(userStats.totalXp))
    .limit(50);

  return NextResponse.json({ leaderboard: rows });
}
