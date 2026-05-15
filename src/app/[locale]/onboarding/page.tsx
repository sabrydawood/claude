'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { useSession } from '@/lib/auth-client';
import { OnboardingService } from '@/lib/api/services/onboarding.service';
import {
  ChevronRight, ChevronLeft, Zap, UserRound, Gamepad2, Briefcase, Calendar,
  MessageCircle, Palette, Code2, GraduationCap, Target, Sprout, Leaf, TreePine,
  Brain, Eye, BookOpen, FlaskConical, Sparkles, Coffee, Flame,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type AgeGroup = 'child' | 'teen' | 'adult';
type Goal = 'chat' | 'work' | 'creative' | 'developer' | 'educator';
type Experience = 'none' | 'some' | 'advanced';
type LearningStyle = 'visual' | 'reading' | 'practice' | 'game';
type DailyMinutes = 5 | 15 | 30 | 60;

interface OnboardingAnswers {
  ageGroup: AgeGroup | null;
  goal: Goal | null;
  experience: Experience | null;
  learningStyle: LearningStyle | null;
  dailyMinutes: DailyMinutes | null;
}

// ─── Step option component ────────────────────────────────────────────────────

function OptionCard({
  icon,
  title,
  desc,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`wizard-option rounded-2xl p-4 text-start w-full transition-all ${selected ? 'selected' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? 'bg-[var(--zkawi-purple)]/15 text-[var(--zkawi-purple)]' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>{icon}</span>
        <div className="flex-1 min-w-0">
          <div className={`font-black text-sm ${selected ? 'text-[var(--zkawi-purple)]' : 'text-[var(--text)]'}`}>
            {title}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</div>
        </div>
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-[var(--zkawi-purple)] flex items-center justify-center flex-shrink-0"
          >
            <span className="text-white text-xs">✓</span>
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}

// ─── Steps definition ─────────────────────────────────────────────────────────

const TOTAL_STEPS = 5;

// ─── Main wizard component ────────────────────────────────────────────────────

export default function OnboardingPage() {
  const t = useTranslations('onboarding');
  const locale = useLocale();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    ageGroup: null,
    goal: null,
    experience: null,
    learningStyle: null,
    dailyMinutes: null,
  });
  const [saving, setSaving] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return answers.ageGroup !== null;
      case 1: return answers.goal !== null;
      case 2: return answers.experience !== null;
      case 3: return answers.learningStyle !== null;
      case 4: return answers.dailyMinutes !== null;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(prev => prev + 1);
    } else {
      // Final step — save and redirect
      await handleFinish();
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await OnboardingService.submit({
        AgeGroup:      answers.ageGroup!,
        Goal:          answers.goal!,
        Experience:    answers.experience!,
        LearningStyle: answers.learningStyle!,
        DailyMinutes:  answers.dailyMinutes!,
      });
      router.push('/dashboard');
    } catch {
      setSaving(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Zap size={48} className="animate-bounce text-[var(--zkawi-purple)]" />
      </div>
    );
  }

  const steps = [
    // Step 0: Age
    <StepAge
      key="age"
      answers={answers}
      setAnswers={setAnswers}
      t={t}
    />,
    // Step 1: Goal
    <StepGoal
      key="goal"
      answers={answers}
      setAnswers={setAnswers}
      t={t}
    />,
    // Step 2: Experience
    <StepExperience
      key="experience"
      answers={answers}
      setAnswers={setAnswers}
      t={t}
    />,
    // Step 3: Learning style
    <StepStyle
      key="style"
      answers={answers}
      setAnswers={setAnswers}
      t={t}
    />,
    // Step 4: Daily time
    <StepTime
      key="time"
      answers={answers}
      setAnswers={setAnswers}
      t={t}
    />,
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <Logo size={36} showText textClassName="text-lg" />
        <div className="text-sm font-bold text-[var(--text-muted)]">
          {t('step')} {step + 1} {t('of')} {TOTAL_STEPS}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[var(--border)]">
        <motion.div
          className="h-full bg-gradient-to-r from-[var(--zkawi-purple)] to-[var(--zkawi-purple-light)] rounded-full"
          animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: locale === 'ar' ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: locale === 'ar' ? 30 : -30 }}
              transition={{ duration: 0.3 }}
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={() => setStep(prev => prev - 1)}
              disabled={step === 0}
              className="gap-2"
            >
              <ChevronLeft size={16} className="flip-rtl" />
              {t('prev')}
            </Button>

            <div className="flex gap-1.5">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step
                      ? 'w-6 bg-[var(--zkawi-purple)]'
                      : i < step
                      ? 'w-2 bg-[var(--zkawi-purple)]/50'
                      : 'w-2 bg-[var(--border)]'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || saving}
              loading={saving}
              className="gap-2"
            >
              {step === TOTAL_STEPS - 1 ? t('finish') : t('next')}
              <ChevronRight size={16} className="flip-rtl" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step components ──────────────────────────────────────────────────────────

type StepProps = {
  answers: OnboardingAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<OnboardingAnswers>>;
  t: ReturnType<typeof useTranslations<'onboarding'>>;
};

function StepHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-3 text-[var(--zkawi-purple)]">{icon}</div>
      <h2 className="text-2xl font-black text-[var(--text)] mb-2">{title}</h2>
      <p className="text-[var(--text-muted)]">{subtitle}</p>
    </div>
  );
}

function StepAge({ answers, setAnswers, t }: StepProps) {
  const st = t.raw('steps.age') as Record<string, string>;
  const options: { value: AgeGroup; icon: React.ReactNode; title: string; desc: string }[] = [
    { value: 'child', icon: <UserRound size={20} />, title: st.child, desc: st.childDesc },
    { value: 'teen',  icon: <Gamepad2 size={20} />,  title: st.teen,  desc: st.teenDesc },
    { value: 'adult', icon: <Briefcase size={20} />, title: st.adult, desc: st.adultDesc },
  ];

  return (
    <div>
      <StepHeader icon={<Calendar size={52} />} title={st.title} subtitle={st.subtitle} />
      <div className="space-y-3">
        {options.map(opt => (
          <OptionCard
            key={opt.value}
            icon={opt.icon}
            title={opt.title}
            desc={opt.desc}
            selected={answers.ageGroup === opt.value}
            onClick={() => setAnswers(prev => ({ ...prev, ageGroup: opt.value }))}
          />
        ))}
      </div>
    </div>
  );
}

function StepGoal({ answers, setAnswers, t }: StepProps) {
  const st = t.raw('steps.goal') as Record<string, string>;
  const options: { value: Goal; icon: React.ReactNode; title: string; desc: string }[] = [
    { value: 'chat',      icon: <MessageCircle size={20} />, title: st.chat,      desc: st.chatDesc },
    { value: 'work',      icon: <Briefcase size={20} />,     title: st.work,      desc: st.workDesc },
    { value: 'creative',  icon: <Palette size={20} />,       title: st.creative,  desc: st.creativeDesc },
    { value: 'developer', icon: <Code2 size={20} />,         title: st.developer, desc: st.developerDesc },
    { value: 'educator',  icon: <GraduationCap size={20} />, title: st.educator,  desc: st.educatorDesc },
  ];

  return (
    <div>
      <StepHeader icon={<Target size={52} />} title={st.title} subtitle={st.subtitle} />
      <div className="space-y-3">
        {options.map(opt => (
          <OptionCard
            key={opt.value}
            icon={opt.icon}
            title={opt.title}
            desc={opt.desc}
            selected={answers.goal === opt.value}
            onClick={() => setAnswers(prev => ({ ...prev, goal: opt.value }))}
          />
        ))}
      </div>
    </div>
  );
}

function StepExperience({ answers, setAnswers, t }: StepProps) {
  const st = t.raw('steps.experience') as Record<string, string>;
  const options: { value: Experience; icon: React.ReactNode; title: string; desc: string }[] = [
    { value: 'none',     icon: <Sprout size={20} />,   title: st.none,     desc: st.noneDesc },
    { value: 'some',     icon: <Leaf size={20} />,      title: st.some,     desc: st.someDesc },
    { value: 'advanced', icon: <TreePine size={20} />,  title: st.advanced, desc: st.advancedDesc },
  ];

  return (
    <div>
      <StepHeader icon={<Brain size={52} />} title={st.title} subtitle={st.subtitle} />
      <div className="space-y-3">
        {options.map(opt => (
          <OptionCard
            key={opt.value}
            icon={opt.icon}
            title={opt.title}
            desc={opt.desc}
            selected={answers.experience === opt.value}
            onClick={() => setAnswers(prev => ({ ...prev, experience: opt.value }))}
          />
        ))}
      </div>
    </div>
  );
}

function StepStyle({ answers, setAnswers, t }: StepProps) {
  const st = t.raw('steps.style') as Record<string, string>;
  const options: { value: LearningStyle; icon: React.ReactNode; title: string; desc: string }[] = [
    { value: 'visual',   icon: <Eye size={20} />,         title: st.visual,   desc: st.visualDesc },
    { value: 'reading',  icon: <BookOpen size={20} />,    title: st.reading,  desc: st.readingDesc },
    { value: 'practice', icon: <FlaskConical size={20} />,title: st.practice, desc: st.practiceDesc },
    { value: 'game',     icon: <Gamepad2 size={20} />,    title: st.game,     desc: st.gameDesc },
  ];

  return (
    <div>
      <StepHeader icon={<Sparkles size={52} />} title={st.title} subtitle={st.subtitle} />
      <div className="space-y-3">
        {options.map(opt => (
          <OptionCard
            key={opt.value}
            icon={opt.icon}
            title={opt.title}
            desc={opt.desc}
            selected={answers.learningStyle === opt.value}
            onClick={() => setAnswers(prev => ({ ...prev, learningStyle: opt.value }))}
          />
        ))}
      </div>
    </div>
  );
}

function StepTime({ answers, setAnswers, t }: StepProps) {
  const st = t.raw('steps.time') as Record<string, string>;
  const options: { value: DailyMinutes; icon: React.ReactNode; title: string; desc: string }[] = [
    { value: 5,  icon: <Zap size={20} />,      title: st.min5,  desc: st.min5Desc },
    { value: 15, icon: <Coffee size={20} />,    title: st.min15, desc: st.min15Desc },
    { value: 30, icon: <BookOpen size={20} />,  title: st.min30, desc: st.min30Desc },
    { value: 60, icon: <Flame size={20} />,     title: st.min60, desc: st.min60Desc },
  ];

  return (
    <div>
      <StepHeader icon={<Zap size={52} />} title={st.title} subtitle={st.subtitle} />
      <div className="space-y-3">
        {options.map(opt => (
          <OptionCard
            key={opt.value}
            icon={opt.icon}
            title={opt.title}
            desc={opt.desc}
            selected={answers.dailyMinutes === opt.value}
            onClick={() => setAnswers(prev => ({ ...prev, dailyMinutes: opt.value }))}
          />
        ))}
      </div>
    </div>
  );
}
