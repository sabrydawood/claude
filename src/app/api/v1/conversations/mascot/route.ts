import type { NextRequest } from 'next/server';
import { GetMascotConversation, SaveMascotPair } from '@/Features/Conversations/Conversations.Controller';

export async function GET(Req: NextRequest) {
  return GetMascotConversation(Req);
}

export async function POST(Req: NextRequest) {
  return SaveMascotPair(Req);
}
