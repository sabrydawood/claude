import { getServerSession } from '@/lib/auth/server-session';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/Index';
import { EncryptedKeys } from '@/lib/db/Schema';
import { eq } from 'drizzle-orm';
import SandboxClient from './sandbox-client';

export default async function SandboxPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession();

  if (!session?.user?.id) redirect(`/${locale}/login`);

  const [keyRow] = await db
    .select({ KeyHint: EncryptedKeys.KeyHint, Provider: EncryptedKeys.Provider })
    .from(EncryptedKeys)
    .where(eq(EncryptedKeys.UserId, session.user.id))
    .limit(1);

  return (
    <SandboxClient
      initialHint={keyRow?.KeyHint ?? null}
      initialProvider={keyRow?.Provider ?? null}
    />
  );
}
