import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
import { getDir, isRTL } from '@/lib/i18n/locale-utils';
import { Providers } from '@/components/providers';
import { PwaRegister } from '@/components/pwa-register';
import { PwaInstallBanner } from '@/components/pwa-install-banner';
import { Mascot } from '@/components/mascot';
import { APP_URL } from '@/lib/utils';
import '../globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: {
      default: t('title'),
      template: t('titleTemplate'),
    },
    description: t('description'),
    keywords: t('keywords').split(',').map(k => k.trim()),
    metadataBase: new URL(APP_URL),
    authors: [{ name: 'ذكاوي' }],
    creator: 'ذكاوي',
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    alternates: {
      canonical: `${APP_URL}/${locale}`,
      languages: {
        ar: `${APP_URL}/ar`,
        en: `${APP_URL}/en`,
        'x-default': `${APP_URL}/ar`,
      },
    },
    openGraph: {
      type: 'website',
      locale: t('ogLocale'),
      url: `${APP_URL}/${locale}`,
      siteName: 'ذكاوي | Zkawi',
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'ذكاوي' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitterTitle'),
      description: t('twitterDescription'),
      images: ['/og-image.svg'],
    },
    icons: {
      icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
      apple: '/logo-icon.svg',
    },
    manifest: '/manifest.json',
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'ar' | 'en')) {
    notFound();
  }

  const messages = await getMessages();
  const dir = getDir(locale);
  const fontVars = `${cairo.variable} ${inter.variable}`;

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${fontVars} h-full`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col antialiased"
        style={{
          fontFamily:
            isRTL(locale)
              ? 'var(--font-cairo), sans-serif'
              : 'var(--font-inter), sans-serif',
        }}
      >
        <Providers messages={messages} locale={locale}>
          <PwaRegister />
          {children}
          <PwaInstallBanner />
          <Mascot />
        </Providers>
      </body>
    </html>
  );
}
