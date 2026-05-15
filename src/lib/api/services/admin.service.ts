import { http } from '@/lib/api/http-client';

export interface AdminLesson {
  Id: string;
  AgentId: string;
  AgentSlug: string;
  Order: number;
  XpReward: number;
  EstimatedMinutes: number;
  TitleAr: string;
  TitleEn: string;
  DescriptionAr: string;
  DescriptionEn: string;
}

export interface CreateLessonPayload {
  AgentId: string;
  Order: number;
  XpReward: number;
  EstimatedMinutes: number;
  TitleAr: string;
  TitleEn: string;
  DescriptionAr?: string;
  DescriptionEn?: string;
}

export const AdminService = {
  getLessons: () =>
    http.get<{ Lessons: AdminLesson[] }>('/api/v1/admin/lessons'),

  createLesson: (payload: CreateLessonPayload) =>
    http.post<{ LessonId: string }>('/api/v1/admin/lessons', payload),
};
