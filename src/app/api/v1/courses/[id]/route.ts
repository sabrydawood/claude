import { type NextRequest } from 'next/server';
import { GetCourseById } from '@/Features/Courses/Courses.Controller';

export async function GET(
  Req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return GetCourseById(Req, id);
}
