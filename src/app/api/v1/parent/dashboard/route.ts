import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { GetDashboard } from '@/Features/Parent/Parent.Controller';
import { getServerSession } from '@/lib/auth/server-session';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ Success: false, Error: { Code: 'UNAUTHORIZED' } }, { status: 401 });
  }
  const childId = req.nextUrl.searchParams.get('childId') ?? session.user.id;
  return GetDashboard(childId);
}
