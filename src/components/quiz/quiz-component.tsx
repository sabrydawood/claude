'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, RotateCcw, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import type { QuizQuestionRow } from '@/lib/db/queries/content';
import confetti from './confetti-util';

interface QuizProps {
  questions: QuizQuestionRow[];
  xpReward: number;
  onComplete: (score: number, xpEarned: number) => void;
  onRetry: () => void;
}

type QuizState = 'answering' | 'feedback' | 'results';

export default function QuizComponent({ questions, xpReward, onComplete, onRetry }: QuizProps) {
  const t = useTranslations('quiz');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [quizState, setQuizState] = useState<QuizState>('answering');
  const [xpEarned, setXpEarned] = useState(0);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const checkAnswer = (optionId: string) => {
    if (selectedOption) return;
    setSelectedOption(optionId);
    const option = currentQuestion.options.find(o => String(o.id) === optionId);
    const isCorrect = option?.isCorrect || false;
    setAnswers(prev => [...prev, isCorrect]);
    setQuizState('feedback');
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setQuizState('answering');
    } else {
      const finalAnswers = [...answers];
      const finalCorrect = finalAnswers.filter(Boolean).length;
      const score = Math.round((finalCorrect / questions.length) * 100);
      const earned = Math.round((finalCorrect / questions.length) * xpReward);
      setXpEarned(earned);
      setQuizState('results');
      if (score >= 80) setTimeout(() => confetti(), 300);
    }
  };

  const correctCount = answers.filter(Boolean).length;
  const finalScore = answers.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  if (quizState === 'results') {
    const isPerfect = finalScore === 100;
    const isGreat = finalScore >= 80;
    const isGood = finalScore >= 60;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-7xl mb-4"
        >
          {isPerfect ? '🌟' : isGreat ? '🎉' : isGood ? '👍' : '💪'}
        </motion.div>

        <h2 className="text-2xl font-black text-[var(--text)] mb-2">
          {isPerfect ? t('results.perfect') : isGreat ? t('results.great') : isGood ? t('results.good') : t('results.tryAgain')}
        </h2>

        {/* Score circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="relative w-32 h-32 mx-auto my-6"
        >
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={isPerfect ? '#F59E0B' : isGreat ? '#10B981' : isGood ? '#7C3AED' : '#EF4444'}
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - finalScore / 100)}`}
              strokeLinecap="round"
              className="progress-ring"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-[var(--text)]">{finalScore}%</span>
            <span className="text-xs text-[var(--text-muted)]">{t('results.score')}</span>
          </div>
        </motion.div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="text-sm text-[var(--text-muted)]">
            {correctCount} / {questions.length} {t('correctAnswers')}
          </div>
        </div>

        {/* XP earned */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-2 bg-[var(--zkawi-purple)]/10 border border-[var(--zkawi-purple)]/30 rounded-2xl px-5 py-3 mb-6"
        >
          <Zap size={18} className="text-[var(--zkawi-purple)]" fill="currentColor" />
          <span className="font-black text-[var(--zkawi-purple)] text-lg">
            +{xpEarned} XP
          </span>
          <span className="text-[var(--text-muted)] text-sm">{t('results.xpEarned')}</span>
        </motion.div>

        <div className="flex gap-3 justify-center">
          {finalScore < 70 && (
            <Button variant="outline" onClick={onRetry} className="gap-2">
              <RotateCcw size={16} />
              {t('results.tryAgainButton')}
            </Button>
          )}
          <Button onClick={() => onComplete(finalScore, xpEarned)} className="gap-2">
            {t('results.continueButton')}
            <ChevronRight size={16} className="flip-rtl" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-black text-[var(--text)] mb-1">{t('title')}</h2>
        <p className="text-sm text-[var(--text-muted)]">{t('subtitle')}</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-[var(--text-muted)]">
          <span>{t('question')} {currentIndex + 1} {t('of')} {questions.length}</span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < answers.length
                    ? answers[i] ? 'bg-[var(--zkawi-green)]' : 'bg-[var(--zkawi-red)]'
                    : i === currentIndex
                    ? 'bg-[var(--zkawi-purple)]'
                    : 'bg-[var(--border)]'
                }`}
              />
            ))}
          </div>
        </div>
        <Progress value={progress} colorScheme="purple" className="h-2" />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 border border-[var(--zkawi-purple)]/20 mb-4">
            <p className="font-black text-[var(--text)] text-lg leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOption === String(option.id);
              const isCorrect = option.isCorrect;
              const showFeedback = quizState === 'feedback';

              let optionStyle = 'bg-[var(--surface)] border-2 border-[var(--border)] hover:border-[var(--zkawi-purple)] hover:bg-[var(--bg-secondary)]';

              if (showFeedback) {
                if (isCorrect) {
                  optionStyle = 'bg-[var(--zkawi-green)]/10 border-2 border-[var(--zkawi-green)]/50';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'bg-[var(--zkawi-red)]/10 border-2 border-[var(--zkawi-red)]/50';
                } else {
                  optionStyle = 'bg-[var(--surface)] border-2 border-[var(--border)] opacity-60';
                }
              } else if (isSelected) {
                optionStyle = 'bg-[var(--zkawi-purple)]/10 border-2 border-[var(--zkawi-purple)]';
              }

              return (
                <motion.button
                  key={option.id}
                  whileHover={!selectedOption ? { scale: 1.01 } : {}}
                  whileTap={!selectedOption ? { scale: 0.99 } : {}}
                  onClick={() => checkAnswer(String(option.id))}
                  disabled={!!selectedOption}
                  className={`w-full text-start px-5 py-4 rounded-2xl transition-all duration-200 ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                      showFeedback && isCorrect
                        ? 'bg-[var(--zkawi-green)] text-white'
                        : showFeedback && isSelected && !isCorrect
                        ? 'bg-[var(--zkawi-red)] text-white'
                        : isSelected
                        ? 'bg-[var(--zkawi-purple)] text-white'
                        : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                    }`}>
                      {showFeedback ? (
                        isCorrect ? <CheckCircle2 size={16} /> : isSelected ? <XCircle size={16} /> : String(option.order + 1)
                      ) : (
                        String(option.order + 1)
                      )}
                    </div>
                    <span className={`font-semibold ${
                      showFeedback && isCorrect ? 'text-[var(--zkawi-green)]' :
                      showFeedback && isSelected && !isCorrect ? 'text-[var(--zkawi-red)]' :
                      'text-[var(--text)]'
                    }`}>
                      {option.text}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Feedback message */}
          <AnimatePresence>
            {quizState === 'feedback' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                {answers[answers.length - 1] ? (
                  <div className="bg-[var(--zkawi-green)]/10 border border-[var(--zkawi-green)]/30 rounded-2xl p-4 flex items-center gap-3">
                    <div className="text-2xl">🎉</div>
                    <div>
                      <p className="font-black text-[var(--zkawi-green)]">{t('correct')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[var(--zkawi-red)]/10 border border-[var(--zkawi-red)]/30 rounded-2xl p-4">
                    <p className="font-bold text-[var(--zkawi-red)] mb-1">
                      {t('incorrect')} 😕
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {t('correctAnswer')}: {currentQuestion.options.find(o => o.isCorrect)?.text}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleNext}
                  className="w-full mt-3 gap-2"
                >
                  {currentIndex < questions.length - 1 ? t('next') : t('finish')}
                  <ChevronRight size={16} className="flip-rtl" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
