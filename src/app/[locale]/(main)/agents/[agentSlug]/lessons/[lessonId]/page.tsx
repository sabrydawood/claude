import { notFound } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { getLessonById, getLessonsByAgent } from '@/lib/db/queries/content';
import { getServerSession } from '@/lib/auth/server-session';
import { db } from '@/lib/db/Index';
import { UserProgress, UserStats } from '@/lib/db/Schema';
import { eq } from 'drizzle-orm';
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
        initialProgress={initialProgress}
      />
      <Footer />
    </div>
  );
}
