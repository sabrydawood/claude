import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { learningPaths } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [path] = await db
    .select()
    .from(learningPaths)
    .where(and(eq(learningPaths.userId, session.user.id), eq(learningPaths.isActive, true)))
    .limit(1);

  return NextResponse.json({
    lessonOrder: path?.lessonOrder ?? null,
    trackId: path?.trackId ?? null,
    currentLessonId: path?.currentLessonId ?? null,
  });
}
