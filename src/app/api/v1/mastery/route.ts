import type { NextRequest } from 'next/server';
import { GetMasteryProfile, RecordMasterySignal } from '@/Features/Mastery/Mastery.Controller';

export async function GET(Req: NextRequest) {
  return GetMasteryProfile(Req);
}

export async function POST(Req: NextRequest) {
  return RecordMasterySignal(Req);
}
