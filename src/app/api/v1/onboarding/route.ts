import type { NextRequest } from 'next/server';
import { GetOnboarding, PostOnboarding } from '@/Features/Onboarding/Onboarding.Controller';

export async function GET(Req: NextRequest) {
  return GetOnboarding(Req);
}

export async function POST(Req: NextRequest) {
  return PostOnboarding(Req);
}
