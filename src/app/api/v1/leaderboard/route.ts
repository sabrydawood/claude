import type { NextRequest } from 'next/server';
import { GetLeaderboard } from '@/Features/Leaderboard/Leaderboard.Controller';

export async function GET(Req: NextRequest) {
  return GetLeaderboard(Req);
}
