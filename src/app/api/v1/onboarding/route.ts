import type { NextRequest } from 'next/server';
import { PostOnboarding } from '@/Features/Onboarding/Onboarding.Controller';

export async function POST(Req: NextRequest) {
  return PostOnboarding(Req);
}
