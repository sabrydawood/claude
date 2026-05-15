import { getTranslations, getLocale } from 'next-intl/server';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { NotFoundContent } from './not-found-content';

export default async function NotFoundPage() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'error' });

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
