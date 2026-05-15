import { http } from '@/lib/api/http-client';

export interface LessonCompletionData {
  NewAchievements: { Id: string; Icon: string; Name: string }[];
  XpEarned: number;
  TotalXp: number;
  StreakDays: number;
  QuizzesCompleted: number;
  LessonsCompleted: number;
}

export const ProgressService = {
  completeLesson: (lessonId: string, score: number) =>
    http.put<LessonCompletionData>(`/api/v1/progress/lesson/${lessonId}`, { Score: score }),
};
