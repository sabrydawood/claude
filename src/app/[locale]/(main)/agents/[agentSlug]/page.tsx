'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { motion } from 'framer-motion';
import { notFound } from 'next/navigation';
import { use } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import LessonCard from '@/components/agents/lesson-card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAgentBySlug, getLessonsByAgent } from '@/lib/content/claude-lessons';
import { ChevronLeft, BookOpen, Trophy, Clock, Zap } from 'lucide-react';

interface UserProgress {
  completedLessons: number[];
  totalXp: number;
  scores: Record<number, number>;
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

export default function AgentPage({ params }: { params: Promise<{ agentSlug: string }> }) {
  const { agentSlug } = use(params);
  const t = useTranslations('agents');
  const locale = useLocale();
  const [progress, setProgress] = useState<UserProgress>({ completedLessons: [], totalXp: 0, scores: {} });
  const [mounted, setMounted] = useState(false);

  const agent = getAgentBySlug(agentSlug);
  const lessons = getLessonsByAgent(agentSlug);

  useEffect(() => {
    setMounted(true);
    setProgress(getStoredProgress());
  }, []);

  if (!agent) notFound();

  const completedCount = progress.completedLessons.length;
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className={`bg-gradient-to-br ${agent.gradient} text-white py-12 relative overflow-hidden`}>
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
                  {locale === 'ar' ? agent.nameAr : agent.nameEn}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/80 max-w-xl leading-relaxed"
                >
                  {locale === 'ar' ? agent.fullDescriptionAr : agent.fullDescriptionEn}
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
            {lessons.map((lesson, i) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                index={i}
                isCompleted={mounted && progress.completedLessons.includes(lesson.id)}
                isLocked={false}
                score={mounted ? progress.scores[lesson.id] : undefined}
              />
            ))}
          </div>

          {lessons.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🚧</div>
              <p className="text-[var(--text-muted)]">{locale === 'ar' ? 'الدروس قادمة قريباً!' : 'Lessons coming soon!'}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
