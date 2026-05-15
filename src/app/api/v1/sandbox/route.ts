import type { NextRequest } from 'next/server';
import { PostSandboxChat } from '@/Features/Sandbox/Sandbox.Controller';

export async function POST(Req: NextRequest) {
  return PostSandboxChat(Req);
}
