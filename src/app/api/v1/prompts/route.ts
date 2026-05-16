import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth/server-session';

const CreatePromptSchema = z.object({
  titleAr: z.string().min(3).max(100),
  content: z.string().min(10).max(1000),
  category: z.enum(['explore', 'challenge', 'creative', 'explain', 'project']),
});

// Placeholder — real DB implementation when SemanticCache is used for prompts
export async function GET(_req: NextRequest) {
  return NextResponse.json({
    Success: true,
    Data: [],  // Will be populated from DB in Phase 3
    Meta: { Total: 0, Page: 1, Limit: 20 },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ Success: false, Error: { Code: 'UNAUTHORIZED' } }, { status: 401 });

  const body = await req.json();
  const parsed = CreatePromptSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ Success: false, Error: { Code: 'VALIDATION_ERROR', Details: parsed.error } }, { status: 400 });

  // TODO Phase 3: Save to DB + send to moderation queue
  return NextResponse.json({ Success: true, Data: { status: 'pending_review', message: 'سيظهر Prompt بعد المراجعة خلال 8 ساعات' } }, { status: 202 });
}
