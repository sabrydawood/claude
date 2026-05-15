import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { getSubjects } from '@/lib/db/queries/content';
import { GetValidLocale } from '@/lib/i18n/Locale.Utils';
import SubjectsClient from './subjects-client';

export default async function SubjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = GetValidLocale(locale);

  const [subjects, t] = await Promise.all([
    getSubjects(validLocale),
    getTranslations({ locale: validLocale, namespace: 'subjects' }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Header />
      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-black text-[var(--text)] mb-3">
              {t('title')}
            </h1>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
          <SubjectsClient subjects={subjects} locale={validLocale} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
