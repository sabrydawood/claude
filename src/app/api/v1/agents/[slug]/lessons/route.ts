import { type NextRequest, NextResponse } from 'next/server';
import { GetSessionOrUnauthorized } from '@/Shared/Middleware/Auth.Middleware';
import { getLessonsByAgent } from '@/lib/db/queries/content';

export async function GET(
  Req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const { slug } = await params;
  const locale = Req.nextUrl.searchParams.get('locale') ?? 'ar';
  const lessons = await getLessonsByAgent(slug, locale);

  return NextResponse.json({ Success: true, Data: { lessons } });
}
