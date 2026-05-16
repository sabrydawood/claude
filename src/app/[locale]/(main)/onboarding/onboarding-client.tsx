'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/lib/i18n/navigation';
import { GetDir } from '@/lib/i18n/Locale.Utils';
import { OnboardingService } from '@/lib/api/services/onboarding.service';

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'parent' | 'child';
type ParentStep = 1 | 2 | 3 | 4 | 5;
type ChildStep = 1 | 2 | 3 | 4 | 5;

type GoalId = 'coding' | 'math' | 'arabic' | 'all' | 'fun';
type CharacterId = 'xbot' | 'luna' | 'zaid' | 'sara';
type InterestId = 'robots' | 'games' | 'art' | 'space' | 'animals' | 'stories';

interface ParentGoal {
  id: GoalId;
  emoji: string;
  labelKey: string;
  /** Map to backend EGoal value */
  backendGoal: 'developer' | 'creative' | 'educator' | 'chat' | 'work';
}

const PARENT_GOALS: ParentGoal[] = [
  { id: 'coding',  emoji: '💻', labelKey: 'goalCoding',  backendGoal: 'developer' },
  { id: 'math',    emoji: '🔢', labelKey: 'goalMath',    backendGoal: 'work'      },
  { id: 'arabic',  emoji: '📝', labelKey: 'goalArabic',  backendGoal: 'educator'  },
  { id: 'all',     emoji: '🌟', labelKey: 'goalAll',     backendGoal: 'chat'      },
  { id: 'fun',     emoji: '🎮', labelKey: 'goalFun',     backendGoal: 'creative'  },
];

interface Character {
  id: CharacterId;
  emoji: string;
  nameKey: string;
  descKey: string;
}

const CHARACTERS: Character[] = [
  { id: 'xbot', emoji: '🤖', nameKey: 'charXbotName', descKey: 'charXbotDesc' },
  { id: 'luna', emoji: '🌙', nameKey: 'charLunaName', descKey: 'charLunaDesc' },
  { id: 'zaid', emoji: '⚡', nameKey: 'charZaidName', descKey: 'charZaidDesc' },
  { id: 'sara', emoji: '🌸', nameKey: 'charSaraName', descKey: 'charSaraDesc' },
];

interface Interest {
  id: InterestId;
  emoji: string;
  labelKey: string;
}

const CHILD_INTERESTS: Interest[] = [
  { id: 'robots',  emoji: '🤖', labelKey: 'interestRobots'  },
  { id: 'games',   emoji: '🎮', labelKey: 'interestGames'   },
  { id: 'art',     emoji: '🎨', labelKey: 'interestArt'     },
  { id: 'space',   emoji: '🚀', labelKey: 'interestSpace'   },
  { id: 'animals', emoji: '🦁', labelKey: 'interestAnimals' },
  { id: 'stories', emoji: '📚', labelKey: 'interestStories' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SelectButton({
  selected,
  onClick,
  children,
  className = '',
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all
        ${selected
          ? 'border-[var(--zkawi-pink)] bg-[var(--zkawi-pink)]/5'
          : 'border-[var(--border)] hover:border-[var(--border-hover,#d1d5db)]'}
        ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OnboardingClient({ locale }: { locale: string }) {
  const t = useTranslations('onboarding.v2');
  const tp = useTranslations('onboarding.v2.parent');
  const tc = useTranslations('onboarding.v2.child');
  const router = useRouter();
  const dir = GetDir(locale);
  const isRtl = dir === 'rtl';

  const [phase, setPhase] = useState<Phase>('parent');
  const [parentStep, setParentStep] = useState<ParentStep>(1);
  const [childStep, setChildStep] = useState<ChildStep>(1);

  const [childName, setChildName] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<GoalId | ''>('');
  const [agreed, setAgreed] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId | ''>('');
  const [selectedInterests, setSelectedInterests] = useState<InterestId[]>([]);
  const [saving, setSaving] = useState(false);

  // Progress: parent phase = 0–50%, child phase = 50–100%
  const progress =
    phase === 'parent'
      ? (parentStep / 5) * 50
      : 50 + (childStep / 5) * 50;

  // ─── Navigation helpers ─────────────────────────────────────────────────────

  function advanceParent() {
    if (parentStep < 5) {
      setParentStep((p) => (p + 1) as ParentStep);
    } else {
      setPhase('child');
      setChildStep(1);
    }
  }

  async function advanceChild() {
    if (childStep < 5) {
      setChildStep((p) => (p + 1) as ChildStep);
    } else {
      // Final step: submit onboarding then navigate to dashboard
      setSaving(true);
      try {
        const goal = PARENT_GOALS.find((g) => g.id === selectedGoal);
        await OnboardingService.submit({
          AgeGroup: 'child',
          Goal: goal?.backendGoal ?? 'chat',
          Experience: 'none',
          LearningStyle: 'game',
          DailyMinutes: 15,
        });
        router.push('/dashboard');
      } catch {
        setSaving(false);
      }
    }
  }

  // ─── Slide animation direction (respects RTL) ───────────────────────────────
  const slideIn  = isRtl ? -30 : 30;
  const slideOut = isRtl ? 30 : -30;

  const stepKey = `${phase}-${phase === 'parent' ? parentStep : childStep}`;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      dir={dir}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4"
    >
      {/* ── Progress bar ─────────────────────────────────────────────────────── */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
          <span>{t('start')}</span>
          <span>{Math.round(progress)}{t('progress')}</span>
        </div>

        <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="flex justify-center gap-2 mt-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full transition-colors
              ${phase === 'parent' ? 'bg-blue-500 text-white' : 'bg-[var(--border)] text-[var(--text-muted)]'}`}
          >
            {t('phaseParent')}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full transition-colors
              ${phase === 'child' ? 'bg-purple-500 text-white' : 'bg-[var(--border)] text-[var(--text-muted)]'}`}
          >
            {t('phaseChild')}
          </span>
        </div>
      </div>

      {/* ── Step card ────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepKey}
          initial={{ opacity: 0, x: slideIn }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: slideOut }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-[var(--surface,white)] rounded-3xl shadow-xl p-6"
        >
          {/* ── PARENT PHASE ──────────────────────────────────────────────── */}

          {phase === 'parent' && parentStep === 1 && (
            <div className="text-center space-y-4">
              <div className="text-5xl">👨‍👩‍👧‍👦</div>
              <h2 className="text-xl font-bold text-[var(--text)]">{tp('step1Title')}</h2>
              <p className="text-[var(--text-muted)] text-sm">{tp('step1Desc')}</p>
              <button
                type="button"
                onClick={advanceParent}
                className="w-full bg-blue-500 text-white py-3 rounded-2xl font-semibold hover:bg-blue-600 transition-colors"
              >
                {tp('step1Cta')}
              </button>
            </div>
          )}

          {phase === 'parent' && parentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text)]">{tp('step2Title')}</h2>
              <input
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder={tp('step2Placeholder')}
                className="w-full border-2 border-[var(--border)] rounded-2xl px-4 py-3 text-lg
                  focus:border-blue-400 focus:outline-none bg-transparent text-[var(--text)]"
              />
              <button
                type="button"
                disabled={!childName.trim()}
                onClick={advanceParent}
                className="w-full bg-blue-500 text-white py-3 rounded-2xl font-semibold
                  hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {tp('step2Cta')}
              </button>
            </div>
          )}

          {phase === 'parent' && parentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text)]">{tp('step3Title')}</h2>
              <div className="space-y-2">
                {PARENT_GOALS.map((g) => (
                  <SelectButton
                    key={g.id}
                    selected={selectedGoal === g.id}
                    onClick={() => setSelectedGoal(g.id)}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <span className="font-medium text-[var(--text)]">
                      {tp(g.labelKey as Parameters<typeof tp>[0])}
                    </span>
                  </SelectButton>
                ))}
              </div>
              <button
                type="button"
                disabled={!selectedGoal}
                onClick={advanceParent}
                className="w-full bg-blue-500 text-white py-3 rounded-2xl font-semibold
                  disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
              >
                {tp('step3Cta')}
              </button>
            </div>
          )}

          {phase === 'parent' && parentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text)]">{tp('step4Title')}</h2>
              <div className="bg-[var(--surface-2,#f9fafb)] rounded-2xl p-4 text-sm text-[var(--text-muted)] space-y-2">
                <p>{'✅ '}{tp('step4Privacy1')}</p>
                <p>{'✅ '}{tp('step4Privacy2')}</p>
                <p>{'✅ '}{tp('step4Privacy3')}</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 accent-[var(--zkawi-pink)]"
                />
                <span className="text-sm text-[var(--text)]">{tp('step4CheckLabel')}</span>
              </label>
              <button
                type="button"
                disabled={!agreed}
                onClick={advanceParent}
                className="w-full bg-blue-500 text-white py-3 rounded-2xl font-semibold
                  disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
              >
                {tp('step4Cta')}
              </button>
            </div>
          )}

          {phase === 'parent' && parentStep === 5 && (
            <div className="text-center space-y-4">
              <div className="text-5xl">🎉</div>
              <h2 className="text-xl font-bold text-[var(--text)]">{tp('step5Title')}</h2>
              <p className="text-[var(--text-muted)]">
                {tp('step5Desc').replace('{name}', childName)}
              </p>
              <button
                type="button"
                onClick={advanceParent}
                className="w-full bg-purple-500 text-white py-3 rounded-2xl font-semibold
                  hover:bg-purple-600 transition-colors"
              >
                {tp('step5Cta').replace('{name}', childName)}
              </button>
            </div>
          )}

          {/* ── CHILD PHASE ───────────────────────────────────────────────── */}

          {phase === 'child' && childStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-center text-[var(--text)]">
                {childName}{' '}{tc('step1Title')}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {CHARACTERS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCharacter(c.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all
                      ${selectedCharacter === c.id
                        ? 'border-purple-500 bg-purple-50 scale-105'
                        : 'border-[var(--border)] hover:border-purple-300'}`}
                  >
                    <span className="text-4xl">{c.emoji}</span>
                    <span className="font-bold text-sm text-[var(--text)]">
                      {tc(c.nameKey as Parameters<typeof tc>[0])}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] text-center">
                      {tc(c.descKey as Parameters<typeof tc>[0])}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={!selectedCharacter}
                onClick={advanceChild}
                className="w-full bg-purple-500 text-white py-3 rounded-2xl font-semibold
                  disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
              >
                {tc('step1Cta')}
              </button>
            </div>
          )}

          {phase === 'child' && childStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-center text-[var(--text)]">{tc('step2Title')}</h2>
              <div className="grid grid-cols-3 gap-3">
                {CHILD_INTERESTS.map((interest) => (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() =>
                      setSelectedInterests((prev) =>
                        prev.includes(interest.id)
                          ? prev.filter((i) => i !== interest.id)
                          : [...prev, interest.id],
                      )
                    }
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all
                      ${selectedInterests.includes(interest.id)
                        ? 'border-purple-500 bg-purple-50 scale-105'
                        : 'border-[var(--border)]'}`}
                  >
                    <span className="text-3xl">{interest.emoji}</span>
                    <span className="text-xs font-medium text-[var(--text)]">
                      {tc(interest.labelKey as Parameters<typeof tc>[0])}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={selectedInterests.length === 0}
                onClick={advanceChild}
                className="w-full bg-purple-500 text-white py-3 rounded-2xl font-semibold
                  disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
              >
                {tc('step2Cta')}
              </button>
            </div>
          )}

          {phase === 'child' && childStep === 3 && (
            <div className="text-center space-y-4">
              <div className="text-5xl">🎮</div>
              <h2 className="text-lg font-bold text-[var(--text)]">{tc('step3Title')}</h2>
              <p className="text-[var(--text-muted)] text-sm">{tc('step3Desc')}</p>
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-sm text-blue-700">{tc('step3Question')}</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {['6', '7', '8', '9'].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        if (n === '8') advanceChild();
                      }}
                      className="bg-white border-2 border-[var(--border)] rounded-xl py-2 text-lg
                        font-bold hover:border-blue-400 transition-colors text-[var(--text)]"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {phase === 'child' && childStep === 4 && (
            <div className="text-center space-y-4">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-6xl"
              >
                🌟
              </motion.div>
              <h2 className="text-2xl font-bold text-purple-700">{tc('step4Title')}</h2>
              <p className="text-[var(--text-muted)]">{tc('step4Desc')}</p>
              <button
                type="button"
                onClick={advanceChild}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white
                  py-3 rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity"
              >
                {tc('step4Cta')}
              </button>
            </div>
          )}

          {phase === 'child' && childStep === 5 && (
            <div className="text-center space-y-4">
              <div className="text-6xl">🎊</div>
              <h2 className="text-2xl font-bold text-[var(--text)]">
                {tc('step5Title').replace('{name}', childName)}
              </h2>
              <p className="text-[var(--text-muted)]">{tc('step5Desc')}</p>
              <button
                type="button"
                disabled={saving}
                onClick={advanceChild}
                className="w-full bg-green-500 text-white py-3 rounded-2xl font-bold
                  hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {tc('step5Cta')}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
