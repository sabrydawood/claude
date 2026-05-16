import type { NextRequest } from 'next/server';
import { GetConceptHandler } from '@/Features/Graph/Graph.Controller';

export async function GET(Req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return GetConceptHandler(Req, id);
}
