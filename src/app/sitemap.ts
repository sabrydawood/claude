import type { MetadataRoute } from 'next';
import { claudeLessons, agents } from '@/lib/content/claude-lessons';
import { routing } from '@/lib/i18n/routing';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const locales = routing.locales;

function url(path: string): string {
  return `${APP_URL}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

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

  const agentPages: MetadataRoute.Sitemap = agents
    .filter((a) => a.isActive)
    .flatMap((agent) =>
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

  const lessonPages: MetadataRoute.Sitemap = claudeLessons.flatMap((lesson) =>
    locales.map((locale) => ({
      url: url(`/${locale}/agents/claude/lessons/${lesson.id}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [
            l,
            url(`/${l}/agents/claude/lessons/${lesson.id}`),
          ]),
        ),
      },
    })),
  );

  return [...staticPages, ...agentPages, ...lessonPages];
}
