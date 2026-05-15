/**
 * Profile.Types.ts
 */
export interface IPublicProfile {
  User: { Id: string; Name: string; Image: string | null; MemberSince: Date };
  Stats: { TotalXp: number; StreakDays: number; LessonsCompleted: number; QuizzesCompleted: number };
  Achievements: Array<{ Id: number; Emoji: string; Name: string; EarnedAt: Date }>;
}
