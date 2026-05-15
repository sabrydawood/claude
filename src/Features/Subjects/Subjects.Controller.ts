/**
 * Subjects.Controller.ts
 * Handles HTTP requests for subject catalog endpoints.
 */
import { type NextRequest, NextResponse } from 'next/server';
import { GetValidLocale } from '@/lib/i18n/Locale.Utils';
import { getSubjects } from '@/lib/db/queries/content';
import { getSubjectWithCourses } from '@/lib/db/queries/subjects';

export async function GetAllSubjects(Req: NextRequest): Promise<NextResponse> {
  const Locale = GetValidLocale(Req.nextUrl.searchParams.get('locale'));
  const Subjects = await getSubjects(Locale);
  return NextResponse.json({ Success: true, Data: { Subjects } });
}

export async function GetSubjectBySlug(Req: NextRequest, Slug: string): Promise<NextResponse> {
  const Locale = GetValidLocale(Req.nextUrl.searchParams.get('locale'));
  const Subject = await getSubjectWithCourses(Slug, Locale);
  if (!Subject) {
    return NextResponse.json(
      { Success: false, Error: { Code: 'NOT_FOUND' } },
      { status: 404 },
    );
  }
  return NextResponse.json({ Success: true, Data: { Subject } });
}
