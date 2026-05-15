import type { NextRequest } from 'next/server';
import { GetAdminLessons, PostCreateLesson } from '@/Features/Admin/Admin.Controller';

export async function GET(Req: NextRequest) {
  return GetAdminLessons(Req);
}

export async function POST(Req: NextRequest) {
  return PostCreateLesson(Req);
}
