import type { Metadata } from 'next';
import { getAgentBySlug, getLessonsByAgent } from '@/lib/content/claude-lessons';
import { CourseSchema, BreadcrumbSchema } from '@/components/seo/json-ld';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; agentSlug: string }>;
}): Promise<Metadata> {
  const { locale, agentSlug } = await params;
  const isAr = locale === 'ar';
  const agent = getAgentBySlug(agentSlug);

  if (!agent) {
    return { title: isAr ? 'غير موجود' : 'Not Found' };
  }

  const title = isAr ? agent.nameAr : agent.nameEn;
  const description = isAr ? agent.descriptionAr : agent.descriptionEn;
  const pageUrl = `${APP_URL}/${locale}/agents/${agentSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: {
        ar: `${APP_URL}/ar/agents/${agentSlug}`,
        en: `${APP_URL}/en/agents/${agentSlug}`,
        'x-default': `${APP_URL}/ar/agents/${agentSlug}`,
      },
    },
    openGraph: {
      title: isAr ? `${title} | ذكاوي` : `${title} | Zkawi`,
      description,
      url: pageUrl,
      siteName: 'ذكاوي | Zkawi',
      locale: isAr ? 'ar_EG' : 'en_US',
      type: 'website',
      images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isAr ? `${title} | ذكاوي` : `${title} | Zkawi`,
      description,
      images: ['/og-image.svg'],
    },
  };
}

export default async function AgentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; agentSlug: string }>;
}) {
  const { locale, agentSlug } = await params;
  const isAr = locale === 'ar';
  const agent = getAgentBySlug(agentSlug);
  const lessons = agent ? getLessonsByAgent(agentSlug) : [];

  return (
    <>
      {agent && (
        <>
          <CourseSchema
            locale={locale}
            agentSlug={agentSlug}
            agentName={isAr ? agent.nameAr : agent.nameEn}
            agentDescription={isAr ? agent.descriptionAr : agent.descriptionEn}
            lessons={lessons}
          />
          <BreadcrumbSchema
            items={[
              { name: isAr ? 'الرئيسية' : 'Home', url: `${APP_URL}/${locale}` },
              { name: isAr ? agent.nameAr : agent.nameEn, url: `${APP_URL}/${locale}/agents/${agentSlug}` },
            ]}
          />
        </>
      )}
      {children}
    </>
  );
}
