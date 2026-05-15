/**
 * Onboarding.Types.ts
 */

export enum EAgeGroup { Child = 'child', Teen = 'teen', Adult = 'adult' }
export enum EGoal { Chat = 'chat', Work = 'work', Creative = 'creative', Developer = 'developer', Educator = 'educator' }
export enum EExperience { None = 'none', Some = 'some', Advanced = 'advanced' }
export enum ELearningStyle { Visual = 'visual', Reading = 'reading', Practice = 'practice', Game = 'game' }

export interface IOnboardingInput {
  AgeGroup: EAgeGroup;
  Goal: EGoal;
  Experience: EExperience;
  LearningStyle: ELearningStyle;
  DailyMinutes: number;
}
