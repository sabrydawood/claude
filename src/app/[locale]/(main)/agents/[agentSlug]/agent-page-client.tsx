'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, BookOpen, Trophy, Clock, Zap, CheckCircle2, Lock, Play } from 'lucide-react';
import type { AgentRow, LessonRow } from '@/lib/db/queries/content';

// Gradient mapping by slug (non-translatable visual config)
const AGENT_GRADIENTS: Record<string, string> = {
  claude: 'from-purple-500 to-purple-700',
  chatgpt: 'from-green-500 to-green-700',
  gemini: 'from-blue-500 to-blue-700',
};

interface UserProgress {
  completedLessons: string[];
  totalXp: number;
  scores: Record<string, number>;
}

function getStoredProgress(): UserProgress {
  if (typeof window === 'undefined') return { completedLessons: [], totalXp: 0, scores: {} };
  try {
    const stored = localStorage.getItem('zkawi_progress');
    if (stored) {
      const p = JSON.parse(stored);
      return { completedLessons: p.completedLessons || [], totalXp: p.totalXp || 0, scores: p.scores || {} };
    }
  } catch {}
  return { completedLessons: [], totalXp: 0, scores: {} };
}

interface Props {
  agent: AgentRow;
  lessons: LessonRow[];
  locale: string;
  agentSlug: string;
}

export default function AgentPageClient({ agent, lessons, locale, agentSlug }: Props) {
  const t = useTranslations('agents');
  const [progress, setProgress] = useState<UserProgress>({ completedLessons: [], totalXp: 0, scores: {} });
  const [mounted, setMounted] = useState(false);

  const gradient = AGENT_GRADIENTS[agent.slug] ?? 'from-gray-500 to-gray-700';

  useEffect(() => {
    setMounted(true);
    setProgress(getStoredProgress());
  }, []);

  const completedCount = progress.completedLessons.length;
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  return (
    <main className="flex-1">
      {/* Hero */}
      <div className={`bg-gradient-to-br ${gradient} text-white py-12 relative overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 end-0 w-48 h-48 bg-white/10 rounded-full translate-x-16 -translate-y-16" />
          <div className="absolute bottom-0 start-0 w-32 h-32 bg-black/10 rounded-full -translate-x-8 translate-y-8" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard">
            <div className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 text-sm font-medium transition-colors">
              <ChevronLeft size={16} className="flip-rtl" />
              {t('backToAgents')}
            </div>
          </Link>

          <div className="flex items-start gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl shadow-lg flex-shrink-0"
            >
              {agent.emoji}
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl md:text-4xl font-black mb-2"
              >
                {agent.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-white/80 max-w-xl leading-relaxed"
              >
                {agent.fullDescription}
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-4 mt-4"
              >
                <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 text-sm font-bold">
                  <BookOpen size={14} />
                  {lessons.length} {t('claude.lessons')}
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 text-sm font-bold">
                  <Clock size={14} />
                  {lessons.reduce((a, l) => a + l.estimatedMinutes, 0)} {locale === 'ar' ? 'دقيقة' : 'min'}
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 text-sm font-bold">
                  <Zap size={14} fill="currentColor" />
                  {lessons.reduce((a, l) => a + l.xpReward, 0)} XP
                </div>
              </motion.div>
            </div>
          </div>

          {/* Progress bar */}
          {mounted && completedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 bg-white/10 rounded-2xl p-4"
            >
              <div className="flex justify-between text-sm font-bold mb-2">
                <span>{completedCount} / {lessons.length} {locale === 'ar' ? 'دروس' : 'lessons'}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Lessons list */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-[var(--text)]">
            📚 {locale === 'ar' ? 'الدروس' : 'Lessons'}
          </h2>
          {mounted && completedCount === lessons.length && lessons.length > 0 && (
            <Badge variant="achievement">
              <Trophy size={12} />
              {locale === 'ar' ? 'مكتمل! 🎉' : 'Completed! 🎉'}
            </Badge>
          )}
        </div>

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
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                      isCompleted
                        ? 'bg-[var(--zkawi-green)]/15'
                        : isLocked
                        ? 'bg-[var(--surface-2)]'
                        : 'bg-[var(--zkawi-purple)]/15'
                    }`}>
                      {isLocked ? '🔒' : '📖'}
                    </div>
                    <span className="text-xs font-bold text-[var(--text-muted)]">#{i + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-black text-base leading-tight ${
                        isLocked ? 'text-[var(--text-muted)]' : 'text-[var(--text)]'
                      }`}>
                        {lesson.title}
                      </h3>
                      {isCompleted && score !== undefined && (
                        <Badge variant="success" className="flex-shrink-0 text-xs">
                          {score}%
                        </Badge>
                      )}
                    </div>

                    <p className={`text-sm mb-3 line-clamp-2 ${
                      isLocked ? 'text-[var(--border)]' : 'text-[var(--text-muted)]'
                    }`}>
                      {lesson.description}
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Clock size={12} />
                        <span>{lesson.estimatedMinutes} {locale === 'ar' ? 'دقيقة' : 'min'}</span>
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

            if (isLocked) return <div key={lesson.id}>{card}</div>;

            return (
              <Link key={lesson.id} href={`/agents/${agentSlug}/lessons/${lesson.id}`}>
                {card}
              </Link>
            );
          })}
        </div>

        {lessons.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🚧</div>
            <p className="text-[var(--text-muted)]">{locale === 'ar' ? 'الدروس قادمة قريباً!' : 'Lessons coming soon!'}</p>
          </div>
        )}
      </div>
    </main>
  );
}
