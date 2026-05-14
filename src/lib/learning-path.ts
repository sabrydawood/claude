import { getLessonsByAgent } from '@/lib/content/claude-lessons';

interface PathInput {
  goal: string;
  experience: string;
  learningStyle: string;
  ageGroup: string;
}

/**
 * Generates a personalized lesson order based on onboarding answers.
 * Returns an array of lesson IDs in the recommended order.
 */
export async function generateLearningPath(input: PathInput): Promise<number[]> {
  const allLessons = getLessonsByAgent('claude');

  // Score each lesson based on the user's profile
  const scored = allLessons.map(lesson => ({
    id: lesson.id,
    score: scorLesson(lesson, input),
  }));

  // Sort by score descending, then by original order as tiebreaker
  scored.sort((a, b) => b.score - a.score || a.id - b.id);

  return scored.map(s => s.id);
}

function scorLesson(
  lesson: { id: number; order: number; xpReward: number },
  input: PathInput
): number {
  let score = 100;

  // Beginners get lower-order lessons first (order is their priority)
  if (input.experience === 'none') {
    score -= lesson.order * 10;
  } else if (input.experience === 'advanced') {
    // Advanced users can start from anywhere, prefer higher-reward lessons
    score += lesson.xpReward;
  }

  // Game learners prefer shorter, higher-XP lessons
  if (input.learningStyle === 'game') {
    score += lesson.xpReward * 0.5;
  }

  // Children prefer lessons in strict order
  if (input.ageGroup === 'child') {
    score -= lesson.order * 20;
  }

  return score;
}
