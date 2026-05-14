import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { encryptedKeys, sandboxSessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { decryptApiKey } from '@/lib/encryption';

const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `أنت مساعد تعليمي ذكي متخصص في تعليم الذكاء الاصطناعي باللغة العربية.
اسمك "ذكاوي" وأنت هنا لمساعدة المتعلمين على فهم مفاهيم الذكاء الاصطناعي وتطبيقاتها.
كن ودوداً ومشجعاً، واستخدم أمثلة من الحياة اليومية لتوضيح المفاهيم المعقدة.
عند الإجابة بالعربية، استخدم لغة واضحة وبسيطة مناسبة للمبتدئين.`;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [keyRow] = await db
    .select({ encryptedKey: encryptedKeys.encryptedKey })
    .from(encryptedKeys)
    .where(eq(encryptedKeys.userId, session.user.id))
    .limit(1);

  if (!keyRow) {
    return NextResponse.json({ error: 'لم يتم إضافة مفتاح API بعد' }, { status: 400 });
  }

  let apiKey: string;
  try {
    apiKey = await decryptApiKey(keyRow.encryptedKey);
  } catch {
    return NextResponse.json({ error: 'فشل فك تشفير المفتاح' }, { status: 500 });
  }

  const { messages } = (await req.json()) as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'الرسائل مطلوبة' }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.create({
          model: MODEL,
          max_tokens: 2048,
          system: [
            {
              type: 'text',
              text: SYSTEM_PROMPT,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages,
          stream: true,
        });

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text));
          }
          if (event.type === 'message_delta' && event.usage) {
            totalOutputTokens = event.usage.output_tokens ?? 0;
          }
          if (event.type === 'message_start' && event.message.usage) {
            totalInputTokens = event.message.usage.input_tokens ?? 0;
          }
        }

        controller.close();

        // Fire-and-forget session record
        db.insert(sandboxSessions)
          .values({
            userId: session.user.id,
            model: MODEL,
            messagesCount: messages.length + 1,
            tokensUsed: totalInputTokens + totalOutputTokens,
          })
          .catch(() => {});
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'خطأ غير متوقع';
        controller.enqueue(encoder.encode(`\n\n[خطأ: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
