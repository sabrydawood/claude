'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/lib/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import QuizComponent from '@/components/quiz/quiz-component';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getLessonById, getLessonsByAgent } from '@/lib/content/claude-lessons';
import { ChevronLeft, ChevronRight, Clock, Zap, CheckCircle2, BookOpen, Trophy } from 'lucide-react';

interface UserProgress {
  completedLessons: number[];
  totalXp: number;
  streakDays: number;
  quizzesCompleted: number;
  scores: Record<number, number>;
}

function getStoredProgress(): UserProgress {
  if (typeof window === 'undefined') return {
    completedLessons: [], totalXp: 0, streakDays: 1, quizzesCompleted: 0, scores: {}
  };
  try {
    const stored = localStorage.getItem('zkawi_progress');
    if (stored) {
      const p = JSON.parse(stored);
      return {
        completedLessons: p.completedLessons || [],
        totalXp: p.totalXp || 0,
        streakDays: p.streakDays || 1,
        quizzesCompleted: p.quizzesCompleted || 0,
        scores: p.scores || {},
      };
    }
  } catch {}
  return { completedLessons: [], totalXp: 0, streakDays: 1, quizzesCompleted: 0, scores: {} };
}

function saveProgress(updated: UserProgress) {
  try {
    localStorage.setItem('zkawi_progress', JSON.stringify(updated));
  } catch {}
}

type LessonView = 'content' | 'quiz' | 'completed';

export default function LessonPage({
  params,
}: {
  params: Promise<{ agentSlug: string; lessonId: string }>;
}) {
  const { agentSlug, lessonId } = use(params);
  const t = useTranslations('lessons');
  const tQuiz = useTranslations('quiz');
  const locale = useLocale();
  const router = useRouter();

  const lessonIdNum = parseInt(lessonId);
  const lesson = getLessonById(lessonIdNum);
  const allLessons = getLessonsByAgent(agentSlug);
  const currentIndex = allLessons.findIndex(l => l.id === lessonIdNum);
  const nextLesson = allLessons[currentIndex + 1];

  const [view, setView] = useState<LessonView>('content');
  const [progress, setProgress] = useState<UserProgress>({
    completedLessons: [], totalXp: 0, streakDays: 1, quizzesCompleted: 0, scores: {}
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [xpPopup, setXpPopup] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProgress(getStoredProgress());
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const el = contentRef.current;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setScrollProgress(total > 0 ? (scrolled / total) * 100 : 100);
    };
    const el = contentRef.current;
    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  if (!lesson) notFound();

  const isAlreadyCompleted = progress.completedLessons.includes(lesson.id);

  const handleQuizComplete = (score: number, xpEarned: number) => {
    const updated = { ...progress };

    if (!updated.completedLessons.includes(lesson.id)) {
      updated.completedLessons = [...updated.completedLessons, lesson.id];
      updated.totalXp += xpEarned;
      updated.quizzesCompleted += 1;
    }

    updated.scores = { ...updated.scores, [lesson.id]: score };
    setProgress(updated);
    saveProgress(updated);

    setXpPopup(xpEarned);
    setTimeout(() => setXpPopup(null), 2500);

    setView('completed');
  };

  const handleRetry = () => {
    setView('quiz');
  };

  const content = locale === 'ar' ? lesson.contentAr : lesson.contentEn;
  const title = locale === 'ar' ? lesson.titleAr : lesson.titleEn;
  const description = locale === 'ar' ? lesson.descriptionAr : lesson.descriptionEn;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Header />

      {/* XP popup */}
      <AnimatePresence>
        {xpPopup !== null && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed bottom-8 start-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3 font-black"
          >
            <Zap size={20} fill="white" />
            <span>+{xpPopup} XP كسبتها! 🎉</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        {/* Top progress bar */}
        <div className="h-1 bg-[var(--border)]">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-amber-400"
            style={{ width: `${view === 'content' ? scrollProgress : view === 'quiz' ? 70 : 100}%` }}
          />
        </div>

        {/* Lesson header */}
        <div className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-16 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <Link href={`/agents/${agentSlug}`}>
                <button className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--zkawi-purple)] transition-colors font-medium">
                  <ChevronLeft size={16} className="flip-rtl" />
                  {t('backToAgent')}
                </button>
              </Link>

              <div className="flex-1 text-center">
                <span className="text-sm font-bold text-[var(--text-muted)]">
                  {t('lesson')} {currentIndex + 1} {t('of')} {allLessons.length}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  {lesson.estimatedMinutes} {t('minutes')}
                </div>
                <div className="flex items-center gap-1 text-[var(--zkawi-purple)] font-bold">
                  <Zap size={12} fill="currentColor" />
                  {lesson.xpReward} XP
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Lesson title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-[var(--zkawi-purple)]/15 rounded-2xl flex items-center justify-center text-3xl">
                {lesson.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {isAlreadyCompleted && (
                    <Badge variant="success">
                      <CheckCircle2 size={12} />
                      {t('completed')}
                    </Badge>
                  )}
                  <Badge variant="default">
                    {view === 'content' ? '📖 قراءة' : view === 'quiz' ? '🎯 كويز' : '✅ مكتمل'}
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-[var(--text)]">{title}</h1>
                <p className="text-[var(--text-muted)] text-sm mt-1">{description}</p>
              </div>
            </div>

            {/* View tabs */}
            <div className="flex items-center gap-2 p-1 bg-[var(--surface-2)] rounded-2xl w-fit">
              {(['content', 'quiz'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    view === v
                      ? 'bg-[var(--surface)] text-[var(--zkawi-purple)] shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {v === 'content' ? '📖 الدرس' : '🎯 الكويز'}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content view */}
          <AnimatePresence mode="wait">
            {view === 'content' && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div
                  ref={contentRef}
                  className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm p-6 md:p-8 max-h-[60vh] overflow-y-auto"
                >
                  <div
                    className="prose prose-lg max-w-none lesson-content"
                    style={{
                      direction: locale === 'ar' ? 'rtl' : 'ltr',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: markdownToHtml(content),
                    }}
                  />
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-[var(--text-muted)]">
                    📖 {Math.round(scrollProgress)}% اتقرأ
                  </div>
                  <Button onClick={() => setView('quiz')} className="gap-2">
                    {t('startQuiz')} 🎯
                    <ChevronRight size={16} className="flip-rtl" />
                  </Button>
                </div>
              </motion.div>
            )}

            {view === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm p-6 md:p-8">
                  <QuizComponent
                    questions={lesson.quiz}
                    xpReward={lesson.xpReward}
                    onComplete={handleQuizComplete}
                    onRetry={handleRetry}
                  />
                </div>
              </motion.div>
            )}

            {view === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="bg-[var(--surface)] rounded-3xl border border-[var(--zkawi-green)]/30 shadow-sm p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="text-6xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <h2 className="text-2xl font-black text-[var(--text)] mb-2">
                    أحسنت! الدرس اتكمل! ⭐
                  </h2>
                  <p className="text-[var(--text-muted)] mb-6">
                    كملت درس "{title}" وكسبت XP جديدة!
                  </p>

                  <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="bg-[var(--zkawi-purple)]/10 border border-[var(--zkawi-purple)]/30 rounded-2xl p-4 text-center">
                      <div className="flex items-center gap-1 justify-center text-[var(--zkawi-purple)] font-black text-xl">
                        <Zap size={18} fill="currentColor" />
                        +{progress.scores[lesson.id] >= 80 ? lesson.xpReward : Math.round(lesson.xpReward * (progress.scores[lesson.id] || 0) / 100)}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">XP كسبتها</div>
                    </div>
                    {progress.scores[lesson.id] !== undefined && (
                      <div className="bg-[var(--zkawi-green)]/10 border border-[var(--zkawi-green)]/30 rounded-2xl p-4 text-center">
                        <div className="text-[var(--zkawi-green)] font-black text-xl">
                          {progress.scores[lesson.id]}%
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">نتيجة الكويز</div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => setView('content')} className="gap-2">
                      <BookOpen size={16} />
                      راجع الدرس
                    </Button>
                    {nextLesson ? (
                      <Link href={`/agents/${agentSlug}/lessons/${nextLesson.id}`}>
                        <Button className="gap-2">
                          {t('nextLesson')}
                          <ChevronRight size={16} className="flip-rtl" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/agents/${agentSlug}`}>
                        <Button className="gap-2">
                          <Trophy size={16} />
                          {locale === 'ar' ? 'شوف كل الدروس' : 'View all lessons'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Simple markdown to HTML converter — styles handled by .lesson-content in globals.css
function markdownToHtml(markdown: string): string {
  return markdown
    .trim()
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li><span class="bullet">•</span><span>$1</span></li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/^(\d+)\. (.+)$/gm, '<li><span class="num">$1.</span><span>$2</span></li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|u|b|l|p])(.+)$/gm, '<p>$1</p>');
}
