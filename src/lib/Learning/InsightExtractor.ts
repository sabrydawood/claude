import { db } from '@/lib/db/Index';
import { eq, gte, desc, and } from 'drizzle-orm';
import { LearningSignals, StudentInsights, StudentMastery } from '@/lib/db/Schema';

interface ExtractedInsights {
  learningStyle: string;
  weakConcepts: string[];
  strongConcepts: string[];
  preferredTime: string;
  avgSessionScore: number;
}

export async function ExtractInsightsForUser(userId: string): Promise<void> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Get recent learning signals
  const signals = await db
    .select()
    .from(LearningSignals)
    .where(and(eq(LearningSignals.UserId, userId), gte(LearningSignals.CreatedAt, weekAgo)))
    .orderBy(desc(LearningSignals.CreatedAt))
    .limit(100);

  if (signals.length === 0) return;

  // Get mastery scores
  const masteryRows = await db
    .select({ ConceptId: StudentMastery.ConceptId, Score: StudentMastery.Score })
    .from(StudentMastery)
    .where(eq(StudentMastery.UserId, userId));

  // Analyze patterns
  const correctCount = signals.filter(s => s.SignalType === 'quiz_correct').length;
  const totalQuiz = signals.filter(s => s.SignalType.startsWith('quiz_')).length;
  const avgScore = totalQuiz > 0 ? Math.round((correctCount / totalQuiz) * 100) : 0;

  const weakConcepts = masteryRows.filter(m => m.Score < 50).map(m => m.ConceptId).slice(0, 5);
  const strongConcepts = masteryRows.filter(m => m.Score >= 80).map(m => m.ConceptId).slice(0, 5);

  const insights: ExtractedInsights = {
    learningStyle: avgScore >= 70 ? 'visual_fast' : 'methodical',
    weakConcepts,
    strongConcepts,
    preferredTime: 'afternoon',
    avgSessionScore: avgScore,
  };

  // Upsert StudentInsights
  await db
    .insert(StudentInsights)
    .values({ UserId: userId, Insights: JSON.stringify(insights) })
    .onConflictDoUpdate({
      target: [StudentInsights.UserId],
      set: { Insights: JSON.stringify(insights), UpdatedAt: new Date() },
    });
}
