import type { NextRequest } from 'next/server';
import { GetFullGraphHandler, GetStudentGraphHandler } from '@/Features/Graph/Graph.Controller';

export async function GET(Req: NextRequest) {
  const url = new URL(Req.url);
  if (url.searchParams.get('student') === 'true') return GetStudentGraphHandler(Req);
  return GetFullGraphHandler(Req);
}
