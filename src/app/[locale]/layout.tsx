import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
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

export const metadata: Metadata = {
  title: 'ذكاوي - تعلم الذكاء الاصطناعي بطريقة سهلة ومرحة',
  description:
    'منصة تعليمية للأطفال والكبار لتعلم الذكاء الاصطناعي بطريقة سهلة وممتعة. كسب XP وافتح إنجازات!',
  keywords: ['ذكاء اصطناعي', 'تعلم', 'أطفال', 'Claude', 'AI', 'تعليم'],
};

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

  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const fontClass = locale === 'ar' ? cairo.variable : inter.variable;

  return (
    <html lang={locale} dir={dir} className={`${fontClass} ${cairo.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased" style={{ fontFamily: locale === 'ar' ? 'var(--font-cairo), sans-serif' : 'var(--font-inter), sans-serif' }}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
