import type { Metadata } from 'next';
import { getAgentBySlug, getLessonsByAgent } from '@/lib/db/queries/content';
import { CourseSchema, BreadcrumbSchema } from '@/components/seo/json-ld';
import { APP_URL } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; agentSlug: string }>;
}): Promise<Metadata> {
  const { locale, agentSlug } = await params;
  const agent = await getAgentBySlug(agentSlug, locale);

  if (!agent) {
    return { title: locale === 'ar' ? 'غير موجود' : 'Not Found' };
  }

  const title = agent.name;
  const description = agent.description;
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
      title: `${title} | ${locale === 'ar' ? 'ذكاوي' : 'Zkawi'}`,
      description,
      url: pageUrl,
      siteName: 'ذكاوي | Zkawi',
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      type: 'website',
      images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${locale === 'ar' ? 'ذكاوي' : 'Zkawi'}`,
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
  const agent = await getAgentBySlug(agentSlug, locale);
  const lessons = agent ? await getLessonsByAgent(agentSlug, locale) : [];

  return (
    <>
      {agent && (
        <>
          <CourseSchema
            locale={locale}
            agentSlug={agentSlug}
            agentName={agent.name}
            agentDescription={agent.description}
            lessons={lessons}
          />
          <BreadcrumbSchema
            items={[
              { name: locale === 'ar' ? 'الرئيسية' : 'Home', url: `${APP_URL}/${locale}` },
              { name: agent.name, url: `${APP_URL}/${locale}/agents/${agentSlug}` },
            ]}
          />
        </>
      )}
      {children}
    </>
  );
}
