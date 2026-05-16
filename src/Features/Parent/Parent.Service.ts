import { db } from '@/lib/db/Index';
import { eq, and, gte, desc } from 'drizzle-orm';
import { users, LearningSignals, StudentMastery } from '@/lib/db/Schema';

// Get all children linked to a parent.
// Placeholder: returns the parent themselves as a child until parent-child DB linking is built (SEV-020).
export async function GetChildrenForParent(parentId: string) {
  const [parent] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, parentId))
    .limit(1);
  return parent ? [parent] : [];
}

export async function GetDailySummary(childId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const signals = await db
    .select({
      SignalType: LearningSignals.SignalType,
      Value: LearningSignals.Value,
      CreatedAt: LearningSignals.CreatedAt,
    })
    .from(LearningSignals)
    .where(and(eq(LearningSignals.UserId, childId), gte(LearningSignals.CreatedAt, today)))
    .orderBy(desc(LearningSignals.CreatedAt))
    .limit(20);

  const correctAnswers = signals.filter(s => s.SignalType === 'quiz_correct').length;
  const totalSignals = signals.length;

  return {
    date: today.toISOString().split('T')[0],
    totalActivities: totalSignals,
    correctAnswers,
    topSignal: signals[0] ?? null,
  };
}

export async function GetWeeklySummary(childId: string) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const masteryData = await db
    .select({
      Score: StudentMastery.Score,
      ConceptId: StudentMastery.ConceptId,
      UpdatedAt: StudentMastery.UpdatedAt,
    })
    .from(StudentMastery)
    .where(and(eq(StudentMastery.UserId, childId), gte(StudentMastery.UpdatedAt, weekAgo)))
    .orderBy(desc(StudentMastery.UpdatedAt))
    .limit(10);

  const avgScore =
    masteryData.length > 0
      ? Math.round(masteryData.reduce((s, m) => s + m.Score, 0) / masteryData.length)
      : 0;

  return {
    period: '7 أيام',
    conceptsStudied: masteryData.length,
    averageMastery: avgScore,
    topConcept: masteryData[0] ?? null,
  };
}

export async function GetFullDashboard(childId: string) {
  const [daily, weekly] = await Promise.all([
    GetDailySummary(childId),
    GetWeeklySummary(childId),
  ]);

  const masteryAll = await db
    .select({ Score: StudentMastery.Score, ConceptId: StudentMastery.ConceptId })
    .from(StudentMastery)
    .where(eq(StudentMastery.UserId, childId))
    .limit(50);

  const masteryAvg =
    masteryAll.length > 0
      ? Math.round(masteryAll.reduce((s, m) => s + m.Score, 0) / masteryAll.length)
      : 0;

  return {
    daily,
    weekly,
    totalConcepts: masteryAll.length,
    masteryAvg,
  };
}
