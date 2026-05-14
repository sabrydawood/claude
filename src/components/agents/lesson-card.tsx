'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock, Clock, Zap, ChevronRight, Play } from 'lucide-react';
import type { Lesson } from '@/lib/content/claude-lessons';

interface LessonCardProps {
  lesson: Lesson;
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
      className={`relative bg-white rounded-3xl border-2 p-5 transition-all ${
        isCompleted
          ? 'border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50'
          : isLocked
          ? 'border-gray-200 opacity-60 cursor-not-allowed'
          : 'border-purple-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-100 cursor-pointer'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Lesson number & emoji */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
            isCompleted
              ? 'bg-emerald-100'
              : isLocked
              ? 'bg-gray-100'
              : 'bg-purple-100'
          }`}>
            {isLocked ? '🔒' : lesson.emoji}
          </div>
          <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-black text-base leading-tight ${
              isLocked ? 'text-gray-400' : 'text-gray-800'
            }`}>
              {locale === 'ar' ? lesson.titleAr : lesson.titleEn}
            </h3>
            {isCompleted && score !== undefined && (
              <Badge variant="success" className="flex-shrink-0 text-xs">
                {score}%
              </Badge>
            )}
          </div>

          <p className={`text-sm mb-3 line-clamp-2 ${
            isLocked ? 'text-gray-300' : 'text-gray-500'
          }`}>
            {locale === 'ar' ? lesson.descriptionAr : lesson.descriptionEn}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} />
              <span>{lesson.estimatedMinutes} {locale === 'ar' ? 'دقيقة' : 'min'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={12} className="text-purple-500" fill="currentColor" />
              <span className="text-xs font-bold text-purple-600">+{lesson.xpReward} XP</span>
            </div>
            <div className="text-xs text-gray-400">
              {lesson.quiz.length} {locale === 'ar' ? 'أسئلة' : 'questions'}
            </div>
          </div>
        </div>

        {/* Status icon */}
        <div className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle2 size={22} className="text-emerald-500" />
          ) : isLocked ? (
            <Lock size={18} className="text-gray-400" />
          ) : (
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-200">
              <Play size={14} className="text-white fill-white" />
            </div>
          )}
        </div>
      </div>

      {/* Completed badge */}
      {isCompleted && (
        <div className="absolute -top-2 -end-2">
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
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
