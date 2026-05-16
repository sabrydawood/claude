/**
 * Conversations.Service.ts
 * DB helpers for Sandbox + Mascot conversation persistence.
 */
import { db } from '@/lib/db/Index';
import { Conversations, ConversationMessages } from '@/lib/db/Schema';
import { and, asc, desc, eq } from 'drizzle-orm';
import { StreamChat } from '@/Lib/Ai/Providers';
import type { IConversationListItem, IConversationDetail, IMascotConversation } from './Conversations.Types';

// ── Sandbox ───────────────────────────────────────────────────────────────────

export async function CreateSandboxConversation(UserId: string): Promise<string> {
  const [row] = await db
    .insert(Conversations)
    .values({ UserId, Source: 'sandbox' })
    .returning({ Id: Conversations.Id });
  return row.Id;
}

export async function GetSandboxConversations(UserId: string): Promise<IConversationListItem[]> {
  const rows = await db
    .select({ Id: Conversations.Id, Title: Conversations.Title, UpdatedAt: Conversations.UpdatedAt })
    .from(Conversations)
    .where(and(eq(Conversations.UserId, UserId), eq(Conversations.Source, 'sandbox'), eq(Conversations.IsDeleted, false)))
    .orderBy(desc(Conversations.UpdatedAt))
    .limit(50);

  return rows.map((r) => ({ Id: r.Id, Title: r.Title, UpdatedAt: r.UpdatedAt.toISOString() }));
}

export async function GetConversationDetail(ConvId: string, UserId: string): Promise<IConversationDetail | null> {
  const [conv] = await db
    .select({ Id: Conversations.Id, Title: Conversations.Title, Source: Conversations.Source })
    .from(Conversations)
    .where(and(eq(Conversations.Id, ConvId), eq(Conversations.UserId, UserId), eq(Conversations.IsDeleted, false)))
    .limit(1);

  if (!conv) return null;

  const msgs = await db
    .select({ Role: ConversationMessages.Role, Content: ConversationMessages.Content })
    .from(ConversationMessages)
    .where(eq(ConversationMessages.ConversationId, ConvId))
    .orderBy(asc(ConversationMessages.CreatedAt));

  return {
    Id:       conv.Id,
    Title:    conv.Title,
    Source:   conv.Source,
    Messages: msgs as IConversationDetail['Messages'],
  };
}

export async function SoftDeleteConversation(ConvId: string, UserId: string): Promise<void> {
  await db
    .update(Conversations)
    .set({ IsDeleted: true, UpdatedAt: new Date() })
    .where(and(eq(Conversations.Id, ConvId), eq(Conversations.UserId, UserId)));
}

// ── Mascot ────────────────────────────────────────────────────────────────────

export async function GetOrCreateMascotConversation(UserId: string, Route: string): Promise<IMascotConversation> {
  const [existing] = await db
    .select({ Id: Conversations.Id })
    .from(Conversations)
    .where(and(
      eq(Conversations.UserId, UserId),
      eq(Conversations.Source, 'mascot'),
      eq(Conversations.Route, Route),
      eq(Conversations.IsDeleted, false),
    ))
    .limit(1);

  const ConvId = existing?.Id ?? (await db
    .insert(Conversations)
    .values({ UserId, Source: 'mascot', Route })
    .returning({ Id: Conversations.Id })
    .then(([r]) => r.Id));

  const msgs = await db
    .select({ Role: ConversationMessages.Role, Content: ConversationMessages.Content })
    .from(ConversationMessages)
    .where(eq(ConversationMessages.ConversationId, ConvId))
    .orderBy(asc(ConversationMessages.CreatedAt));

  return { ConversationId: ConvId, Messages: msgs as IMascotConversation['Messages'] };
}

// ── Shared ────────────────────────────────────────────────────────────────────

export async function SaveMessage(
  ConvId:   string,
  Role:     string,
  Content:  string,
  Provider?: string,
): Promise<void> {
  await db.insert(ConversationMessages).values({ ConversationId: ConvId, Role, Content, Provider });
}

export async function SaveMessagePair(
  ConvId:    string,
  UserMsg:   string,
  AssistMsg: string,
  Provider?: string,
): Promise<void> {
  await db.insert(ConversationMessages).values([
    { ConversationId: ConvId, Role: 'user',      Content: UserMsg },
    { ConversationId: ConvId, Role: 'assistant', Content: AssistMsg, Provider },
  ]);
}

export async function BumpConversationTimestamp(ConvId: string): Promise<void> {
  await db.update(Conversations).set({ UpdatedAt: new Date() }).where(eq(Conversations.Id, ConvId));
}

export async function GenerateAndSaveTitle(ConvId: string, FirstMessage: string): Promise<void> {
  const TITLE_SYS = 'Generate a very short chat title (max 6 words, no quotes, no punctuation at end) based on the user message. Reply with the title only.';
  let title = '';
  try {
    for await (const chunk of StreamChat(TITLE_SYS, [{ role: 'user', content: FirstMessage }])) {
      title += chunk;
      if (title.length > 80) break;
    }
    title = title.trim().slice(0, 70);
    if (title) {
      await db.update(Conversations).set({ Title: title, UpdatedAt: new Date() }).where(eq(Conversations.Id, ConvId));
    }
  } catch {
    /* title gen is best-effort — ignore failures */
  }
}
