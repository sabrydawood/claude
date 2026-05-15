/**
 * Onboarding.Service.ts
 * Generates personalized learning path based on onboarding answers.
 *
 * SEV-008: agentSlug is parameterized — not hardcoded to 'claude'.
 */
import { getLessonsByAgent } from '@/lib/db/queries/content';
import type { TOnboardingInput } from './Onboarding.Schemas';

/**
 * Determines which learning track fits the user's goal and experience.
 */
export function ResolveTrack(Goal: string, Experience: string): string {
  if (Goal === 'developer') return 'developer';
  if (Goal === 'educator') return 'educator';
  if (Goal === 'creative') return 'creator';
  if (Experience === 'advanced') return 'engineer';
  return 'explorer';
}

/**
 * Scores a lesson for personalized ordering based on user profile.
 */
function ScoreLesson(
  Lesson: { id: string; order: number; xpReward: number },
  Input: TOnboardingInput,
): number {
  let S = 100;
  if (Input.Experience === 'none') S -= Lesson.order * 10;
  else if (Input.Experience === 'advanced') S += Lesson.xpReward;
  if (Input.LearningStyle === 'game') S += Lesson.xpReward * 0.5;
  if (Input.AgeGroup === 'child') S -= Lesson.order * 20;
  return S;
}

/**
 * Generates a personalized lesson order for the user.
 * @param Input - Validated onboarding answers
 * @param AgentSlug - Which agent's lessons to include (defaults to 'claude')
 */
export async function GenerateLearningPath(
  Input: TOnboardingInput,
  AgentSlug: string = 'claude',
): Promise<string[]> {
  const AllLessons = await getLessonsByAgent(AgentSlug, 'en');
  const Scored = AllLessons.map((L) => ({ id: L.id, order: L.order, score: ScoreLesson(L, Input) }));
  Scored.sort((A, B) => B.score - A.score || A.order - B.order);
  return Scored.map((S) => S.id);
}
