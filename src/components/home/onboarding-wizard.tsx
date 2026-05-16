'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { getDir } from '@/lib/i18n/locale-utils';
import {
  MessageCircle, Briefcase, Palette, Code2, GraduationCap,
  Clock, Zap, Coffee, Flame, ChevronRight, X,
} from 'lucide-react';

const GUEST_PREFS_KEY = 'zkawi_guest_prefs';
const ONBOARDED_KEY = 'zkawi_onboarded';

export interface GuestPrefs {
  goal: string;
  time: string;
}

type Goal = 'chat' | 'work' | 'creative' | 'developer' | 'educator';
type Time = '5' | '15' | '30' | '60';

interface Props {
  locale: string;
}

const GOAL_ICONS: Record<Goal, React.ReactNode> = {
  chat: <MessageCircle size={28} />,
  work: <Briefcase size={28} />,
  creative: <Palette size={28} />,
  developer: <Code2 size={28} />,
  educator: <GraduationCap size={28} />,
};

const TIME_ICONS: Record<Time, React.ReactNode> = {
  '5': <Zap size={24} />,
  '15': <Coffee size={24} />,
  '30': <Clock size={24} />,
  '60': <Flame size={24} />,
};

export default function OnboardingWizard({ locale }: Props) {
  const t = useTranslations('onboarding');
  const dir = getDir(locale);
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [time, setTime] = useState<Time | null>(null);

  useEffect(() => {
    try {
      const done = localStorage.getItem(ONBOARDED_KEY);
      if (!done) setShow(true);
    } catch { /* ignore SSR */ }
  }, []);

  const finish = (finalTime: Time) => {
    try {
      const prefs: GuestPrefs = { goal: goal ?? 'chat', time: finalTime };
      localStorage.setItem(GUEST_PREFS_KEY, JSON.stringify(prefs));
      localStorage.setItem(ONBOARDED_KEY, '1');
    } catch { /* ignore */ }
    setShow(false);
  };

  const skip = () => {
    try { localStorage.setItem(ONBOARDED_KEY, '1'); } catch { /* ignore */ }
    setShow(false);
  };

  if (!show) return null;

  const goals: Goal[] = ['chat', 'work', 'creative', 'developer', 'educator'];
  const times: Time[] = ['5', '15', '30', '60'];
  const timeKeys: Record<Time, string> = {
    '5': 'min5', '15': 'min15', '30': 'min30', '60': 'min60',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        dir={dir}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {/* Skip button */}
          <button
            onClick={skip}
            className="absolute top-4 end-4 p-2 rounded-xl opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
            aria-label={t('skip')}
          >
            <X size={18} />
          </button>

          {/* Progress dots */}
          <div className="flex gap-2 justify-center mb-6">
            {[0, 1].map(i => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 24 : 8,
                  height: 8,
                  background: i <= step ? 'var(--zkawi-purple)' : 'var(--border)',
                }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-goal"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                {/* Robot greeting */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'var(--zkawi-purple)' }}>
                    🤖
                  </div>
                  <div>
                    <h2 className="text-xl font-black" style={{ color: 'var(--text)' }}>
                      {t('guestWelcome')}
                    </h2>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {t('steps.goal.subtitle')}
                    </p>
                  </div>
                </div>

                <p className="font-bold text-base mb-4" style={{ color: 'var(--text)' }}>
                  {t('steps.goal.title')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {goals.map(g => (
                    <button
                      key={g}
                      onClick={() => { setGoal(g); setStep(1); }}
                      className="flex items-center gap-3 p-4 rounded-2xl border-2 text-start transition-all"
                      style={{
                        borderColor: goal === g ? 'var(--zkawi-purple)' : 'var(--border)',
                        background: goal === g ? 'var(--zkawi-purple)/10' : 'var(--bg)',
                        color: 'var(--text)',
                      }}
                    >
                      <span style={{ color: 'var(--zkawi-purple)' }}>{GOAL_ICONS[g]}</span>
                      <div>
                        <p className="font-bold text-sm">{t(`steps.goal.${g}`)}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {t(`steps.goal.${g}Desc`)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-time"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <p className="font-black text-xl mb-1" style={{ color: 'var(--text)' }}>
                  {t('steps.time.title')}
                </p>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                  {t('steps.time.subtitle')}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {times.map(tval => (
                    <button
                      key={tval}
                      onClick={() => { setTime(tval); finish(tval); }}
                      className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all"
                      style={{
                        borderColor: time === tval ? 'var(--zkawi-purple)' : 'var(--border)',
                        background: time === tval ? 'var(--zkawi-purple)/10' : 'var(--bg)',
                        color: time === tval ? 'var(--zkawi-purple)' : 'var(--text)',
                      }}
                    >
                      <span style={{ color: 'var(--zkawi-purple)' }}>{TIME_ICONS[tval]}</span>
                      <p className="font-black text-base">{t(`steps.time.${timeKeys[tval]}`)}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {t(`steps.time.${timeKeys[tval]}Desc`)}
                      </p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setStep(0)}
                  className="mt-4 text-sm flex items-center gap-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <ChevronRight size={14} className="flip-rtl rotate-180" />
                  {t('prev')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
