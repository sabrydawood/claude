import { notFound } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { getLessonById, getLessonsByAgent } from '@/lib/db/queries/content';
import LessonPageClient from './lesson-page-client';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; agentSlug: string; lessonId: string }>;
}) {
  const { locale, agentSlug, lessonId } = await params;

  const [lesson, allLessons] = await Promise.all([
    getLessonById(lessonId, locale),
    getLessonsByAgent(agentSlug, locale),
  ]);

  if (!lesson) notFound();

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const nextLesson = allLessons[currentIndex + 1] ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Header />
      <LessonPageClient
        lesson={lesson}
        allLessonsCount={allLessons.length}
        currentIndex={currentIndex}
        nextLessonId={nextLesson?.id ?? null}
        locale={locale}
        agentSlug={agentSlug}
      />
      <Footer />
    </div>
  );
}
