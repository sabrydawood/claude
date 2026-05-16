import type { NextRequest } from 'next/server';
import { GetProviders, PostProvider } from '@/Features/Admin/Providers/Providers.Controller';

export async function GET(req: NextRequest) {
  return GetProviders(req);
}

export async function POST(req: NextRequest) {
  return PostProvider(req);
}
