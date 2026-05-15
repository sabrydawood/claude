/**
 * Keys.Controller.ts
 * HTTP handlers for encrypted API key management.
 */
import { NextRequest, NextResponse } from 'next/server';
import { GetSessionOrUnauthorized } from '@/Shared/Middleware/Auth.Middleware';
import { ParseBodyOrBadRequest } from '@/Shared/Middleware/Validation.Middleware';
import { db } from '@/lib/db/Index';
import { EncryptedKeys } from '@/lib/db/Schema';
import { eq } from 'drizzle-orm';
import { encryptApiKey } from '@/lib/encryption';
import { SaveKeySchema } from './Keys.Schemas';

/**
 * POST /api/v1/keys — saves encrypted Anthropic API key for the user.
 */
export async function PostSaveKey(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const Body = await ParseBodyOrBadRequest(Req, SaveKeySchema);
  if (Body instanceof NextResponse) return Body;

  const Encrypted = await encryptApiKey(Body.ApiKey);
  const Hint = `sk-ant-...${Body.ApiKey.slice(-4)}`;
  const UserId = Session.user.id;

  const [Existing] = await db
    .select({ Id: EncryptedKeys.Id })
    .from(EncryptedKeys)
    .where(eq(EncryptedKeys.UserId, UserId))
    .limit(1);

  if (Existing) {
    await db
      .update(EncryptedKeys)
      .set({ EncryptedKey: Encrypted, KeyHint: Hint, UpdatedAt: new Date() })
      .where(eq(EncryptedKeys.UserId, UserId));
  } else {
    await db.insert(EncryptedKeys).values({ UserId, EncryptedKey: Encrypted, KeyHint: Hint });
  }

  return NextResponse.json({ Success: true, Data: { Ok: true, Hint } });
}

/**
 * DELETE /api/v1/keys — removes the user's saved API key.
 */
export async function DeleteKey(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  await db.delete(EncryptedKeys).where(eq(EncryptedKeys.UserId, Session.user.id));
  return NextResponse.json({ Success: true, Data: { Ok: true } });
}

/**
 * GET /api/v1/keys/hint — returns the last 4 chars of the stored key.
 */
export async function GetKeyHint(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const [KeyRow] = await db
    .select({ KeyHint: EncryptedKeys.KeyHint })
    .from(EncryptedKeys)
    .where(eq(EncryptedKeys.UserId, Session.user.id))
    .limit(1);

  if (!KeyRow) {
    return NextResponse.json({ Success: false, Error: { Code: 'NO_KEY', Message: 'لا يوجد مفتاح محفوظ' } }, { status: 404 });
  }

  return NextResponse.json({ Success: true, Data: { Hint: KeyRow.KeyHint } });
}
