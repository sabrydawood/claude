import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server-session';
import { db } from '@/lib/db/Index';
import { eq } from 'drizzle-orm';
import { StudentInsights } from '@/lib/db/Schema';
import { ExtractInsightsForUser } from '@/Lib/Learning/InsightExtractor';

export async function GET(_req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ Success: false, Error: { Code: 'UNAUTHORIZED' } }, { status: 401 });

  // Auto-extract if needed
  await ExtractInsightsForUser(session.user.id);

  const [row] = await db
    .select({ Insights: StudentInsights.Insights })
    .from(StudentInsights)
    .where(eq(StudentInsights.UserId, session.user.id))
    .limit(1);

  return NextResponse.json({ Success: true, Data: row ? JSON.parse(row.Insights) : {} });
}
