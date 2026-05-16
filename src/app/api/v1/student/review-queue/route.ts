import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth/server-session';
import { db } from '@/lib/db/Index';
import { eq } from 'drizzle-orm';
import { StudentMastery } from '@/lib/db/Schema';
import { GetReviewQueue } from '@/Lib/Learning/SpacedRepetition';

export async function GET(_req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ Success: false, Error: { Code: 'UNAUTHORIZED' } }, { status: 401 });

  const masteryRows = await db
    .select({
      ConceptId: StudentMastery.ConceptId,
      Score: StudentMastery.Score,
      LastTested: StudentMastery.LastTested,
    })
    .from(StudentMastery)
    .where(eq(StudentMastery.UserId, session.user.id))
    .limit(100);

  const items = masteryRows.map(r => ({
    conceptId: r.ConceptId,
    score: r.Score,
    lastTestedAt: r.LastTested,
    interval: 1,
    easeFactor: 2.5,
  }));

  const queue = GetReviewQueue(items);
  return NextResponse.json({ Success: true, Data: queue });
}
