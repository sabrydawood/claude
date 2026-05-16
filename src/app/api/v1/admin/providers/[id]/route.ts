import type { NextRequest } from 'next/server';
import { PatchProvider, ToggleProviderStatus } from '@/Features/Admin/Providers/Providers.Controller';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return PatchProvider(req, id);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return ToggleProviderStatus(req, id);
}
