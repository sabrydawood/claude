import type { NextRequest } from 'next/server';
import { PostMascotChat } from '@/Features/Mascot/Mascot.Controller';

export async function POST(Req: NextRequest) {
  return PostMascotChat(Req);
}
