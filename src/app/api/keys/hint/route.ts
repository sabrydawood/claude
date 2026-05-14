import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { encryptedKeys } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/keys/hint — returns only the hint, never the real key
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [row] = await db
    .select({ hint: encryptedKeys.keyHint })
    .from(encryptedKeys)
    .where(eq(encryptedKeys.userId, session.user.id))
    .limit(1);

  return NextResponse.json({ hint: row?.hint ?? null });
}
