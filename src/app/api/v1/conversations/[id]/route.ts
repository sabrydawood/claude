import type { NextRequest } from 'next/server';
import { GetConversation, DeleteConversation } from '@/Features/Conversations/Conversations.Controller';

export async function GET(Req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return GetConversation(Req, id);
}

export async function DELETE(Req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return DeleteConversation(Req, id);
}
