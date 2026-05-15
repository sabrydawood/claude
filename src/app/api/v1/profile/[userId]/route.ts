import { NextRequest, NextResponse } from 'next/server';
import { GetUserProfile } from '@/Features/Profile/Profile.Controller';
import { GetRequestError } from '@/lib/i18n/Api.Errors';

export async function GET(
  Req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  if (!userId) {
    const Error = await GetRequestError(Req, 'INVALID_ID');
    return NextResponse.json({ Success: false, Error }, { status: 400 });
  }
  return GetUserProfile(Req, userId);
}
