import { getServerSession } from '@/lib/auth/server-session';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/Index';
import { EncryptedKeys } from '@/lib/db/Schema';
import { eq } from 'drizzle-orm';
import { GetSandboxConversations, GetConversationDetail } from '@/Features/Conversations/Conversations.Service';
import SandboxClient from './sandbox-client';

export default async function SandboxPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession();

  if (!session?.user?.id) redirect(`/${locale}/login`);

  const [keyRow, conversations] = await Promise.all([
    db.select({ KeyHint: EncryptedKeys.KeyHint, Provider: EncryptedKeys.Provider })
      .from(EncryptedKeys)
      .where(eq(EncryptedKeys.UserId, session.user.id))
      .limit(1)
      .then((rows) => rows[0] ?? null),
    GetSandboxConversations(session.user.id),
  ]);

  const initialMessages = conversations[0]
    ? await GetConversationDetail(conversations[0].Id, session.user.id).then((d) => d?.Messages ?? [])
    : [];

  return (
    <SandboxClient
      initialHint={keyRow?.KeyHint ?? null}
      initialProvider={keyRow?.Provider ?? null}
      initialConversations={conversations}
      initialConversationId={conversations[0]?.Id ?? null}
      initialMessages={initialMessages}
    />
  );
}
