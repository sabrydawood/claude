import type { MetadataRoute } from 'next';
import { getAllAgentsForSitemap, getAllLessonsForSitemap } from '@/lib/db/queries/content';
import { routing } from '@/lib/i18n/routing';
import { APP_URL } from '@/lib/utils';

const locales = routing.locales;

function url(path: string): string {
  return `${APP_URL}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [agentData, lessonData] = await Promise.all([
    getAllAgentsForSitemap(),
    getAllLessonsForSitemap(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: url('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, url(`/${l}`)])),
      },
    },
    ...locales.map((locale) => ({
      url: url(`/${locale}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...locales.map((locale) => ({
      url: url(`/${locale}/login`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    ...locales.map((locale) => ({
      url: url(`/${locale}/register`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];

  const agentPages: MetadataRoute.Sitemap = agentData.flatMap((agent) =>
    locales.map((locale) => ({
      url: url(`/${locale}/agents/${agent.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, url(`/${l}/agents/${agent.slug}`)]),
        ),
      },
    })),
  );

  const lessonPages: MetadataRoute.Sitemap = lessonData.flatMap((lesson) =>
    locales.map((locale) => ({
      url: url(`/${locale}/agents/${lesson.agentSlug}/lessons/${lesson.id}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [
            l,
            url(`/${l}/agents/${lesson.agentSlug}/lessons/${lesson.id}`),
          ]),
        ),
      },
    })),
  );

  return [...staticPages, ...agentPages, ...lessonPages];
}
