import type { Metadata } from 'next';
import { getLessonById, getAgentBySlug } from '@/lib/content/claude-lessons';
import { LessonSchema, BreadcrumbSchema } from '@/components/seo/json-ld';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; agentSlug: string; lessonId: string }>;
}): Promise<Metadata> {
  const { locale, agentSlug, lessonId } = await params;
  const isAr = locale === 'ar';

  const lesson = getLessonById(parseInt(lessonId, 10));
  const agent = getAgentBySlug(agentSlug);

  if (!lesson || !agent) {
    return { title: isAr ? 'الدرس غير موجود' : 'Lesson Not Found' };
  }

  const lessonTitle = isAr ? lesson.titleAr : lesson.titleEn;
  const lessonDesc = isAr ? lesson.descriptionAr : lesson.descriptionEn;
  const agentName = isAr ? agent.nameAr : agent.nameEn;
  const pageUrl = `${APP_URL}/${locale}/agents/${agentSlug}/lessons/${lessonId}`;
  const ogImageUrl = `/api/og?title=${encodeURIComponent(lessonTitle)}&agent=${encodeURIComponent(agentName)}&locale=${locale}`;

  const fullTitle = isAr
    ? `${lessonTitle} — ${agentName} | ذكاوي`
    : `${lessonTitle} — ${agentName} | Zkawi`;

  return {
    title: lessonTitle,
    description: lessonDesc,
    keywords: isAr
      ? [lessonTitle, agentName, 'ذكاء اصطناعي', 'تعلم', 'درس', 'ذكاوي']
      : [lessonTitle, agentName, 'AI', 'learn', 'lesson', 'zkawi'],
    alternates: {
      canonical: pageUrl,
      languages: {
        ar: `${APP_URL}/ar/agents/${agentSlug}/lessons/${lessonId}`,
        en: `${APP_URL}/en/agents/${agentSlug}/lessons/${lessonId}`,
        'x-default': `${APP_URL}/ar/agents/${agentSlug}/lessons/${lessonId}`,
      },
    },
    openGraph: {
      title: fullTitle,
      description: lessonDesc,
      url: pageUrl,
      siteName: 'ذكاوي | Zkawi',
      locale: isAr ? 'ar_EG' : 'en_US',
      type: 'article',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: lessonDesc,
      images: [ogImageUrl],
    },
  };
}

export default async function LessonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; agentSlug: string; lessonId: string }>;
}) {
  const { locale, agentSlug, lessonId } = await params;
  const isAr = locale === 'ar';
  const lesson = getLessonById(parseInt(lessonId, 10));
  const agent = getAgentBySlug(agentSlug);

  return (
    <>
      {lesson && agent && (
        <>
          <LessonSchema locale={locale} agentSlug={agentSlug} lesson={lesson} />
          <BreadcrumbSchema
            items={[
              { name: isAr ? 'الرئيسية' : 'Home', url: `${APP_URL}/${locale}` },
              {
                name: isAr ? agent.nameAr : agent.nameEn,
                url: `${APP_URL}/${locale}/agents/${agentSlug}`,
              },
              {
                name: isAr ? lesson.titleAr : lesson.titleEn,
                url: `${APP_URL}/${locale}/agents/${agentSlug}/lessons/${lessonId}`,
              },
            ]}
          />
        </>
      )}
      {children}
    </>
  );
}
