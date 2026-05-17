'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Star,
  Lock,
  Code2,
  Globe,
  RefreshCw,
  Variable,
  Zap,
  List,
  FolderKanban,
  Trophy,
  Target,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Bot,
  Users,
} from 'lucide-react';
import type { RobotMood } from '@/components/mascot-gltf';

// ─── Dynamic imports (Canvas = client-only) ──────────────────────────────────

const XbotExpressive = dynamic(
  () => import('@/components/mascot-gltf').then(m => ({ default: m.XbotExpressive })),
  { ssr: false, loading: () => <div style={{ width: 280, height: 380 }} /> }
);

// ─── Types ────────────────────────────────────────────────────────────────────

type Scene = 'welcome' | 'dashboard' | 'lesson' | 'activity' | 'reward';

const SCENES: Scene[] = ['welcome', 'dashboard', 'lesson', 'activity', 'reward'];

// ─── Island Data ──────────────────────────────────────────────────────────────

type IslandStatus = 'done' | 'active' | 'locked';

interface Island {
  id: string;
  icon: keyof typeof ISLAND_ICONS;
  label: string;
  status: IslandStatus;
}

const ISLAND_ICONS = {
  Code2: <Code2 size={24} />,
  Variable: <Variable size={24} />,
  RefreshCw: <RefreshCw size={24} />,
  Zap: <Zap size={24} />,
  List: <List size={24} />,
  FolderKanban: <FolderKanban size={24} />,
} as const;

const ISLANDS: Island[] = [
  { id: '1', icon: 'Code2', label: 'البرمجة الأساسية', status: 'done' },
  { id: '2', icon: 'Variable', label: 'المتغيرات', status: 'done' },
  { id: '3', icon: 'RefreshCw', label: 'الحلقات', status: 'active' },
  { id: '4', icon: 'Zap', label: 'الدوال', status: 'locked' },
  { id: '5', icon: 'List', label: 'القوائم', status: 'locked' },
  { id: '6', icon: 'FolderKanban', label: 'المشاريع', status: 'locked' },
];

// ─── Match Activity Data ──────────────────────────────────────────────────────

interface MatchPair {
  id: string;
  question: string;
  answer: string;
}

const MATCH_PAIRS: MatchPair[] = [
  { id: '1', question: 'حلقة for', answer: 'تتكرر عدداً محدداً' },
  { id: '2', question: 'حلقة while', answer: 'تتكرر حتى يتغير الشرط' },
  { id: '3', question: 'break', answer: 'تخرج من الحلقة فوراً' },
];

// ─── Scene config ─────────────────────────────────────────────────────────────

const SCENE_META: Record<Scene, { mood: RobotMood; bubble: string; label: string }> = {
  welcome:   { mood: 'happy',    bubble: 'أهلاً أحمد!\nأنا Xbot — معلمك الذكي.\nجاهز للمغامرة؟', label: 'الترحيب' },
  dashboard: { mood: 'idle',     bubble: 'لديك 3 جزر جديدة\nاليوم ندرس الحلقات!', label: 'لوحة التحكم' },
  lesson:    { mood: 'talking',  bubble: 'الحلقة for تقول:\n"كرّر هذا 10 مرات"\nتخيّلها زي المشي في دائرة', label: 'الدرس' },
  activity:  { mood: 'thinking', bubble: 'ممتاز! الآن\nصل كل مفهوم\nبتعريفه الصحيح', label: 'النشاط' },
  reward:    { mood: 'happy',    bubble: 'رائع جداً يا أحمد!\nكسبت 85 XP\nأنت نجم البرمجة!', label: 'المكافأة' },
};

// ─── Star positions (fixed, no Math.random in render) ────────────────────────

const BG_STARS = Array.from({ length: 60 }, (_, i) => ({
  top: ((i * 37 + 13) % 97) + 1.5,
  left: ((i * 53 + 7) % 97) + 1.5,
  size: i % 5 === 0 ? 3 : 1.5,
  delay: (i * 0.1) % 5,
  duration: 2 + (i % 4),
}));

// Reward star burst positions (fixed angles, no Math.random)
const REWARD_STARS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * 360;
  const r = 60 + (i % 3) * 15;
  const rad = (angle * Math.PI) / 180;
  return {
    x: 80 + Math.cos(rad) * r,
    y: 80 + Math.sin(rad) * r,
    large: i % 3 === 0,
    delay: i * 0.04,
  };
});

// ─── XPBar ───────────────────────────────────────────────────────────────────

function XPBar({ xp, maxXp }: { xp: number; maxXp: number }) {
  const pct = Math.min(100, (xp / maxXp) * 100);
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-amber-400 font-bold text-sm whitespace-nowrap">XP {xp}/{maxXp}</span>
      <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
        />
      </div>
    </div>
  );
}

// ─── IslandGrid ───────────────────────────────────────────────────────────────

function IslandGrid({ active }: { active: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {ISLANDS.map((island, i) => {
        const isDone = island.status === 'done';
        const isActive = island.status === 'active';
        const isLocked = island.status === 'locked';

        return (
          <motion.button
            key={island.id}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={active ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
            transition={{ delay: i * 0.07, duration: 0.4, ease: 'backOut' }}
            whileHover={!isLocked ? { scale: 1.08, y: -4 } : {}}
            disabled={isLocked}
            className={[
              'aspect-square rounded-[20px] flex flex-col items-center justify-center gap-1.5 p-2 border-2 relative transition-colors',
              isDone
                ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 border-emerald-400 shadow-[0_0_12px_#10B98155]'
                : isActive
                ? 'bg-gradient-to-br from-amber-600 to-amber-500 border-amber-400 shadow-[0_0_20px_#F59E0B55]'
                : 'bg-white/5 border-white/10 cursor-not-allowed',
            ].join(' ')}
          >
            {isLocked && (
              <span className="absolute top-1.5 end-1.5 text-white/40">
                <Lock size={12} />
              </span>
            )}
            <span className={isLocked ? 'text-white/30' : 'text-white'}>
              {ISLAND_ICONS[island.icon]}
            </span>
            <span
              className={[
                'text-[10px] font-bold text-center leading-tight',
                isLocked ? 'text-white/30' : 'text-white',
              ].join(' ')}
            >
              {island.label}
            </span>
            {isDone && (
              <span className="text-white">
                <CheckCircle2 size={12} />
              </span>
            )}
            {isActive && (
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-2 h-2 rounded-full bg-amber-400"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── LessonCard ───────────────────────────────────────────────────────────────

function LessonCard({ active }: { active: boolean }) {
  const [lineIdx, setLineIdx] = useState(0);
  const lines = useMemo(() => [
    { code: 'for i in range(10):', color: '#60A5FA' },
    { code: '    print("مرحباً!")', color: '#A78BFA' },
    { code: '# → يطبع 10 مرات', color: '#10B981' },
  ], []);

  useEffect(() => {
    if (!active) { setLineIdx(0); return; }
    const t = setInterval(() => setLineIdx(v => v < lines.length - 1 ? v + 1 : v), 1200);
    return () => clearInterval(t);
  }, [active, lines.length]);

  return (
    <div className="flex flex-col gap-5">
      {/* Concept card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        className="bg-purple-500/15 border border-purple-500/30 rounded-xl p-4"
      >
        <p className="text-purple-300 font-bold text-base mb-1.5 flex items-center gap-2">
          <Lightbulb size={16} />
          الحلقة for — المفهوم
        </p>
        <p className="text-white/80 text-sm leading-relaxed">
          الحلقة هي طريقة لتكرار كود بدون كتابته مرات كثيرة.
          مثلاً، بدل كتابة{' '}
          <code className="text-blue-400 bg-black/30 px-1 py-0.5 rounded text-xs">print()</code>
          {' '}عشر مرات، نكتبها مرة واحدة داخل حلقة.
        </p>
      </motion.div>

      {/* Code block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900 rounded-xl p-4 border border-white/[0.08] font-mono"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28CA41]" />
          <span className="text-white/30 text-xs ms-auto">Python</span>
        </div>
        {lines.map((line, i) => (
          <AnimatePresence key={i}>
            {i <= lineIdx && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ color: line.color, direction: 'ltr' }}
                className="text-sm leading-loose"
              >
                {line.code}
                {i === lineIdx && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    style={{ background: line.color }}
                    className="inline-block w-0.5 h-[1em] ms-0.5 align-middle"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </motion.div>

      {/* Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={active && lineIdx >= 2 ? { opacity: 1 } : { opacity: 0 }}
        className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-400 text-sm flex items-start gap-2"
      >
        <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
        هل فهمت؟ النتيجة: &quot;مرحباً!&quot; ستُطبع 10 مرات بدون تكرار الكود!
      </motion.div>
    </div>
  );
}

// ─── Inline Mini-Match Activity ───────────────────────────────────────────────

interface MiniMatchProps {
  onComplete: (score: number) => void;
  setXbotMood: (mood: RobotMood) => void;
}

function MiniMatchActivity({ onComplete, setXbotMood }: MiniMatchProps) {
  const [selectedQ, setSelectedQ] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ q: string; a: string } | null>(null);
  const moodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerMood = useCallback((mood: RobotMood) => {
    if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    setXbotMood(mood);
    moodTimerRef.current = setTimeout(() => setXbotMood('idle'), 1500);
  }, [setXbotMood]);

  useEffect(() => {
    return () => {
      if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    };
  }, []);

  // Shuffle answers for display (stable, useMemo)
  const shuffledAnswers = useMemo(
    () => [...MATCH_PAIRS].sort((a, b) => (a.id.charCodeAt(0) * 7 + 3) % 3 - (b.id.charCodeAt(0) * 7 + 3) % 3),
    []
  );

  function handleSelectQ(id: string) {
    if (matched.has(id)) return;
    setSelectedQ(prev => prev === id ? null : id);
  }

  function handleSelectA(answerId: string) {
    if (!selectedQ) return;
    if (matched.has(selectedQ)) return;

    const isCorrect = selectedQ === answerId;

    if (isCorrect) {
      const newMatched = new Set(matched).add(selectedQ);
      setMatched(newMatched);
      setSelectedQ(null);
      triggerMood('happy');

      if (newMatched.size === MATCH_PAIRS.length) {
        setTimeout(() => onComplete(100), 600);
      }
    } else {
      setWrongPair({ q: selectedQ, a: answerId });
      triggerMood('thinking');
      setTimeout(() => {
        setWrongPair(null);
        setSelectedQ(null);
      }, 600);
    }
  }

  const completedCount = matched.size;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-white/50 text-center">{completedCount}/3 مكتملة</div>
      <div className="grid grid-cols-2 gap-3" dir="rtl">
        {/* Questions column (right in RTL) */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/40 font-semibold mb-1 text-center">المفهوم</p>
          {MATCH_PAIRS.map(pair => {
            const isMatched = matched.has(pair.id);
            const isSelected = selectedQ === pair.id;
            return (
              <button
                key={pair.id}
                onClick={() => handleSelectQ(pair.id)}
                disabled={isMatched}
                className={[
                  'px-3 py-2.5 rounded-xl border text-sm font-semibold text-center transition-all duration-150',
                  isMatched
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 cursor-not-allowed'
                    : isSelected
                    ? 'bg-purple-600 border-purple-400 text-white scale-[1.02]'
                    : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10 hover:border-white/30',
                ].join(' ')}
              >
                {pair.question}
              </button>
            );
          })}
        </div>

        {/* Answers column (left in RTL) */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/40 font-semibold mb-1 text-center">التعريف</p>
          {shuffledAnswers.map(pair => {
            const isMatched = matched.has(pair.id);
            const isWrong = wrongPair?.a === pair.id;
            return (
              <button
                key={pair.id}
                onClick={() => handleSelectA(pair.id)}
                disabled={isMatched || !selectedQ}
                className={[
                  'px-3 py-2.5 rounded-xl border text-sm text-center transition-all duration-150',
                  isMatched
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 cursor-not-allowed'
                    : isWrong
                    ? 'bg-red-600/20 border-red-500 text-red-300'
                    : selectedQ
                    ? 'bg-white/5 border-white/15 text-white/80 hover:bg-amber-500/10 hover:border-amber-500/40 cursor-pointer'
                    : 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed',
                ].join(' ')}
              >
                {pair.answer}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── RewardScene ──────────────────────────────────────────────────────────────

function RewardScene({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/* Stars burst */}
      <div className="relative w-40 h-40">
        {REWARD_STARS.map((star, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, x: 80, y: 80 }}
            animate={active
              ? { opacity: 1, scale: 1, x: star.x, y: star.y }
              : { opacity: 0, scale: 0, x: 80, y: 80 }}
            transition={{ delay: star.delay, type: 'spring', stiffness: 200 }}
            className="absolute top-0 left-0"
          >
            <Star
              size={star.large ? 22 : 14}
              className={star.large ? 'text-amber-400 fill-amber-400' : 'text-purple-400 fill-purple-400'}
            />
          </motion.div>
        ))}

        {/* Central XP badge */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={active ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -30 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/50 flex flex-col items-center justify-center"
        >
          <span className="text-white font-black text-2xl leading-none">85</span>
          <span className="text-white/80 text-xs font-semibold">XP</span>
        </motion.div>
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-2xl font-black text-amber-400 mb-2 flex items-center justify-center gap-2">
          <Trophy size={24} />
          أحسنت يا أحمد!
        </p>
        <p className="text-white/70 text-base">أتممت درس الحلقات بنجاح</p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-3 gap-3 w-full max-w-sm"
      >
        {[
          { label: 'الدقة', value: '90%', icon: <Target size={18} className="text-purple-400" /> },
          { label: 'XP كُسبت', value: '+85', icon: <Zap size={18} className="text-amber-400" /> },
          { label: 'سلسلة أيام', value: '5', icon: <Star size={18} className="text-orange-400 fill-orange-400" /> },
        ].map(stat => (
          <div
            key={stat.label}
            className="bg-white/5 rounded-xl p-4 text-center border border-white/10"
          >
            <div className="flex justify-center mb-1.5">{stat.icon}</div>
            <div className="text-white font-black text-xl">{stat.value}</div>
            <div className="text-white/50 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* XP bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.9 }}
        className="w-full max-w-sm"
      >
        <div className="flex justify-between text-xs text-white/50 mb-1.5">
          <span>المستوى 4</span>
          <span>285 / 400 XP</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '50%' }}
            animate={active ? { width: '71%' } : { width: '50%' }}
            transition={{ delay: 1, duration: 1.2, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-600 to-amber-400 rounded-full"
          />
        </div>
        <p className="text-amber-400 text-xs mt-1.5 text-center flex items-center justify-center gap-1.5">
          <Star size={11} className="fill-amber-400" />
          +85 XP — اقتربت من المستوى 5!
        </p>
      </motion.div>
    </div>
  );
}

// ─── SpeechBubble ─────────────────────────────────────────────────────────────

function SpeechBubble({ text, isRtl }: { text: string; isRtl: boolean }) {
  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative bg-white rounded-2xl p-3.5 shadow-2xl max-w-[220px]"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      <p className="text-sm font-semibold leading-relaxed whitespace-pre-line m-0" style={{ color: '#1E293B' }}>
        {text}
      </p>
      {/* Bubble tail */}
      <div
        className="absolute -bottom-3.5 w-0 h-0"
        style={{
          [isRtl ? 'right' : 'left']: 24,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: '14px solid white',
        }}
      />
    </motion.div>
  );
}

// ─── Main Demo ────────────────────────────────────────────────────────────────

export default function ChildJourneyClient({ locale }: { locale: string }) {
  const isRtl = locale === 'ar';
  const [scene, setScene] = useState<Scene>('welcome');
  const [activityDone, setActivityDone] = useState(false);
  const [activityScore, setActivityScore] = useState<number | null>(null);
  const [xbotMood, setXbotMood] = useState<RobotMood>('idle');

  const sceneIdx = SCENES.indexOf(scene);
  const meta = SCENE_META[scene];

  // Effective Xbot mood: activity scene uses live xbotMood, others use scene meta
  const effectiveMood: RobotMood = scene === 'activity' ? xbotMood : meta.mood;

  const goNext = useCallback(() => {
    const next = SCENES[sceneIdx + 1];
    if (next) setScene(next);
  }, [sceneIdx]);

  const goPrev = useCallback(() => {
    const prev = SCENES[sceneIdx - 1];
    if (prev) setScene(prev);
  }, [sceneIdx]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') isRtl ? goPrev() : goNext();
      if (e.key === 'ArrowLeft') isRtl ? goNext() : goPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isRtl, goNext, goPrev]);

  // Reset xbot mood when leaving activity scene
  useEffect(() => {
    if (scene !== 'activity') setXbotMood('idle');
  }, [scene]);

  function handleActivityComplete(score: number) {
    setActivityScore(score);
    setActivityDone(true);
    setTimeout(() => setScene('reward'), 1200);
  }

  const showXbot = scene !== 'activity' && scene !== 'reward';

  // Bubble text for activity scene (dynamic based on mood)
  const activityBubble =
    xbotMood === 'happy' ? 'ممتاز! إجابة صحيحة!' :
    xbotMood === 'thinking' ? 'فكّر مرة ثانية...' :
    'ممتاز! الآن\nصل كل مفهوم\nبتعريفه الصحيح';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-hidden relative"
      style={{ fontFamily: isRtl ? '"Noto Sans Arabic", system-ui, sans-serif' : 'system-ui, sans-serif' }}
    >
      {/* ── Background stars ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {BG_STARS.map((star, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ delay: star.delay, duration: star.duration, repeat: Infinity }}
            className="absolute rounded-full bg-white"
            style={{
              width: star.size,
              height: star.size,
              top: `${star.top}%`,
              left: `${star.left}%`,
            }}
          />
        ))}
      </div>

      {/* ── Top nav bar ── */}
      <div className="fixed top-0 inset-x-0 z-50 px-6 py-3 flex items-center gap-4 backdrop-blur-md bg-slate-950/70 border-b border-white/[0.06]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 me-auto">
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center">
            <Bot size={18} />
          </div>
          <span className="font-black text-lg text-purple-400">ذكاوي</span>
          <span className="text-[11px] text-white/30 bg-white/7 px-2 py-0.5 rounded-full border border-white/10">
            DEV DEMO
          </span>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
            <Users size={14} />
          </div>
          <span className="text-sm font-semibold">أحمد</span>
          <span className="text-xs text-amber-400 font-bold">Lv.4</span>
        </div>

        {/* XP mini bar */}
        <div className="w-28">
          <XPBar xp={200} maxXp={400} />
        </div>
      </div>

      {/* ── Bottom navigation ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
        {/* Step dots */}
        <div className="flex items-center gap-2">
          {SCENES.map(s => (
            <button
              key={s}
              onClick={() => setScene(s)}
              title={SCENE_META[s].label}
              className={[
                'rounded-full transition-all duration-300',
                s === scene
                  ? 'w-8 h-2 bg-amber-400'
                  : 'w-2 h-2 bg-white/25 hover:bg-white/40',
              ].join(' ')}
            />
          ))}
        </div>

        {/* Prev / Next buttons */}
        <div className="flex gap-2">
          <button
            onClick={goPrev}
            disabled={sceneIdx === 0}
            className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white/70 text-sm disabled:opacity-30 backdrop-blur-md flex items-center gap-1.5 hover:bg-white/10 transition-colors"
          >
            {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            {isRtl ? 'السابق' : 'Prev'}
          </button>
          <button
            onClick={goNext}
            disabled={sceneIdx === SCENES.length - 1}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold disabled:opacity-30 flex items-center gap-1.5 transition-colors"
          >
            {isRtl ? 'التالي' : 'Next'}
            {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="min-h-screen pt-[72px] pb-[100px] px-6 flex items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            initial={{ opacity: 0, x: isRtl ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? 40 : -40 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="w-full max-w-[900px]"
            style={{
              display: 'grid',
              gridTemplateColumns: showXbot ? '1fr 1fr' : '1fr',
              gap: 32,
              alignItems: 'center',
            }}
          >
            {/* ── Xbot column (first in source = right in RTL, left in LTR) ── */}
            {showXbot && (
              <div
                className="flex flex-col items-center gap-0"
                style={{ order: isRtl ? -1 : 1 }}
              >
                <AnimatePresence mode="wait">
                  <SpeechBubble key={scene} text={meta.bubble} isRtl={isRtl} />
                </AnimatePresence>

                <motion.div
                  animate={effectiveMood === 'happy' ? { y: [0, -8, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="mt-5 drop-shadow-[0_0_30px_#7C3AED55]"
                >
                  <XbotExpressive mood={effectiveMood} width={280} height={380} />
                </motion.div>

                <div className="flex items-center gap-1.5 mt-2 text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
                  <Bot size={10} />
                  Xbot — {effectiveMood}
                </div>
              </div>
            )}

            {/* ── Content column ── */}
            <div className="flex flex-col gap-5">
              {/* Scene label */}
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-purple-500 to-amber-400" />
                <span className="text-white/50 text-sm">
                  {sceneIdx + 1} / {SCENES.length} — {meta.label}
                </span>
              </div>

              {/* ── Scene: Welcome ── */}
              {scene === 'welcome' && (
                <motion.div className="flex flex-col gap-5 max-w-sm">
                  <h1 className="text-4xl font-black text-white leading-tight m-0">
                    <span className="text-purple-400">أهلاً،</span>{' '}
                    أحمد!
                  </h1>
                  <p className="text-white/70 text-base leading-relaxed m-0">
                    مرحباً في{' '}
                    <strong className="text-purple-400">ذكاوي</strong>{' '}
                    — منصتك الذكية للتعلم.
                    <br />
                    معك اليوم{' '}
                    <strong className="text-amber-400">Xbot</strong>
                    ، معلمك الذكي الشخصي.
                    <br />
                    سنتعلم البرمجة معاً بطريقة ممتعة وتفاعلية!
                  </p>

                  {/* Feature tags */}
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { icon: <Star size={12} />, text: 'تكيّفي مع عمرك' },
                      { icon: <Bot size={12} />, text: 'Xbot يشرح لك' },
                      { icon: <Trophy size={12} />, text: 'اربح XP' },
                      { icon: <Users size={12} />, text: 'تقرير للوالدين' },
                    ].map(tag => (
                      <span
                        key={tag.text}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold"
                      >
                        {tag.icon}
                        {tag.text}
                      </span>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={goNext}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-colors self-start shadow-lg shadow-purple-600/30"
                  >
                    <Zap size={15} />
                    ابدأ رحلتك
                    {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                  </motion.button>
                </motion.div>
              )}

              {/* ── Scene: Dashboard ── */}
              {scene === 'dashboard' && (
                <motion.div className="flex flex-col gap-5">
                  <div>
                    <h2 className="text-xl font-black text-white m-0 mb-1">لوحة تحكمك</h2>
                    <p className="text-white/50 text-sm m-0">استكشف Explorer — عمرك 10 سنوات</p>
                  </div>
                  <XPBar xp={200} maxXp={400} />
                  <p className="text-purple-300 text-sm font-semibold m-0 flex items-center gap-1.5">
                    <Globe size={14} />
                    جزرك التعليمية — اختر مغامرتك
                  </p>
                  <IslandGrid active={scene === 'dashboard'} />
                </motion.div>
              )}

              {/* ── Scene: Lesson ── */}
              {scene === 'lesson' && <LessonCard active={scene === 'lesson'} />}

              {/* ── Scene: Activity ── */}
              {scene === 'activity' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <h2 className="text-xl font-black text-white m-0 mb-1 flex items-center gap-2">
                      <Target size={20} className="text-purple-400" />
                      النشاط التفاعلي
                    </h2>
                    <p className="text-white/50 text-sm m-0">صل كل مفهوم بتعريفه الصحيح</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    {activityDone ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-center py-5"
                      >
                        <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-3" />
                        <p className="text-amber-400 font-black text-xl mb-1">
                          نتيجتك: {activityScore}%
                        </p>
                        <p className="text-white/50 text-sm">انتقلنا للمكافأة...</p>
                      </motion.div>
                    ) : (
                      <MiniMatchActivity
                        onComplete={handleActivityComplete}
                        setXbotMood={setXbotMood}
                      />
                    )}
                  </div>

                  {/* Floating Xbot for activity */}
                  <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5">
                    <div className="shrink-0">
                      <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center">
                        <Bot size={16} className="text-purple-400" />
                      </div>
                    </div>
                    <div>
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={xbotMood}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-sm text-white/80 whitespace-pre-line m-0"
                        >
                          {activityBubble}
                        </motion.p>
                      </AnimatePresence>
                      <span className="text-xs text-white/30 mt-1 inline-flex items-center gap-1">
                        <Bot size={9} /> Xbot — {xbotMood}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Scene: Reward ── */}
              {scene === 'reward' && <RewardScene active={scene === 'reward'} />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Corner Xbot for reward ── */}
      {scene === 'reward' && (
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-[100px] end-6 z-40 drop-shadow-[0_0_20px_#F59E0B44]"
        >
          <XbotExpressive mood="happy" width={150} height={200} />
        </motion.div>
      )}
    </div>
  );
}

