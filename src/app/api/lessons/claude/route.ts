import { NextRequest, NextResponse } from 'next/server';
import { getLessonsByAgent } from '@/lib/db/queries/content';

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') ?? 'ar';
  const lessons = await getLessonsByAgent('claude', locale);

  // Return a minimal summary for the dashboard
  return NextResponse.json({
    lessons: lessons.map(l => ({
      id: l.id,
      title: l.title,
      estimatedMinutes: l.estimatedMinutes,
      xpReward: l.xpReward,
      order: l.order,
    })),
  });
}
