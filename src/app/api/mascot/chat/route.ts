import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { streamChat, type ChatMessage } from '@/lib/ai/providers';
import { getLessonById } from '@/lib/content/claude-lessons';

function buildSystemPrompt(pathname: string, locale: string): string {
  const isAr = locale === 'ar';

  // Inject lesson content when on a lesson page
  const lessonMatch = pathname.match(/\/lessons\/(\d+)/);
  const lesson = lessonMatch ? getLessonById(parseInt(lessonMatch[1])) : null;

  const lessonBlock = lesson
    ? `

── الدرس الحالي ──
العنوان: ${isAr ? lesson.titleAr : lesson.titleEn}
الوصف: ${isAr ? lesson.descriptionAr : lesson.descriptionEn}

المحتوى الكامل:
${(isAr ? lesson.contentAr : lesson.contentEn).slice(0, 3000)}`
    : '';

  const pageLabel = (() => {
    if (lesson)                           return isAr ? `درس: ${lesson.titleAr}` : `Lesson: ${lesson.titleEn}`;
    if (pathname.includes('/dashboard'))  return isAr ? 'لوحة التحكم' : 'Dashboard';
    if (pathname.includes('/agents'))     return isAr ? 'قائمة الدروس' : 'Lessons list';
    if (pathname.includes('/leaderboard'))return isAr ? 'لوحة المتصدرين' : 'Leaderboard';
    if (pathname.includes('/sandbox'))    return isAr ? 'ساندبوكس' : 'Sandbox';
    if (pathname.includes('/profile'))    return isAr ? 'صفحة الملف الشخصي' : 'Profile';
    return isAr ? 'الصفحة الرئيسية' : 'Home';
  })();

  return `أنت "ذكي" (Zaki)، المرشد الشخصي الذكي في منصة ذكاوي — منصة تعليمية عربية لتعلم الذكاء الاصطناعي.

── شخصيتك ──
- مرح، ودود، ومشجع دائماً — زي مدرس صاحب وليس جاف
- تتكلم عربي مصري بسيط يناسب الأطفال والكبار (أو إنجليزي لو المستخدم يكتب بالإنجليزي)
- ردودك قصيرة ومركزة (3-5 جمل) إلا لو طُلب شرح تفصيلي
- تستخدم إيموجيز بشكل طبيعي ومعتدل 🌟
- دايماً تشجع المستخدم حتى لو أخطأ

── الصفحة الحالية ──
${pageLabel}${lessonBlock}

── قواعد حاسمة ──
1. أسئلة الكويز مباشرة: قول "شغل دماغك شوية 😄 حاول لوحدك الأول! لو مش عارف ارجع للدرس."
2. لو في درس: اشرح المفاهيم بطريقة أبسط من النص، استخدم أمثلة من الحياة اليومية
3. لو المستخدم محبط أو تعبان: شجّعه بحرارة قبل ما تشرح أي حاجة
4. ردّك دايماً بنفس لغة المستخدم تماماً
5. لو السؤال مش متعلق بالذكاء الاصطناعي أو المنصة: أجب بإيجاز وارجع للموضوع برفق`;
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await req.json() as { messages: ChatMessage[]; pathname: string; locale: string };
  const { messages, pathname, locale = 'ar' } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'No messages' }), { status: 400 });
  }

  const system = buildSystemPrompt(pathname, locale);
  // Keep last 12 messages to control cost while maintaining context
  const trimmed = messages.slice(-12);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const text of streamChat(system, trimmed)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
      } catch {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'AI unavailable' })}\n\n`));
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
