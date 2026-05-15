'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { NotFoundContent } from './not-found-content';

export default function NotFoundPage() {
  const t = useTranslations('error');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <NotFoundContent
          title={t('pageNotFound')}
          description={t('description')}
          goHomeText={t('goHome')}
        />
      </main>
      <Footer />
    </div>
  );
}
