// SM-2 algorithm implementation for spaced repetition
// Reference: Anki, SuperMemo-2 (1987)

export interface ReviewItem {
  conceptId: string;
  score: number;        // 0-100 current mastery score
  lastTestedAt: Date | null;
  interval: number;     // days until next review (starts at 1)
  easeFactor: number;   // 2.5 default, min 1.3
}

export interface ReviewSchedule {
  conceptId: string;
  urgency: 'high' | 'medium' | 'low' | 'none';
  daysUntilReview: number;
  reason: string;
}

// Calculate when to review a concept next
export function CalculateNextReview(item: ReviewItem): ReviewSchedule {
  const now = Date.now();
  const lastTested = item.lastTestedAt ? item.lastTestedAt.getTime() : 0;
  const daysSinceTested = (now - lastTested) / (1000 * 60 * 60 * 24);

  // Never tested → high urgency
  if (!item.lastTestedAt) {
    return { conceptId: item.conceptId, urgency: 'high', daysUntilReview: 0, reason: 'لم يُدرَّس بعد' };
  }

  // Low score + enough time passed → high urgency
  if (item.score < 60 && daysSinceTested >= 3) {
    return { conceptId: item.conceptId, urgency: 'high', daysUntilReview: 0, reason: 'يحتاج مراجعة (مستوى منخفض)' };
  }

  // Medium score + time passed → medium urgency
  if (item.score < 80 && daysSinceTested >= 7) {
    return { conceptId: item.conceptId, urgency: 'medium', daysUntilReview: 0, reason: 'مراجعة أسبوعية' };
  }

  // High score → based on SM-2 interval
  const nextReviewDate = lastTested + (item.interval * 24 * 60 * 60 * 1000);
  const daysUntilReview = Math.max(0, (nextReviewDate - now) / (1000 * 60 * 60 * 24));

  if (daysUntilReview <= 0) {
    return { conceptId: item.conceptId, urgency: item.score >= 80 ? 'low' : 'medium', daysUntilReview: 0, reason: 'حان وقت المراجعة' };
  }

  return { conceptId: item.conceptId, urgency: 'none', daysUntilReview: Math.round(daysUntilReview), reason: 'لا حاجة للمراجعة الآن' };
}

// Update ease factor and interval after a review session
export function UpdateReviewStats(item: ReviewItem, quality: 0 | 1 | 2 | 3 | 4 | 5): ReviewItem {
  // quality: 0-2 = fail, 3 = pass barely, 4 = good, 5 = perfect
  let newEaseFactor = item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor);

  let newInterval: number;
  if (quality < 3) {
    newInterval = 1; // Reset on failure
  } else if (item.interval === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(item.interval * newEaseFactor);
  }

  return { ...item, interval: newInterval, easeFactor: newEaseFactor, lastTestedAt: new Date() };
}

// Get review queue for a student — sorted by urgency
export function GetReviewQueue(items: ReviewItem[]): ReviewSchedule[] {
  return items
    .map(item => CalculateNextReview(item))
    .filter(s => s.urgency !== 'none')
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2, none: 3 };
      return order[a.urgency] - order[b.urgency];
    });
}
