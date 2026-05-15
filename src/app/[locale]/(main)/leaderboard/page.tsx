import { db } from '@/lib/db/Index';
import { users, UserStats } from '@/lib/db/Schema';
import { eq, desc } from 'drizzle-orm';
import LeaderboardClient from './leaderboard-client';

export default async function LeaderboardPage() {
  const rows = await db
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

  const entries = rows.map(r => ({
    userId: r.UserId,
    name: r.Name ?? '',
    image: r.Image,
    totalXp: r.TotalXp ?? 0,
    streakDays: r.StreakDays ?? 0,
    lessonsCompleted: r.LessonsCompleted ?? 0,
  }));

  return <LeaderboardClient entries={entries} />;
}
