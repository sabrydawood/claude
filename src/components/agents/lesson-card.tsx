'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock, Clock, Zap, Play } from 'lucide-react';
import type { LessonRow } from '@/lib/db/queries/content';

interface LessonCardProps {
  lesson: LessonRow;
  index: number;
  isCompleted: boolean;
  isLocked: boolean;
  score?: number;
}

export default function LessonCard({ lesson, index, isCompleted, isLocked, score }: LessonCardProps) {
  const locale = useLocale();

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
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
        {/* Lesson number & emoji */}
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
          <span className="text-xs font-bold text-[var(--text-muted)]">#{index + 1}</span>
        </div>

        {/* Content */}
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
            <div className="text-xs text-[var(--text-muted)]">
              {locale === 'ar' ? 'أسئلة' : 'questions'}
            </div>
          </div>
        </div>

        {/* Status icon */}
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

      {/* Completed badge */}
      {isCompleted && (
        <div className="absolute -top-2 -end-2">
          <div className="w-6 h-6 bg-[var(--zkawi-green)] rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-xs">✓</span>
          </div>
        </div>
      )}
    </motion.div>
  );

  if (isLocked) return card;

  return (
    <Link href={`/agents/claude/lessons/${lesson.id}`}>
      {card}
    </Link>
  );
}
