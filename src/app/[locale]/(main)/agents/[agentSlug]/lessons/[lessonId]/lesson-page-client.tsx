'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import QuizComponent from '@/components/quiz/quiz-component';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getDir } from '@/lib/i18n/locale-utils';
import type { LessonFull } from '@/lib/db/queries/content';
import { ChevronLeft, ChevronRight, Clock, Zap, CheckCircle2, BookOpen, Trophy } from 'lucide-react';

interface UserProgress {
  completedLessons: number[];
  totalXp: number;
  streakDays: number;
  quizzesCompleted: number;
  scores: Record<number, number>;
}

type LessonView = 'content' | 'quiz' | 'completed';

interface Props {
  lesson: LessonFull;
  allLessonsCount: number;
  currentIndex: number;
  nextLessonId: number | null;
  locale: string;
  agentSlug: string;
}

export default function LessonPageClient({ lesson, allLessonsCount, currentIndex, nextLessonId, locale, agentSlug }: Props) {
  const t = useTranslations('lessons');
  const router = useRouter();

  const [view, setView] = useState<LessonView>('content');
  const [quizKey, setQuizKey] = useState(0);
  const [progress, setProgress] = useState<UserProgress>({
    completedLessons: [], totalXp: 0, streakDays: 0, quizzesCompleted: 0, scores: {}
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [xpPopup, setXpPopup] = useState<number | null>(null);
  const [earnedAchievements, setEarnedAchievements] = useState<{ id: number; emoji: string; name: string }[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/progress')
      .then(r => r.json())
      .then(data => {
        if (data.completedLessons) setProgress(data);
      })
      .catch(() => {});
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

  const isAlreadyCompleted = progress.completedLessons.includes(lesson.id);

  const handleQuizComplete = async (score: number, xpEarned: number) => {
    const isNew = !progress.completedLessons.includes(lesson.id);
    setProgress(prev => ({
      ...prev,
      completedLessons: isNew ? [...prev.completedLessons, lesson.id] : prev.completedLessons,
      totalXp: isNew ? prev.totalXp + xpEarned : prev.totalXp,
      quizzesCompleted: isNew ? prev.quizzesCompleted + 1 : prev.quizzesCompleted,
      scores: { ...prev.scores, [lesson.id]: score },
    }));

    const res = await fetch(`/api/progress/lesson/${lesson.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, xpEarned }),
    }).catch(() => null);

    if (res?.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.newAchievements?.length) {
        setEarnedAchievements(data.newAchievements.map((a: { id: number; emoji: string; nameAr?: string; nameEn?: string; name?: string }) => ({
          id: a.id,
          emoji: a.emoji,
          name: a.name ?? (locale === 'ar' ? a.nameAr : a.nameEn) ?? '',
        })));
      }
    }

    setXpPopup(xpEarned);
    setTimeout(() => setXpPopup(null), 2500);
    setView('completed');
  };

  const handleRetry = () => {
    setQuizKey(prev => prev + 1);
    setView('quiz');
  };

  return (
    <main className="flex-1">
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
            <span>+{xpPopup} XP {locale === 'ar' ? 'كسبتها! 🎉' : 'earned! 🎉'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement celebration modal */}
      <AnimatePresence>
        {earnedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setEarnedAchievements([])}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 12 }}
              className="rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl"
              style={{ background: 'var(--surface)', border: '2px solid var(--zkawi-purple)' }}
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
                className="text-7xl mb-4"
              >
                {earnedAchievements[0].emoji}
              </motion.div>
              <div
                className="text-xs font-bold mb-2 px-3 py-1 rounded-full inline-block"
                style={{ background: 'var(--zkawi-purple)', color: '#fff' }}
              >
                🏆 {locale === 'ar' ? 'إنجاز جديد!' : 'New Achievement!'}
              </div>
              <h3 className="text-xl font-black mt-3" style={{ color: 'var(--text)' }}>
                {earnedAchievements[0].name}
              </h3>
              {earnedAchievements.length > 1 && (
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                  {locale === 'ar'
                    ? `+ ${earnedAchievements.length - 1} إنجازات أخرى`
                    : `+ ${earnedAchievements.length - 1} more achievement${earnedAchievements.length > 2 ? 's' : ''}`}
                </p>
              )}
              <button
                onClick={() => setEarnedAchievements([])}
                className="mt-6 w-full py-3 rounded-2xl font-bold text-sm"
                style={{ background: 'var(--zkawi-purple)', color: '#fff' }}
              >
                {locale === 'ar' ? 'رائع! 🎉' : 'Awesome! 🎉'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                {t('lesson')} {currentIndex + 1} {t('of')} {allLessonsCount}
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
              📖
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
                  {view === 'content' ? `📖 ${locale === 'ar' ? 'قراءة' : 'Reading'}` : view === 'quiz' ? `🎯 ${locale === 'ar' ? 'كويز' : 'Quiz'}` : `✅ ${locale === 'ar' ? 'مكتمل' : 'Complete'}`}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[var(--text)]">{lesson.title}</h1>
              <p className="text-[var(--text-muted)] text-sm mt-1">{lesson.description}</p>
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
                {v === 'content' ? `📖 ${locale === 'ar' ? 'الدرس' : 'Lesson'}` : `🎯 ${locale === 'ar' ? 'الكويز' : 'Quiz'}`}
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
                  style={{ direction: getDir(locale) }}
                  dangerouslySetInnerHTML={{
                    __html: markdownToHtml(lesson.content),
                  }}
                />
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-[var(--text-muted)]">
                  📖 {Math.round(scrollProgress)}% {locale === 'ar' ? 'اتقرأ' : 'read'}
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
                  key={quizKey}
                  questions={lesson.questions}
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
                  {locale === 'ar' ? 'أحسنت! الدرس اتكمل! ⭐' : 'Well done! Lesson completed! ⭐'}
                </h2>
                <p className="text-[var(--text-muted)] mb-6">
                  {locale === 'ar'
                    ? `كملت درس "${lesson.title}" وكسبت XP جديدة!`
                    : `You completed "${lesson.title}" and earned new XP!`}
                </p>

                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="bg-[var(--zkawi-purple)]/10 border border-[var(--zkawi-purple)]/30 rounded-2xl p-4 text-center">
                    <div className="flex items-center gap-1 justify-center text-[var(--zkawi-purple)] font-black text-xl">
                      <Zap size={18} fill="currentColor" />
                      +{progress.scores[lesson.id] >= 80 ? lesson.xpReward : Math.round(lesson.xpReward * (progress.scores[lesson.id] || 0) / 100)}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">{locale === 'ar' ? 'XP كسبتها' : 'XP earned'}</div>
                  </div>
                  {progress.scores[lesson.id] !== undefined && (
                    <div className="bg-[var(--zkawi-green)]/10 border border-[var(--zkawi-green)]/30 rounded-2xl p-4 text-center">
                      <div className="text-[var(--zkawi-green)] font-black text-xl">
                        {progress.scores[lesson.id]}%
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">{locale === 'ar' ? 'نتيجة الكويز' : 'Quiz score'}</div>
                    </div>
                  )}
                </div>

                {earnedAchievements.length > 0 && (
                  <div className="mb-6 p-4 rounded-2xl" style={{ background: 'var(--zkawi-purple)/10', border: '1px solid var(--zkawi-purple)/30' }}>
                    <p className="text-sm font-bold mb-3" style={{ color: 'var(--zkawi-purple)' }}>
                      🏆 {locale === 'ar' ? 'إنجازات مفتوحة!' : 'Achievements unlocked!'}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {earnedAchievements.map(a => (
                        <div key={a.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                          <span>{a.emoji}</span>
                          <span>{a.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => setView('content')} className="gap-2">
                    <BookOpen size={16} />
                    {locale === 'ar' ? 'راجع الدرس' : 'Review lesson'}
                  </Button>
                  {nextLessonId ? (
                    <Link href={`/agents/${agentSlug}/lessons/${nextLessonId}`}>
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
  );
}

// Simple markdown to HTML converter
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
