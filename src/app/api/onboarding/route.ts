import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userPreferences, learningPaths, tracks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateLearningPath } from '@/lib/learning-path';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { ageGroup, goal, experience, learningStyle, dailyMinutes } = body;

  if (!ageGroup || !goal || !experience || !learningStyle || !dailyMinutes) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Upsert preferences
  await db
    .insert(userPreferences)
    .values({
      userId,
      ageGroup,
      goal,
      experience,
      learningStyle,
      dailyMinutes: Number(dailyMinutes),
      onboardingCompleted: true,
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: {
        ageGroup,
        goal,
        experience,
        learningStyle,
        dailyMinutes: Number(dailyMinutes),
        onboardingCompleted: true,
        updatedAt: new Date(),
      },
    });

  // Determine track based on answers
  const trackSlug = resolveTrack({ goal, experience });

  // Find the track
  const [track] = await db.select().from(tracks).where(eq(tracks.slug, trackSlug)).limit(1);

  if (track) {
    // Generate personalized lesson order
    const lessonOrder = await generateLearningPath({ goal, experience, learningStyle, ageGroup });

    // Deactivate old paths
    await db
      .update(learningPaths)
      .set({ isActive: false })
      .where(eq(learningPaths.userId, userId));

    // Create new active path
    await db.insert(learningPaths).values({
      userId,
      trackId: track.id,
      lessonOrder,
      isActive: true,
    });
  }

  return NextResponse.json({ success: true });
}

function resolveTrack({ goal, experience }: { goal: string; experience: string }): string {
  if (goal === 'developer') return 'developer';
  if (goal === 'educator') return 'educator';
  if (goal === 'creative') return 'creator';
  if (experience === 'advanced') return 'engineer';
  return 'explorer';
}
