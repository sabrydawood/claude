/**
 * Progress.Types.ts
 * TypeScript types for the Progress feature.
 * Note: All IDs are UUID strings (uuidv7) in the new schema.
 */

export interface IAchievementInfo {
  Id: string;
  Icon: string;
  NameAr: string;
  NameEn: string;
}

export interface ILessonCompletionResponse {
  Ok: boolean;
  NewStreak: number;
  NewAchievements: IAchievementInfo[];
}

export interface IProgressResponse {
  CompletedLessons: string[];
  Scores: Record<string, number>;
  TotalXp: number;
  StreakDays: number;
  QuizzesCompleted: number;
  LessonsCompleted: number;
  Achievements: IUserAchievementItem[];
}

export interface IUserAchievementItem {
  Id: string;
  Icon: string;
  Name: string;
  Description: string;
  Earned: boolean;
}
