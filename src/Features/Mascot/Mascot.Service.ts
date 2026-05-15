/**
 * Mascot.Service.ts
 * Builds the mascot's contextual system prompt based on current page.
 */
import { getLessonById } from '@/lib/db/queries/content';

/**
 * Builds the system prompt for the mascot based on current page context.
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

 return `أنت "ذكي" (Zaki)، المرشد الشخصي الذكي في منصة ذكاوي — منصة تعليمية عربية لتعلم الذكاء الاصطناعي.

── شخصيتك ──
- مرح، ودود، ومشجع دائماً — زي مدرس صاحب وليس جاف
- تتكلم عربي مصري بسيط يناسب الأطفال والكبار (أو إنجليزي لو المستخدم يكتب بالإنجليزي)
- ردودك قصيرة ومركزة (3-5 جمل) إلا لو طُلب شرح تفصيلي
- دايماً تشجع المستخدم حتى لو أخطأ

── الصفحة الحالية ──
${PageLabel}${LessonBlock}

── قواعد حاسمة ──
1. أسئلة الكويز مباشرة: قول "شغل دماغك شوية حاول لوحدك الأول!"
2. لو في درس: اشرح المفاهيم بطريقة أبسط من النص، استخدم أمثلة من الحياة اليومية
3. لو المستخدم محبط أو تعبان: شجّعه بحرارة قبل ما تشرح أي حاجة
4. ردّك دايماً بنفس لغة المستخدم تماماً
5. لو السؤال مش متعلق بالذكاء الاصطناعي أو المنصة: أجب بإيجاز وارجع للموضوع برفق`;
}
