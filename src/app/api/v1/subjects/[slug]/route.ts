import { type NextRequest } from 'next/server';
import { GetSubjectBySlug } from '@/Features/Subjects/Subjects.Controller';

export async function GET(
  Req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return GetSubjectBySlug(Req, slug);
}
