import type { NextRequest } from 'next/server';
import { GetConceptMasteryHandler } from '@/Features/Mastery/Mastery.Controller';

export async function GET(
  Req: NextRequest,
  { params }: { params: Promise<{ conceptId: string }> },
) {
  const { conceptId } = await params;
  return GetConceptMasteryHandler(Req, conceptId);
}
