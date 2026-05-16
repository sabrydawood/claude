/**
 * Keys.Controller.ts
 * HTTP handlers for encrypted API key management (multi-provider).
 */
import { NextRequest, NextResponse } from 'next/server';
import { GetSessionOrUnauthorized } from '@/Shared/Middleware/Auth.Middleware';
import { ParseBodyOrBadRequest } from '@/Shared/Middleware/Validation.Middleware';
import { db } from '@/lib/db/Index';
import { EncryptedKeys } from '@/lib/db/Schema';
import { eq } from 'drizzle-orm';
import { encryptApiKey } from '@/lib/encryption';
import { SaveKeySchema } from './Keys.Schemas';

function buildHint(apiKey: string): string {
  const prefix = apiKey.slice(0, Math.min(8, apiKey.length));
  const suffix = apiKey.slice(-4);
  return `${prefix}...${suffix}`;
}

/**
 * POST /api/v1/keys — saves the user's encrypted API key with its provider.
 */
export async function PostSaveKey(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const Body = await ParseBodyOrBadRequest(Req, SaveKeySchema);
  if (Body instanceof NextResponse) return Body;

  const Encrypted = await encryptApiKey(Body.ApiKey);
  const Hint     = buildHint(Body.ApiKey);
  const Provider = Body.Provider;
  const UserId   = Session.user.id;

  const [Existing] = await db
    .select({ Id: EncryptedKeys.Id })
    .from(EncryptedKeys)
    .where(eq(EncryptedKeys.UserId, UserId))
    .limit(1);

  if (Existing) {
    await db
      .update(EncryptedKeys)
      .set({ EncryptedKey: Encrypted, KeyHint: Hint, Provider, UpdatedAt: new Date() })
      .where(eq(EncryptedKeys.UserId, UserId));
  } else {
    await db.insert(EncryptedKeys).values({ UserId, EncryptedKey: Encrypted, KeyHint: Hint, Provider });
  }

  return NextResponse.json({ Success: true, Data: { Ok: true, Hint, Provider } });
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
 * GET /api/v1/keys/hint — returns the key hint and provider for the current user.
 */
export async function GetKeyHint(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const [KeyRow] = await db
    .select({ KeyHint: EncryptedKeys.KeyHint, Provider: EncryptedKeys.Provider })
    .from(EncryptedKeys)
    .where(eq(EncryptedKeys.UserId, Session.user.id))
    .limit(1);

  if (!KeyRow) {
    return NextResponse.json({ Success: false, Error: { Code: 'NO_KEY' } }, { status: 404 });
  }

  return NextResponse.json({ Success: true, Data: { Hint: KeyRow.KeyHint, Provider: KeyRow.Provider } });
}
