/**
 * Conversations.Controller.ts
 * CRUD for Sandbox and Mascot conversation history.
 */
import { NextRequest, NextResponse } from 'next/server';
import { GetSessionOrUnauthorized } from '@/Shared/Middleware/Auth.Middleware';
import { ParseBodyOrBadRequest } from '@/Shared/Middleware/Validation.Middleware';
import {
  CreateSandboxConversation,
  GetSandboxConversations,
  GetConversationDetail,
  SoftDeleteConversation,
  GetOrCreateMascotConversation,
  SaveMessagePair,
  BumpConversationTimestamp,
} from './Conversations.Service';
import { SaveMascotPairSchema } from './Conversations.Schemas';

/** GET /api/v1/conversations — list sandbox conversations */
export async function ListConversations(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const conversations = await GetSandboxConversations(Session.user.id);
  return NextResponse.json({ Success: true, Data: conversations });
}

/** POST /api/v1/conversations — create a new sandbox conversation */
export async function CreateConversation(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const Id = await CreateSandboxConversation(Session.user.id);
  return NextResponse.json({ Success: true, Data: { Id } }, { status: 201 });
}

/** GET /api/v1/conversations/[id] — get conversation with messages */
export async function GetConversation(Req: NextRequest, Id: string): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const detail = await GetConversationDetail(Id, Session.user.id);
  if (!detail) {
    return NextResponse.json({ Success: false, Error: { Code: 'NOT_FOUND' } }, { status: 404 });
  }
  return NextResponse.json({ Success: true, Data: detail });
}

/** DELETE /api/v1/conversations/[id] — soft delete */
export async function DeleteConversation(Req: NextRequest, Id: string): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  await SoftDeleteConversation(Id, Session.user.id);
  return NextResponse.json({ Success: true, Data: { Ok: true } });
}

/** GET /api/v1/conversations/mascot?route=... — get or create mascot conversation */
export async function GetMascotConversation(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const Route = new URL(Req.url).searchParams.get('route');
  if (!Route) {
    return NextResponse.json({ Success: false, Error: { Code: 'MISSING_ROUTE' } }, { status: 400 });
  }

  const data = await GetOrCreateMascotConversation(Session.user.id, Route);
  return NextResponse.json({ Success: true, Data: data });
}

/** POST /api/v1/conversations/mascot — save user+assistant message pair */
export async function SaveMascotPair(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const Body = await ParseBodyOrBadRequest(Req, SaveMascotPairSchema);
  if (Body instanceof NextResponse) return Body;

  let ConvId = Body.ConversationId;
  if (!ConvId) {
    const conv = await GetOrCreateMascotConversation(Session.user.id, Body.Route);
    ConvId = conv.ConversationId;
  }

  await SaveMessagePair(ConvId, Body.UserMessage, Body.AssistMessage, Body.Provider);
  await BumpConversationTimestamp(ConvId);

  return NextResponse.json({ Success: true, Data: { ConversationId: ConvId } });
}
