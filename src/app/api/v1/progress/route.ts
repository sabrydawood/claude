import type { NextRequest } from 'next/server';
import { GetUserProgress } from '@/Features/Progress/Progress.Controller';

export async function GET(Req: NextRequest) {
  return GetUserProgress(Req);
}
