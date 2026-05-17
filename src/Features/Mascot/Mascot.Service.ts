/**
 * Mascot.Service.ts
 * Builds the mascot's contextual system prompt based on current page.
 */
import { db } from '@/lib/db/Index';
import { SystemPrompts } from '@/lib/db/Schema';
import { and, eq } from 'drizzle-orm';

const DEFAULT_MASCOT_PROMPT = `أنت Xbot، مساعد تعليمي ذكي للأطفال العرب.
قواعد:
- تحدث بالعربية دائماً بأسلوب بسيط ومناسب للأطفال
- استخدم الـ tools للحصول على معلومات المفاهيم ومستوى الطالب
- لا تُعطِ إجابات مباشرة — اسأل وشجع التفكير
- احتفل بكل إنجاز صغير
- لا تذكر بيانات شخصية عن الطالب في ردودك`;

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
 * @param Locale - User's locale (keyof TLocale )
 */
export async function BuildMascotSystemPrompt(Pathname: string, Locale: string): Promise<string> {
  const PageLabel = (() => {
    if (Pathname.match(/\/lessons\/([^/]+)/)) return Locale === 'ar' ? 'صفحة درس' : 'Lesson page';
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

  return `${BasePrompt}\n\n── الصفحة الحالية ──\n${PageLabel}${LangInstruction}`;
}
