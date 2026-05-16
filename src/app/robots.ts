import { APP_URL } from '@/lib/utils';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/ar/', '/en/'],
        disallow: ['/api/', '/ar/dashboard', '/en/dashboard'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
