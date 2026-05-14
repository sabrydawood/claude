import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { encryptedKeys } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { encryptApiKey } from '@/lib/encryption';

// POST /api/keys — save encrypted API key
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { apiKey } = await req.json() as { apiKey: string };
  if (!apiKey || !apiKey.startsWith('sk-ant-')) {
    return NextResponse.json({ error: 'مفتاح غير صحيح — لازم يبدأ بـ sk-ant-' }, { status: 400 });
  }

  const encrypted = await encryptApiKey(apiKey);
  const hint = `sk-ant-...${apiKey.slice(-4)}`;

  const existing = await db
    .select({ id: encryptedKeys.id })
    .from(encryptedKeys)
    .where(eq(encryptedKeys.userId, session.user.id))
    .limit(1);

  if (existing[0]) {
    await db
      .update(encryptedKeys)
      .set({ encryptedKey: encrypted, keyHint: hint, updatedAt: new Date() })
      .where(eq(encryptedKeys.userId, session.user.id));
  } else {
    await db.insert(encryptedKeys).values({
      userId: session.user.id,
      encryptedKey: encrypted,
      keyHint: hint,
    });
  }

  return NextResponse.json({ ok: true, hint });
}

// DELETE /api/keys — remove saved key
export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db.delete(encryptedKeys).where(eq(encryptedKeys.userId, session.user.id));
  return NextResponse.json({ ok: true });
}
