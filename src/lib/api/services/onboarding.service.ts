import { http } from '@/lib/api/http-client';

export interface OnboardingPayload {
  AgeGroup: string;
  Goal: string;
  Experience: string;
  LearningStyle: string;
  DailyMinutes: number;
}

export const OnboardingService = {
  submit: (payload: OnboardingPayload) =>
    http.post<{ Ok: boolean }>('/api/v1/onboarding', payload),
};
