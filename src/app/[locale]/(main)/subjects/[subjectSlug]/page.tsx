import { notFound } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { getSubjectBySlug, getCoursesBySubject } from '@/lib/db/queries/content';
import { GetValidLocale } from '@/lib/i18n/Locale.Utils';
import SubjectDetailClient from './subject-detail-client';

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; subjectSlug: string }>;
}) {
  const { locale, subjectSlug } = await params;
  const validLocale = GetValidLocale(locale);

  const subject = await getSubjectBySlug(subjectSlug, validLocale);
  if (!subject) notFound();

  const courses = await getCoursesBySubject(subject.id, validLocale);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Header />
      <SubjectDetailClient subject={subject} courses={courses} locale={validLocale} />
      <Footer />
    </div>
  );
}
