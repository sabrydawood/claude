'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, Trophy, RotateCcw, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import type { QuizQuestion } from '@/lib/content/claude-lessons';
import confetti from './confetti-util';

interface QuizProps {
  questions: QuizQuestion[];
  xpReward: number;
  onComplete: (score: number, xpEarned: number) => void;
  onRetry: () => void;
}

type QuizState = 'answering' | 'feedback' | 'results';

export default function QuizComponent({ questions, xpReward, onComplete, onRetry }: QuizProps) {
  const t = useTranslations('quiz');
  const locale = useLocale();

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

    const option = currentQuestion.options.find(o => o.id === optionId);
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
      // Quiz done
      const correctCount = answers.filter(Boolean).length + (answers.length < questions.length ? 0 : 0);
      const finalAnswers = [...answers];
      const finalCorrect = finalAnswers.filter(Boolean).length;
      const score = Math.round((finalCorrect / questions.length) * 100);
      const earned = Math.round((finalCorrect / questions.length) * xpReward);
      setXpEarned(earned);
      setQuizState('results');

      if (score >= 80) {
        setTimeout(() => confetti(), 300);
      }

      onComplete(score, earned);
    }
  };

  const correctCount = answers.filter(Boolean).length;
  const totalAnswered = answers.length;
  const finalScore = totalAnswered > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

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

        <h2 className="text-2xl font-black text-gray-800 mb-2">
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
            <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
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
            <span className="text-2xl font-black text-gray-800">{finalScore}%</span>
            <span className="text-xs text-gray-500">{t('results.score')}</span>
          </div>
        </motion.div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="text-sm text-gray-600">
            {correctCount} / {questions.length} {locale === 'ar' ? 'إجابات صح' : 'correct answers'}
          </div>
        </div>

        {/* XP earned */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 rounded-2xl px-5 py-3 mb-6"
        >
          <Zap size={18} className="text-purple-600" fill="currentColor" />
          <span className="font-black text-purple-700 text-lg">
            +{xpEarned} XP
          </span>
          <span className="text-purple-500 text-sm">{t('results.xpEarned')}</span>
        </motion.div>

        <div className="flex gap-3 justify-center">
          {finalScore < 70 && (
            <Button variant="outline" onClick={onRetry} className="gap-2">
              <RotateCcw size={16} />
              {t('results.tryAgainButton')}
            </Button>
          )}
          <Button onClick={() => {}} className="gap-2">
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
        <h2 className="text-xl font-black text-gray-800 mb-1">{t('title')}</h2>
        <p className="text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-gray-500">
          <span>{t('question')} {currentIndex + 1} {t('of')} {questions.length}</span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < answers.length
                    ? answers[i] ? 'bg-emerald-400' : 'bg-red-400'
                    : i === currentIndex
                    ? 'bg-purple-400'
                    : 'bg-gray-200'
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
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-100 mb-4">
            <p className="font-black text-gray-800 text-lg leading-relaxed">
              {locale === 'ar' ? currentQuestion.questionAr : currentQuestion.questionEn}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOption === option.id;
              const isCorrect = option.isCorrect;
              const showFeedback = quizState === 'feedback';

              let optionStyle = 'bg-white border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50';

              if (showFeedback) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-50 border-2 border-emerald-400';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'bg-red-50 border-2 border-red-400';
                } else {
                  optionStyle = 'bg-white border-2 border-gray-200 opacity-60';
                }
              } else if (isSelected) {
                optionStyle = 'bg-purple-100 border-2 border-purple-500';
              }

              return (
                <motion.button
                  key={option.id}
                  whileHover={!selectedOption ? { scale: 1.01 } : {}}
                  whileTap={!selectedOption ? { scale: 0.99 } : {}}
                  onClick={() => checkAnswer(option.id)}
                  disabled={!!selectedOption}
                  className={`w-full text-start px-5 py-4 rounded-2xl transition-all duration-200 ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                      showFeedback && isCorrect
                        ? 'bg-emerald-500 text-white'
                        : showFeedback && isSelected && !isCorrect
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {showFeedback ? (
                        isCorrect ? <CheckCircle2 size={16} /> : isSelected ? <XCircle size={16} /> : option.id.slice(-1).toUpperCase()
                      ) : (
                        option.id.slice(-1).toUpperCase()
                      )}
                    </div>
                    <span className={`font-semibold ${
                      showFeedback && isCorrect ? 'text-emerald-700' :
                      showFeedback && isSelected && !isCorrect ? 'text-red-700' :
                      'text-gray-700'
                    }`}>
                      {locale === 'ar' ? option.textAr : option.textEn}
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
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                    <div className="text-2xl">🎉</div>
                    <div>
                      <p className="font-black text-emerald-700">{t('correct')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <p className="font-bold text-red-600 mb-1">
                      {t('incorrect')} 😕
                    </p>
                    <p className="text-sm text-red-500">
                      {t('correctAnswer')}: {locale === 'ar'
                        ? currentQuestion.options.find(o => o.isCorrect)?.textAr
                        : currentQuestion.options.find(o => o.isCorrect)?.textEn}
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
