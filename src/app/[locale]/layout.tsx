import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
import { getDir, isRTL } from '@/lib/i18n/locale-utils';
import { Providers } from '@/components/providers';
import { PwaRegister } from '@/components/pwa-register';
import { PwaInstallBanner } from '@/components/pwa-install-banner';
import { Mascot } from '@/components/mascot';
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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: {
      default: locale === 'ar'
        ? 'ذكاوي — تعلم الذكاء الاصطناعي بطريقة سهلة ومرحة'
        : 'Zkawi — Learn AI the Easy and Fun Way',
      template: locale === 'ar' ? '%s | ذكاوي' : '%s | Zkawi',
    },
    description: locale === 'ar'
      ? 'منصة تعليمية للأطفال والكبار لتعلم الذكاء الاصطناعي بطريقة سهلة وممتعة. كسب XP، افتح إنجازات، وبقى خبير AI!'
      : 'An interactive educational platform for kids and adults to learn AI in a fun way. Earn XP, unlock achievements, and become an AI expert!',
    keywords: locale === 'ar'
      ? ['ذكاء اصطناعي', 'تعلم', 'أطفال', 'Claude', 'AI', 'تعليم', 'ذكاوي', 'zkawi', 'برومبت']
      : ['AI', 'artificial intelligence', 'learn AI', 'kids', 'Claude', 'education', 'zkawi'],
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
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      alternateLocale: locale === 'ar' ? 'en_US' : 'ar_EG',
      url: `${APP_URL}/${locale}`,
      siteName: 'ذكاوي | Zkawi',
      title: locale === 'ar'
        ? 'ذكاوي — تعلم الذكاء الاصطناعي بطريقة سهلة ومرحة'
        : 'Zkawi — Learn AI the Easy and Fun Way',
      description: locale === 'ar'
        ? 'منصة تعليمية تفاعلية للأطفال والكبار. كسب XP وافتح إنجازات!'
        : 'Interactive AI learning platform. Earn XP and unlock achievements!',
      images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'ذكاوي' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: locale === 'ar' ? 'ذكاوي — تعلم الذكاء الاصطناعي' : 'Zkawi — Learn AI',
      description: locale === 'ar'
        ? 'منصة تعليمية تفاعلية للأطفال والكبار'
        : 'Interactive AI learning for kids and adults',
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
