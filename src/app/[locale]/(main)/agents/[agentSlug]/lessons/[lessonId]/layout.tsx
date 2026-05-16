import type { Metadata } from 'next';
import { getLessonById, getAgentBySlug } from '@/lib/db/queries/content';
import { LessonSchema, BreadcrumbSchema } from '@/components/seo/json-ld';
import { APP_URL } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; agentSlug: string; lessonId: string }>;
}): Promise<Metadata> {
  const { locale, agentSlug, lessonId } = await params;

  const lesson = await getLessonById(lessonId, locale);
  const agent = await getAgentBySlug(agentSlug, locale);

  if (!lesson || !agent) {
    return { title: locale === 'ar' ? 'الدرس غير موجود' : 'Lesson Not Found' };
  }

  const lessonTitle = lesson.title;
  const lessonDesc = lesson.description;
  const agentName = agent.name;
  const pageUrl = `${APP_URL}/${locale}/agents/${agentSlug}/lessons/${lessonId}`;
  const ogImageUrl = `/api/og?title=${encodeURIComponent(lessonTitle)}&agent=${encodeURIComponent(agentName)}&locale=${locale}`;

  const fullTitle = locale === 'ar'
    ? `${lessonTitle} — ${agentName} | ذكاوي`
    : `${lessonTitle} — ${agentName} | Zkawi`;

  return {
    title: lessonTitle,
    description: lessonDesc,
    keywords: locale === 'ar'
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
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
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
  const lesson = await getLessonById(lessonId, locale);
  const agent = await getAgentBySlug(agentSlug, locale);

  return (
    <>
      {lesson && agent && (
        <>
          <LessonSchema
            locale={locale}
            agentSlug={agentSlug}
            lessonId={lessonId}
            lesson={lesson}
          />
          <BreadcrumbSchema
            items={[
              { name: locale === 'ar' ? 'الرئيسية' : 'Home', url: `${APP_URL}/${locale}` },
              {
                name: agent.name,
                url: `${APP_URL}/${locale}/agents/${agentSlug}`,
              },
              {
                name: lesson.title,
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
