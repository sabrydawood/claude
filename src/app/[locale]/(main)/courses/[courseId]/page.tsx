import { notFound } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { getCourseById, getLessonsByCourse } from '@/lib/db/queries/content';
import { GetValidLocale } from '@/lib/i18n/Locale.Utils';
import CoursePageClient from './course-page-client';

export default async function CoursePage({
  params,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}) {
  const { locale, courseId } = await params;
  const validLocale = GetValidLocale(locale);

  const [course, lessons] = await Promise.all([
    getCourseById(courseId, validLocale),
    getLessonsByCourse(courseId, validLocale),
  ]);

  if (!course) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Header />
      <CoursePageClient course={course} lessons={lessons} locale={validLocale} />
      <Footer />
    </div>
  );
}
