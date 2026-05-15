/**
 * Leaderboard.Types.ts
 */
export interface ILeaderboardEntry {
  UserId: string;
  Name: string;
  Image: string | null;
  TotalXp: number;
  StreakDays: number;
  LessonsCompleted: number;
}
