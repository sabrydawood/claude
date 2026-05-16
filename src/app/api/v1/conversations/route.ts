import type { NextRequest } from 'next/server';
import { ListConversations, CreateConversation } from '@/Features/Conversations/Conversations.Controller';

export async function GET(Req: NextRequest) {
  return ListConversations(Req);
}

export async function POST(Req: NextRequest) {
  return CreateConversation(Req);
}
