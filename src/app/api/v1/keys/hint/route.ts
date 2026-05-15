import type { NextRequest } from 'next/server';
import { GetKeyHint } from '@/Features/Keys/Keys.Controller';

export async function GET(Req: NextRequest) {
  return GetKeyHint(Req);
}
