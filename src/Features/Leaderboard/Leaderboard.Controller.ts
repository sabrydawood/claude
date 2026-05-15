/**
 * Leaderboard.Controller.ts
 * Returns top 50 users sorted by XP.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/Index';
import { users, UserStats } from '@/lib/db/Schema';
import { eq, desc } from 'drizzle-orm';

/**
 * GET /api/v1/leaderboard — returns top 50 users by XP.
 */
export async function GetLeaderboard(_Req: NextRequest): Promise<NextResponse> {
  const Rows = await db
    .select({
      UserId: UserStats.UserId,
      TotalXp: UserStats.TotalXp,
      StreakDays: UserStats.StreakDays,
      LessonsCompleted: UserStats.LessonsCompleted,
      Name: users.name,
      Image: users.image,
    })
    .from(UserStats)
    .innerJoin(users, eq(users.id, UserStats.UserId))
    .orderBy(desc(UserStats.TotalXp))
    .limit(50);

  return NextResponse.json({ Success: true, Data: { Leaderboard: Rows } });
}
