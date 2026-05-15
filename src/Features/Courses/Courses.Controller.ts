/**
 * Courses.Controller.ts
 * Handles HTTP requests for course catalog endpoints.
 */
import { type NextRequest, NextResponse } from 'next/server';
import { GetValidLocale } from '@/lib/i18n/Locale.Utils';
import { getCourseWithLessons } from '@/lib/db/queries/subjects';

export async function GetCourseById(Req: NextRequest, CourseId: string): Promise<NextResponse> {
  const Locale = GetValidLocale(Req.nextUrl.searchParams.get('locale'));
  const Course = await getCourseWithLessons(CourseId, Locale);
  if (!Course) {
    return NextResponse.json(
      { Success: false, Error: { Code: 'NOT_FOUND' } },
      { status: 404 },
    );
  }
  return NextResponse.json({ Success: true, Data: { Course } });
}
