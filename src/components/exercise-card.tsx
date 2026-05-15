'use client';

/**
 * exercise-card.tsx
 * Wraps CodePlayground with exercise metadata, XP reward display, and submission logic.
 * On pass: shows XP celebration and calls onComplete. Submits code to the API.
 */

import { useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDir } from '@/lib/i18n/locale-utils';
import CodePlayground from '@/components/ui/code-playground';

export interface ExerciseCardProps {
  title: string;
  instructions: string;
  hint?: string;
  starterCode: string;
  solutionCode: string;
  language: 'javascript' | 'python';
  expectedOutput: string;
  xpReward: number;
  exerciseId: string;
  lessonId?: string;
  onComplete?: (exerciseId: string) => void;
}

type SubmitState = 'idle' | 'submitting' | 'done' | 'error';

export default function ExerciseCard({
  title,
  instructions,
  hint,
  starterCode,
  language,
  expectedOutput,
  xpReward,
  exerciseId,
  onComplete,
}: ExerciseCardProps) {
  const t = useTranslations('playground');
  const locale = useLocale();
  const dir = getDir(locale);

  const [passed, setPassed] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const handlePass = useCallback(async (submittedCode: string) => {
    if (passed) return; // avoid duplicate submissions
    setPassed(true);

    setSubmitState('submitting');
    try {
      const res = await fetch(`/api/v1/exercises/${exerciseId}/submit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: submittedCode, passed: true, score: 100 }),
      });
      if (!res.ok) throw new Error('submit-failed');
      setSubmitState('done');
      onComplete?.(exerciseId);
    } catch {
      setSubmitState('error');
    }
  }, [passed, exerciseId, onComplete]);

  return (
    <div
      dir={dir}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--border)]">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-[var(--fg)] leading-snug">{title}</h3>
          <p className="mt-1 text-sm text-[var(--fg-muted)] leading-relaxed">{instructions}</p>
        </div>

        {/* XP badge */}
        <div className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
          <Zap className="w-3.5 h-3.5" />
          <span className="text-sm font-bold">+{xpReward}</span>
          <span className="text-xs">{t('xpReward')}</span>
        </div>
      </div>

      {/* Playground */}
      <div className="p-4">
        <CodePlayground
          starterCode={starterCode}
          language={language}
          expectedOutput={expectedOutput}
          hint={hint}
          onPass={handlePass}
        />
      </div>

      {/* Celebration overlay */}
      <AnimatePresence>
        {passed && (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="mx-4 mb-4 rounded-xl bg-[var(--zkawi-green)]/10 border border-[var(--zkawi-green)]/30 px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[var(--zkawi-green)]" />
              <span className="text-sm font-bold text-[var(--zkawi-green)]">
                {t('exercisePass')}
              </span>
            </div>

            <div
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold',
                submitState === 'submitting'
                  ? 'bg-[var(--surface)] text-[var(--fg-muted)]'
                  : submitState === 'error'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
              )}
            >
              {submitState === 'submitting' ? (
                <>
                  <span className="inline-block w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  <span>{t('submitting')}</span>
                </>
              ) : submitState === 'error' ? (
                <span>{t('submitError')}</span>
              ) : (
                <>
                  <Zap className="w-3 h-3" />
                  <span>+{xpReward} XP</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
