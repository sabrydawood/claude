import type { NextRequest } from 'next/server';
import { PostSaveKey, DeleteKey } from '@/Features/Keys/Keys.Controller';

export async function POST(Req: NextRequest) {
  return PostSaveKey(Req);
}

export async function DELETE(Req: NextRequest) {
  return DeleteKey(Req);
}
