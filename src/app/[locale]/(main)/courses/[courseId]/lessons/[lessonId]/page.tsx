import { notFound } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { getLessonById } from '@/lib/db/queries/content';
import { getCourseWithLessons } from '@/lib/db/queries/subjects';
import { getServerSession } from '@/lib/auth/server-session';
import { db } from '@/lib/db/Index';
import { UserProgress, UserStats } from '@/lib/db/Schema';
import { eq } from 'drizzle-orm';
import LessonPageClient from '../../../../agents/[agentSlug]/lessons/[lessonId]/lesson-page-client';

export default async function CourseLessonPage({
  params,
}: {
  params: Promise<{ locale: string; courseId: string; lessonId: string }>;
}) {
  const { locale, courseId, lessonId } = await params;

  const [lesson, course] = await Promise.all([
    getLessonById(lessonId, locale),
    getCourseWithLessons(courseId, locale),
  ]);

  if (!lesson || !course) notFound();

  const allLessons = course.lessons;
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const nextLesson = allLessons[currentIndex + 1] ?? null;

  const session = await getServerSession();
  let initialProgress = null;

  if (session?.user?.id) {
    const userId = session.user.id;
    const [progressRows, statsArr] = await Promise.all([
      db.select().from(UserProgress).where(eq(UserProgress.UserId, userId)),
      db.select().from(UserStats).where(eq(UserStats.UserId, userId)).limit(1),
    ]);
    const stats = statsArr[0];
    initialProgress = {
      completedLessons: progressRows.filter(r => r.Completed).map(r => r.LessonId),
      totalXp: stats?.TotalXp ?? 0,
      streakDays: stats?.StreakDays ?? 0,
      quizzesCompleted: stats?.QuizzesCompleted ?? 0,
      scores: Object.fromEntries(progressRows.map(r => [r.LessonId, r.Score ?? 0])),
    };
  }

  // Next lesson in course: link back to course lesson route
  const nextLessonId = nextLesson ? nextLesson.id : null;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Header />
      <LessonPageClient
        lesson={lesson}
        allLessonsCount={allLessons.length}
        currentIndex={currentIndex}
        nextLessonId={nextLessonId}
        locale={locale}
        agentSlug=""
        initialProgress={initialProgress}
        backHref={`/courses/${courseId}`}
        lessonBasePath={`/courses/${courseId}/lessons`}
      />
      <Footer />
    </div>
  );
}
