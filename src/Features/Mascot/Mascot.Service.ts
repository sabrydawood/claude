/**
 * Mascot.Service.ts
 * Builds the mascot's contextual system prompt based on current page.
 */
import { getLessonById } from '@/lib/db/queries/content';
import { db } from '@/lib/db/Index';
import { SystemPrompts } from '@/lib/db/Schema';
import { and, eq } from 'drizzle-orm';

const DEFAULT_MASCOT_PROMPT = `أنت "ذكي" (Zaki)، المرشد الشخصي الذكي في منصة ذكاوي — منصة تعليمية عربية لتعلم الذكاء الاصطناعي.

── شخصيتك ──
- مرح، ودود، ومشجع دائماً — زي مدرس صاحب وليس جاف
- تتكلم عربي مصري بسيط يناسب الأطفال والكبار (أو إنجليزي لو المستخدم يكتب بالإنجليزي)
- ردودك قصيرة ومركزة (3-5 جمل) إلا لو طُلب شرح تفصيلي
- دايماً تشجع المستخدم حتى لو أخطأ

── قواعد حاسمة ──
1. أسئلة الكويز مباشرة: قول "شغل دماغك شوية حاول لوحدك الأول!"
2. لو في درس: اشرح المفاهيم بطريقة أبسط من النص، استخدم أمثلة من الحياة اليومية
3. لو المستخدم محبط أو تعبان: شجّعه بحرارة قبل ما تشرح أي حاجة
4. ردّك دايماً بنفس لغة المستخدم تماماً
5. لو السؤال مش متعلق بالذكاء الاصطناعي أو المنصة: أجب بإيجاز وارجع للموضوع برفق`;

// In-process LRU cache for system prompts — avoids DB lookup on every request
const PROMPT_LRU = new Map<string, { Prompt: string; ExpiresAt: number }>();
const PROMPT_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function BuildMascotSystemPromptCached(Pathname: string, Locale: string): Promise<string> {
  const Key = `${Pathname}:${Locale}`;
  const Cached = PROMPT_LRU.get(Key);
  if (Cached && Date.now() < Cached.ExpiresAt) return Cached.Prompt;

  const Prompt = await BuildMascotSystemPrompt(Pathname, Locale);
  PROMPT_LRU.set(Key, { Prompt, ExpiresAt: Date.now() + PROMPT_TTL_MS });

  // Evict expired entries if cache grows large
  if (PROMPT_LRU.size > 200) {
    const Now = Date.now();
    for (const [K, V] of PROMPT_LRU) {
      if (Now >= V.ExpiresAt) PROMPT_LRU.delete(K);
    }
  }
  return Prompt;
}

/**
 * Builds the system prompt for the mascot based on current page context.
 * Loads base prompt from DB (SystemPrompts table), falls back to hardcoded default.
 * @param Pathname - Current page URL path
 * @param Locale - User's locale ('ar' | 'en')
 */
export async function BuildMascotSystemPrompt(Pathname: string, Locale: string): Promise<string> {
  const LessonMatch = Pathname.match(/\/lessons\/([^/]+)/);
  const Lesson = LessonMatch ? await getLessonById(LessonMatch[1], Locale) : null;

  const LessonBlock = Lesson
    ? `\n\n── الدرس الحالي ──\nالعنوان: ${Lesson.title}\nالوصف: ${Lesson.description}\n\nالمحتوى الكامل:\n${Lesson.content.slice(0, 3000)}`
    : '';

  const PageLabel = (() => {
    if (Lesson) return Locale === 'ar' ? `درس: ${Lesson.title}` : `Lesson: ${Lesson.title}`;
    if (Pathname.includes('/dashboard')) return Locale === 'ar' ? 'لوحة التحكم' : 'Dashboard';
    if (Pathname.includes('/agents')) return Locale === 'ar' ? 'قائمة الدروس' : 'Lessons list';
    if (Pathname.includes('/leaderboard')) return Locale === 'ar' ? 'لوحة المتصدرين' : 'Leaderboard';
    if (Pathname.includes('/sandbox')) return Locale === 'ar' ? 'ساندبوكس' : 'Sandbox';
    if (Pathname.includes('/profile')) return Locale === 'ar' ? 'صفحة الملف الشخصي' : 'Profile';
    return Locale === 'ar' ? 'الصفحة الرئيسية' : 'Home';
  })();

  // Load base prompt from DB with fallback to hardcoded default
  const [PromptRow] = await db
    .select({ Content: SystemPrompts.Content })
    .from(SystemPrompts)
    .where(and(eq(SystemPrompts.Key, 'mascot_base'), eq(SystemPrompts.IsActive, true)))
    .limit(1);

  const BasePrompt = PromptRow?.Content ?? DEFAULT_MASCOT_PROMPT;

  // Explicit language override — appended LAST so it overrides any language
  // inference the model may derive from the Arabic system prompt text.
  const LangInstruction = Locale === 'ar'
    ? `\n\n── اللغة المطلوبة ──\nردّك دايماً بالعربية (عامية مصرية مفهومة) — حتى لو المستخدم كتب بالإنجليزي.`
    : `\n\n── Required Language ──\nALWAYS respond in English only. The user interface is in English. Do NOT use Arabic regardless of the instructions above.`;

  return `${BasePrompt}\n\n── الصفحة الحالية ──\n${PageLabel}${LessonBlock}${LangInstruction}`;
}
