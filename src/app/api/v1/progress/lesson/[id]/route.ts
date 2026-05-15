import { NextRequest, NextResponse } from 'next/server';
import { PutLessonProgress } from '@/Features/Progress/Progress.Controller';
import { GetRequestError } from '@/lib/i18n/Api.Errors';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PUT(
  Req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    const Error = await GetRequestError(Req, 'INVALID_ID');
    return NextResponse.json({ Success: false, Error }, { status: 400 });
  }
  return PutLessonProgress(Req, id);
}
