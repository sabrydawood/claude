'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft, BookOpen, Clock, Zap, CheckCircle2, Lock, Play,
  Construction, Trophy,
} from 'lucide-react';
import type { CourseRow, LessonRow, SubjectRow } from '@/lib/db/queries/content';

// Progress is stored in localStorage, same pattern as agent-page-client.tsx
interface UserProgress {
  completedLessons: string[];
  scores: Record<string, number>;
}

function getStoredProgress(): UserProgress {
  if (typeof window === 'undefined') return { completedLessons: [], scores: {} };
  try {
    const stored = localStorage.getItem('zkawi_progress');
    if (stored) {
      const p = JSON.parse(stored);
      return { completedLessons: p.completedLessons ?? [], scores: p.scores ?? {} };
    }
  } catch {
    // ignore parse errors
  }
  return { completedLessons: [], scores: {} };
}

const DIFFICULTY_COLORS: Record<number, string> = {
  1: 'var(--zkawi-green)',
  2: 'var(--zkawi-gold)',
  3: '#ef4444',
};

interface Props {
  course: CourseRow & { subject: SubjectRow };
  lessons: LessonRow[];
  locale: string;
}

export default function CoursePageClient({ course, lessons, locale: _locale }: Props) {
  const t = useTranslations('courses');
  const tL = useTranslations('lessons');
  const [progress, setProgress] = useState<UserProgress>({ completedLessons: [], scores: {} });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProgress(getStoredProgress());
  }, []);

  const completedCount = mounted ? progress.completedLessons.filter((id) => lessons.some((l) => l.id === id)).length : 0;
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;
  const difficultyKey = course.difficulty.toString() as '1' | '2' | '3';
  const difficultyColor = DIFFICULTY_COLORS[course.difficulty] ?? DIFFICULTY_COLORS[1];
  const subjectColor = course.subject.color;

  return (
    <main className="flex-1">
      {/* Hero */}
      <div
        className="py-12 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${subjectColor}20 0%, ${subjectColor}08 100%)`,
          borderBottom: `1px solid ${subjectColor}20`,
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 end-0 w-48 h-48 rounded-full opacity-10" style={{ background: subjectColor, transform: 'translate(4rem, -4rem)' }} />
          <div className="absolute bottom-0 start-0 w-32 h-32 rounded-full opacity-5" style={{ background: subjectColor, transform: 'translate(-2rem, 2rem)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/subjects/${course.subject.slug}`}>
            <div className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] mb-6 text-sm font-medium transition-colors">
              <ChevronLeft size={16} className="flip-rtl" />
              {t('back')}
            </div>
          </Link>

          <div className="flex items-start gap-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: subjectColor + '20', color: subjectColor }}
            >
              <DynamicIcon name={course.subject.icon} size={32} />
            </motion.div>

            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-1 text-sm font-bold"
                style={{ color: subjectColor }}
              >
                {course.subject.name}
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="text-2xl md:text-3xl font-black text-[var(--text)] mb-2 leading-tight"
              >
                {course.name}
              </motion.h1>
              {course.description && (
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-[var(--text-muted)] max-w-xl leading-relaxed text-sm mb-3"
                >
                  {course.description}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-2"
              >
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: difficultyColor + '18', color: difficultyColor, border: `1px solid ${difficultyColor}30` }}
                >
                  {t(`difficulty.${difficultyKey}`)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                  <Clock size={12} />
                  {course.estimatedHours} {t('hours')}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                  <BookOpen size={12} />
                  {lessons.length} {t('lessons')}
                </span>
              </motion.div>
            </div>
          </div>

          {/* Progress bar */}
          {mounted && completedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 bg-[var(--surface)]/50 backdrop-blur-sm rounded-2xl p-4 border border-[var(--border)]"
            >
              <div className="flex justify-between text-sm font-bold mb-2 text-[var(--text)]">
                <span>{completedCount} / {lessons.length} {tL('tabLesson')}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full"
                  style={{ background: subjectColor }}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Lessons list */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2 text-xl font-black text-[var(--text)]">
            <BookOpen size={20} className="text-[var(--zkawi-purple)]" />
            {tL('tabLesson')}
          </h2>
          {mounted && completedCount === lessons.length && lessons.length > 0 && (
            <Badge variant="achievement">
              <Trophy size={12} />
              {tL('completed')}
            </Badge>
          )}
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-16">
            <Construction size={52} className="mx-auto mb-4 text-[var(--text-muted)]" />
            <p className="text-[var(--text-muted)]">{t('empty')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, i) => {
              const isCompleted = mounted && progress.completedLessons.includes(lesson.id);
              const isLocked = false;
              const score = mounted ? progress.scores[lesson.id] : undefined;

              const card = (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={!isLocked ? { y: -3, scale: 1.01 } : {}}
                  className={`relative bg-[var(--surface)] rounded-3xl border-2 p-5 transition-all ${
                    isCompleted
                      ? 'border-[var(--zkawi-green)]/40 bg-[var(--zkawi-green)]/5'
                      : isLocked
                      ? 'border-[var(--border)] opacity-60 cursor-not-allowed'
                      : 'border-[var(--zkawi-purple)]/25 hover:border-[var(--zkawi-purple)] hover:shadow-lg hover:shadow-[var(--zkawi-purple)]/10 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                        isCompleted
                          ? 'bg-[var(--zkawi-green)]/15 text-[var(--zkawi-green)]'
                          : isLocked
                          ? 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                          : 'bg-[var(--zkawi-purple)]/15 text-[var(--zkawi-purple)]'
                      }`}>
                        {isLocked ? <Lock size={20} /> : <BookOpen size={20} />}
                      </div>
                      <span className="text-xs font-bold text-[var(--text-muted)]">#{i + 1}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-black text-base leading-tight ${isLocked ? 'text-[var(--text-muted)]' : 'text-[var(--text)]'}`}>
                          {lesson.title}
                        </h3>
                        {isCompleted && score !== undefined && (
                          <Badge variant="success" className="flex-shrink-0 text-xs">{score}%</Badge>
                        )}
                      </div>
                      <p className={`text-sm mb-3 line-clamp-2 ${isLocked ? 'text-[var(--border)]' : 'text-[var(--text-muted)]'}`}>
                        {lesson.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                          <Clock size={12} />
                          <span>{lesson.estimatedMinutes} {tL('minutes')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap size={12} className="text-[var(--zkawi-purple)]" fill="currentColor" />
                          <span className="text-xs font-bold text-[var(--zkawi-purple)]">+{lesson.xpReward} XP</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 size={22} className="text-[var(--zkawi-green)]" />
                      ) : isLocked ? (
                        <Lock size={18} className="text-[var(--text-muted)]" />
                      ) : (
                        <div className="w-9 h-9 bg-[var(--zkawi-purple)] rounded-xl flex items-center justify-center shadow-md shadow-[var(--zkawi-purple)]/20">
                          <Play size={14} className="text-white fill-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {isCompleted && (
                    <div className="absolute -top-2 -end-2">
                      <div className="w-6 h-6 bg-[var(--zkawi-green)] rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              );

              if (isLocked || !lesson.agentSlug) return <div key={lesson.id}>{card}</div>;

              return (
                <Link key={lesson.id} href={`/agents/${lesson.agentSlug}/lessons/${lesson.id}`}>
                  {card}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
