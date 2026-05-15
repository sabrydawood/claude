/**
 * Onboarding.Controller.ts
 */
import { NextRequest, NextResponse } from 'next/server';
import { GetSessionOrUnauthorized } from '@/Shared/Middleware/Auth.Middleware';
import { ParseBodyOrBadRequest } from '@/Shared/Middleware/Validation.Middleware';
import { db } from '@/lib/db/Index';
import { UserPreferences, LearningPaths, Tracks } from '@/lib/db/Schema';
import { eq } from 'drizzle-orm';
import { OnboardingSchema } from './Onboarding.Schemas';
import { ResolveTrack, GenerateLearningPath } from './Onboarding.Service';

/**
 * GET /api/v1/onboarding — returns onboarding completion status + learning path order.
 */
export async function GetOnboarding(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const [Prefs] = await db
    .select({ OnboardingCompleted: UserPreferences.OnboardingCompleted })
    .from(UserPreferences)
    .where(eq(UserPreferences.UserId, Session.user.id))
    .limit(1);

  const [Path] = await db
    .select({ LessonOrder: LearningPaths.LessonOrder })
    .from(LearningPaths)
    .where(eq(LearningPaths.UserId, Session.user.id))
    .limit(1);

  return NextResponse.json({
    Success: true,
    Data: {
      onboardingCompleted: Prefs?.OnboardingCompleted ?? false,
      lessonOrder: Path?.LessonOrder ?? null,
    },
  });
}

/**
 * POST /api/v1/onboarding — saves user preferences and generates learning path.
 */
export async function PostOnboarding(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const Body = await ParseBodyOrBadRequest(Req, OnboardingSchema);
  if (Body instanceof NextResponse) return Body;

  const UserId = Session.user.id;

  await db
    .insert(UserPreferences)
    .values({
      UserId,
      AgeGroup: Body.AgeGroup,
      Goal: Body.Goal,
      Experience: Body.Experience,
      LearningStyle: Body.LearningStyle,
      DailyMinutes: Body.DailyMinutes,
      OnboardingCompleted: true,
    })
    .onConflictDoUpdate({
      target: UserPreferences.UserId,
      set: {
        AgeGroup: Body.AgeGroup,
        Goal: Body.Goal,
        Experience: Body.Experience,
        LearningStyle: Body.LearningStyle,
        DailyMinutes: Body.DailyMinutes,
        OnboardingCompleted: true,
        UpdatedAt: new Date(),
      },
    });

  const TrackSlug = ResolveTrack(Body.Goal, Body.Experience);
  const [Track] = await db.select().from(Tracks).where(eq(Tracks.Slug, TrackSlug)).limit(1);

  if (Track) {
    const LessonOrder = await GenerateLearningPath(Body);
    await db.update(LearningPaths).set({ IsActive: false }).where(eq(LearningPaths.UserId, UserId));
    await db.insert(LearningPaths).values({
      UserId,
      TrackId: Track.Id,
      LessonOrder,
      IsActive: true,
    });
  }

  return NextResponse.json({ Success: true, Data: { Ok: true } });
}
