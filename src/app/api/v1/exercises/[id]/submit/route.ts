/**
 * route.ts
 * PUT /api/v1/exercises/[id]/submit
 * Records an exercise submission and returns XP earned.
 * Auth required — session validated before any logic.
 */
import { NextRequest, NextResponse } from 'next/server';
import { GetSessionOrUnauthorized } from '@/Shared/Middleware/Auth.Middleware';
import { db } from '@/lib/db/Index';
import { Exercises, ExerciseSubmissions } from '@/lib/db/Schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const SubmitSchema = z.object({
  code:   z.string().min(1),
  passed: z.boolean(),
  score:  z.number().int().min(0).max(100),
});

export async function PUT(
  Req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Auth check first — SEV-003
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const { id } = await params;

  // Validate request body — SEV-003
  let body: z.infer<typeof SubmitSchema>;
  try {
    body = SubmitSchema.parse(await Req.json());
  } catch {
    return NextResponse.json(
      { Success: false, Error: { Code: 'VALIDATION_ERROR' } },
      { status: 400 },
    );
  }

  const { code, passed, score } = body;

  // Verify exercise exists
  const [exercise] = await db
    .select()
    .from(Exercises)
    .where(eq(Exercises.Id, id))
    .limit(1);

  if (!exercise || exercise.IsDeleted) {
    return NextResponse.json(
      { Success: false, Error: { Code: 'EXERCISE_NOT_FOUND' } },
      { status: 404 },
    );
  }

  // Insert submission — every attempt gets its own row (Attempts field per row)
  await db.insert(ExerciseSubmissions).values({
    UserId:     Session.user.id,
    ExerciseId: id,
    Code:       code,
    Passed:     passed,
    Score:      score,
    Attempts:   1,
  });

  return NextResponse.json({
    Success: true,
    Data:    { XpEarned: passed ? exercise.XpReward : 0 },
  });
}
