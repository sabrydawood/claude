/**
 * Onboarding.Schemas.ts
 */
import { z } from 'zod';
import { EAgeGroup, EGoal, EExperience, ELearningStyle } from './Onboarding.Types';

export const OnboardingSchema = z.object({
  AgeGroup:      z.nativeEnum(EAgeGroup),
  Goal:          z.nativeEnum(EGoal),
  Experience:    z.nativeEnum(EExperience),
  LearningStyle: z.nativeEnum(ELearningStyle),
  DailyMinutes:  z.number().int().min(5).max(480),
});

export type TOnboardingInput = z.infer<typeof OnboardingSchema>;
