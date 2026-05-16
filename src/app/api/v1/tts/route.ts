import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const Schema = z.object({
  text: z.string().min(1).max(500),
  lang: z.enum(['ar', 'en']).default('ar'),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ Success: false, Error: { Code: 'VALIDATION_ERROR' } }, { status: 400 });

  // For now, return success — browser Web Speech API handles TTS client-side
  // Future: integrate Azure TTS for higher quality Arabic voices
  return NextResponse.json({ Success: true, Data: { provider: 'browser', text: parsed.data.text } });
}
