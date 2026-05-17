'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import type { RobotMood } from '@/components/mascot-gltf';
import type { MatchItem } from '@/components/activities/MatchActivity';

// ─── Dynamic imports (Canvas = client-only) ──────────────────────────────────

const XbotExpressive = dynamic(
  () => import('@/components/mascot-gltf').then(m => ({ default: m.XbotExpressive })),
  { ssr: false, loading: () => <div style={{ width: 280, height: 380 }} /> }
);

const MatchActivity = dynamic(
  () => import('@/components/activities/MatchActivity'),
  { ssr: false }
);

// ─── Types ────────────────────────────────────────────────────────────────────

type Scene = 'welcome' | 'dashboard' | 'lesson' | 'activity' | 'reward';

const SCENES: Scene[] = ['welcome', 'dashboard', 'lesson', 'activity', 'reward'];

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const ISLANDS = [
  { id: '1', emoji: '🏝️', label: 'البرمجة الأساسية', status: 'done' },
  { id: '2', emoji: '🌊', label: 'المتغيرات', status: 'done' },
  { id: '3', emoji: '🔥', label: 'الحلقات', status: 'active' },
  { id: '4', emoji: '🏔️', label: 'الدوال', status: 'locked' },
  { id: '5', emoji: '🌋', label: 'القوائم', status: 'locked' },
  { id: '6', emoji: '⭐', label: 'المشاريع', status: 'locked' },
];

const MATCH_ITEMS: MatchItem[] = [
  { id: '1', questionAr: 'حلقة for', questionEn: 'for loop', answerAr: 'تتكرر عدداً محدداً', answerEn: 'Repeats a fixed count' },
  { id: '2', questionAr: 'حلقة while', questionEn: 'while loop', answerAr: 'تتكرر حتى يتغير الشرط', answerEn: 'Loops until condition false' },
  { id: '3', questionAr: 'break', questionEn: 'break', answerAr: 'تخرج من الحلقة فوراً', answerEn: 'Exits the loop instantly' },
];

// ─── Scene config ─────────────────────────────────────────────────────────────

const SCENE_META: Record<Scene, { mood: RobotMood; bubble: string; label: string }> = {
  welcome:   { mood: 'happy',    bubble: 'أهلاً أحمد! 🎉\nأنا Xbot — معلمك الذكي.\nجاهز للمغامرة؟', label: 'الترحيب' },
  dashboard: { mood: 'idle',     bubble: 'لديك 3 جزر جديدة 🏝️\nاليوم ندرس الحلقات!', label: 'لوحة التحكم' },
  lesson:    { mood: 'talking',  bubble: 'الحلقة for تقول:\n"كرّر هذا 10 مرات"\nتخيّلها زي المشي في دائرة 🔄', label: 'الدرس' },
  activity:  { mood: 'thinking', bubble: 'ممتاز! الآن 🎯\nصل كل مفهوم\nبتعريفه الصحيح', label: 'النشاط' },
  reward:    { mood: 'happy',    bubble: 'رائع جداً يا أحمد! 🌟\nكسبت 85 XP\nأنت نجم البرمجة!', label: 'المكافأة' },
};

// ─── Colours ──────────────────────────────────────────────────────────────────

const BG = 'linear-gradient(135deg, #020617 0%, #0F0A30 50%, #1E0A4A 100%)';
const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#A78BFA';
const GOLD = '#F59E0B';

// ─── Sub-components ───────────────────────────────────────────────────────────

function XPBar({ xp, maxXp }: { xp: number; maxXp: number }) {
  const pct = Math.min(100, (xp / maxXp) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: GOLD, fontWeight: 700, fontSize: 14 }}>XP {xp}/{maxXp}</span>
      <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 99 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ height: '100%', background: `linear-gradient(90deg, ${PURPLE}, ${PURPLE_LIGHT})`, borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

function IslandGrid({ active }: { active: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {ISLANDS.map((island, i) => (
        <motion.div
          key={island.id}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={active ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
          transition={{ delay: i * 0.07, duration: 0.4, ease: 'backOut' }}
          whileHover={island.status !== 'locked' ? { scale: 1.08, y: -4 } : {}}
          style={{
            aspectRatio: '1',
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: island.status === 'locked' ? 'not-allowed' : 'pointer',
            border: `2px solid ${
              island.status === 'done' ? '#10B981' :
              island.status === 'active' ? GOLD :
              'rgba(255,255,255,0.08)'
            }`,
            background: island.status === 'done'
              ? 'linear-gradient(135deg, #065F46, #10B981)'
              : island.status === 'active'
              ? `linear-gradient(135deg, #7C2D12, ${GOLD})`
              : 'rgba(255,255,255,0.04)',
            boxShadow: island.status === 'active'
              ? `0 0 20px ${GOLD}55`
              : island.status === 'done'
              ? '0 0 12px #10B98155'
              : 'none',
            padding: 8,
            position: 'relative',
          }}
        >
          {island.status === 'locked' && (
            <span style={{ position: 'absolute', top: 6, insetInlineEnd: 6, fontSize: 14 }}>🔒</span>
          )}
          <span style={{ fontSize: 28 }}>{island.emoji}</span>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: island.status === 'locked' ? 'rgba(255,255,255,0.3)' : 'white',
            textAlign: 'center',
            lineHeight: 1.3,
          }}>
            {island.label}
          </span>
          {island.status === 'done' && (
            <span style={{ fontSize: 12 }}>✅</span>
          )}
          {island.status === 'active' && (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

function LessonCard({ active }: { active: boolean }) {
  const [lineIdx, setLineIdx] = useState(0);
  const lines = [
    { code: 'for i in range(10):', color: '#60A5FA' },
    { code: '    print("مرحباً!")', color: '#A78BFA' },
    { code: '# → يطبع 10 مرات', color: '#10B981' },
  ];

  useEffect(() => {
    if (!active) { setLineIdx(0); return; }
    const t = setInterval(() => setLineIdx(v => v < lines.length - 1 ? v + 1 : v), 1200);
    return () => clearInterval(t);
  }, [active, lines.length]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Concept */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        style={{
          background: 'rgba(124,58,237,0.15)',
          borderRadius: 16,
          padding: '16px 20px',
          border: `1px solid ${PURPLE}55`,
        }}
      >
        <p style={{ color: PURPLE_LIGHT, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
          💡 الحلقة for — المفهوم
        </p>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.7 }}>
          الحلقة هي طريقة لتكرار كود بدون كتابته مرات كثيرة.
          مثلاً، بدل كتابة <code style={{ color: '#60A5FA', background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: 4 }}>print()</code> عشر مرات،
          نكتبها مرة واحدة داخل حلقة.
        </p>
      </motion.div>

      {/* Live Code Block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.2 }}
        style={{
          background: '#0D1117',
          borderRadius: 16,
          padding: '16px 20px',
          border: '1px solid rgba(255,255,255,0.08)',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28CA41' }} />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginRight: 'auto' }}>Python</span>
        </div>
        {lines.map((line, i) => (
          <AnimatePresence key={i}>
            {i <= lineIdx && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ color: line.color, fontSize: 15, lineHeight: 2, direction: 'ltr' }}
              >
                {line.code}
                {i === lineIdx && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    style={{ background: line.color, width: 2, height: '1em', display: 'inline-block', marginRight: 2 }}
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
        style={{
          background: 'rgba(16,185,129,0.1)',
          borderRadius: 12,
          padding: '10px 16px',
          border: '1px solid rgba(16,185,129,0.3)',
          color: '#10B981',
          fontSize: 13,
        }}
      >
        ✅ هل فهمت؟ النتيجة: &quot;مرحباً!&quot; ستُطبع 10 مرات بدون تكرار الكود!
      </motion.div>
    </div>
  );
}

function RewardScene({ active }: { active: boolean }) {
  const stars = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center' }}>
      {/* Stars burst */}
      <div style={{ position: 'relative', width: 160, height: 160 }}>
        {stars.map(i => {
          const angle = (i / stars.length) * 360;
          const r = 60 + (i % 3) * 15;
          const x = Math.cos((angle * Math.PI) / 180) * r;
          const y = Math.sin((angle * Math.PI) / 180) * r;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, x: 80, y: 80 }}
              animate={active ? { opacity: 1, scale: 1, x: 80 + x, y: 80 + y } : { opacity: 0, scale: 0, x: 80, y: 80 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 200 }}
              style={{
                position: 'absolute',
                fontSize: i % 3 === 0 ? 24 : 16,
                top: 0,
                left: 0,
              }}
            >
              {['⭐', '✨', '💫'][i % 3]}
            </motion.div>
          );
        })}
        {/* Central XP badge */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={active ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -30 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${GOLD}, #F97316)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 30px ${GOLD}88`,
          }}
        >
          <span style={{ color: 'white', fontWeight: 900, fontSize: 22, lineHeight: 1 }}>85</span>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 600 }}>XP</span>
        </motion.div>
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.5 }}
      >
        <p style={{ color: GOLD, fontWeight: 900, fontSize: 26, marginBottom: 8 }}>أحسنت يا أحمد! 🏆</p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>
          أتممت درس الحلقات بنجاح
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.7 }}
        style={{ display: 'flex', gap: 16 }}
      >
        {[
          { label: 'الدقة', value: '90%', icon: '🎯' },
          { label: 'XP كُسبت', value: '+85', icon: '⚡' },
          { label: 'سلسلة أيام', value: '5 🔥', icon: '' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 14,
            padding: '14px 18px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: 90,
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>{stat.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* XP Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.9 }}
        style={{ width: '100%', maxWidth: 320 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
          <span>المستوى 4</span>
          <span>285 / 400 XP</span>
        </div>
        <div style={{ height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: '50%' }}
            animate={active ? { width: '71%' } : { width: '50%' }}
            transition={{ delay: 1, duration: 1.2, ease: 'easeOut' }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${PURPLE}, ${GOLD})`, borderRadius: 99 }}
          />
        </div>
        <p style={{ color: GOLD, fontSize: 12, marginTop: 6, textAlign: 'center' }}>
          ✨ +85 XP — اقتربت من المستوى 5!
        </p>
      </motion.div>
    </div>
  );
}

// ─── Speech Bubble ────────────────────────────────────────────────────────────

function SpeechBubble({ text, isRtl }: { text: string; isRtl: boolean }) {
  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        background: 'white',
        borderRadius: 18,
        padding: '14px 18px',
        maxWidth: 240,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        position: 'relative',
        direction: isRtl ? 'rtl' : 'ltr',
      }}
    >
      {/* Tail pointing down toward Xbot */}
      <div style={{
        position: 'absolute',
        bottom: -14,
        [isRtl ? 'right' : 'left']: 24,
        width: 0,
        height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '14px solid white',
      }} />
      <p style={{ color: '#1F2937', fontSize: 13.5, fontWeight: 600, lineHeight: 1.7, whiteSpace: 'pre-line', margin: 0 }}>
        {text}
      </p>
    </motion.div>
  );
}

// ─── Main Demo ────────────────────────────────────────────────────────────────

export default function ChildJourneyClient({ locale }: { locale: string }) {
  const isRtl = locale === 'ar';
  const [scene, setScene] = useState<Scene>('welcome');
  const [activityDone, setActivityDone] = useState(false);
  const [activityScore, setActivityScore] = useState<number | null>(null);

  const sceneIdx = SCENES.indexOf(scene);
  const meta = SCENE_META[scene];

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

  function handleActivityComplete(score: number) {
    setActivityScore(score);
    setActivityDone(true);
    setTimeout(() => setScene('reward'), 1200);
  }

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        background: BG,
        fontFamily: isRtl ? '"Noto Sans Arabic", system-ui, sans-serif' : 'system-ui, sans-serif',
        color: 'white',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Stars background ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ delay: i * 0.1, duration: 2 + (i % 4), repeat: Infinity }}
            style={{
              position: 'absolute',
              width: i % 5 === 0 ? 3 : 1.5,
              height: i % 5 === 0 ? 3 : 1.5,
              borderRadius: '50%',
              background: 'white',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* ── Top nav bar ── */}
      <div style={{
        position: 'fixed',
        top: 0,
        insetInline: 0,
        zIndex: 50,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        backdropFilter: 'blur(12px)',
        background: 'rgba(2,6,23,0.7)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginInlineEnd: 'auto' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            🤖
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: PURPLE_LIGHT }}>ذكاوي</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: 99 }}>
            DEV DEMO
          </span>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${PURPLE}, #6D28D9)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            👦
          </div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>أحمد</span>
          <span style={{ fontSize: 11, color: GOLD }}>Lv.4</span>
        </div>

        {/* XP mini bar */}
        <div style={{ width: 120 }}>
          <XPBar xp={200} maxXp={400} />
        </div>
      </div>

      {/* ── Step indicator ── */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}>
        {/* Dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {SCENES.map((s, i) => (
            <button
              key={s}
              onClick={() => setScene(s)}
              style={{
                width: s === scene ? 28 : 8,
                height: 8,
                borderRadius: 99,
                background: s === scene ? GOLD : 'rgba(255,255,255,0.25)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
              title={SCENE_META[s].label}
            />
          ))}
        </div>
        {/* Arrows */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={goPrev}
            disabled={sceneIdx === 0}
            style={{
              padding: '8px 20px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)',
              color: sceneIdx === 0 ? 'rgba(255,255,255,0.2)' : 'white',
              fontSize: 14,
              cursor: sceneIdx === 0 ? 'not-allowed' : 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            {isRtl ? 'التالي ←' : '← Prev'}
          </button>
          <button
            onClick={goNext}
            disabled={sceneIdx === SCENES.length - 1}
            style={{
              padding: '8px 20px',
              borderRadius: 12,
              border: `1px solid ${GOLD}55`,
              background: sceneIdx < SCENES.length - 1 ? `linear-gradient(135deg, ${PURPLE}, #6D28D9)` : 'rgba(255,255,255,0.06)',
              color: sceneIdx === SCENES.length - 1 ? 'rgba(255,255,255,0.2)' : 'white',
              fontSize: 14,
              cursor: sceneIdx === SCENES.length - 1 ? 'not-allowed' : 'pointer',
              backdropFilter: 'blur(8px)',
              fontWeight: 600,
            }}
          >
            {isRtl ? '→ السابق' : 'Next →'}
          </button>
        </div>
      </div>

      {/* ── Main content area ── */}
      <div style={{
        minHeight: '100vh',
        paddingTop: 72,
        paddingBottom: 100,
        paddingInline: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            initial={{ opacity: 0, x: isRtl ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? 40 : -40 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            style={{
              width: '100%',
              maxWidth: 900,
              display: 'grid',
              gridTemplateColumns: scene === 'activity' || scene === 'reward' ? '1fr' : '1fr 1fr',
              gap: 32,
              alignItems: 'center',
            }}
          >
            {/* ── LEFT: Content ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Scene label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 6, height: 24,
                  borderRadius: 3,
                  background: `linear-gradient(to bottom, ${PURPLE}, ${GOLD})`,
                }} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                  {sceneIdx + 1} / {SCENES.length} — {meta.label}
                </span>
              </div>

              {/* Scene-specific content */}
              {scene === 'welcome' && (
                <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.3, margin: 0 }}>
                    <span style={{ color: PURPLE_LIGHT }}>أهلاً،</span>{' '}
                    أحمد! 👋
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 1.8 }}>
                    مرحباً في <strong style={{ color: PURPLE_LIGHT }}>ذكاوي</strong> — منصتك الذكية للتعلم.
                    <br />
                    معك اليوم <strong style={{ color: GOLD }}>Xbot</strong>، معلمك الذكي الشخصي.
                    <br />
                    سنتعلم البرمجة معاً بطريقة ممتعة وتفاعلية! 🚀
                  </p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {['🎯 تكيّفي مع عمرك', '🤖 Xbot يشرح لك', '🏆 اربح XP', '📊 تقرير للوالدين'].map(tag => (
                      <span key={tag} style={{
                        padding: '6px 14px',
                        borderRadius: 99,
                        background: 'rgba(124,58,237,0.2)',
                        border: `1px solid ${PURPLE}44`,
                        fontSize: 12,
                        color: PURPLE_LIGHT,
                        fontWeight: 600,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={goNext}
                    style={{
                      padding: '14px 28px',
                      borderRadius: 16,
                      border: 'none',
                      background: `linear-gradient(135deg, ${PURPLE}, #6D28D9)`,
                      color: 'white',
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: 'pointer',
                      alignSelf: 'flex-start',
                      boxShadow: `0 4px 20px ${PURPLE}55`,
                    }}
                  >
                    🚀 ابدأ رحلتك
                  </motion.button>
                </motion.div>
              )}

              {scene === 'dashboard' && (
                <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>لوحة تحكمك</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>
                      استكشف Explorer — عمرك 10 سنوات
                    </p>
                  </div>
                  <XPBar xp={200} maxXp={400} />
                  <p style={{ color: PURPLE_LIGHT, fontSize: 13, fontWeight: 600, margin: 0 }}>
                    🏝️ جزرك التعليمية — اختر مغامرتك
                  </p>
                  <IslandGrid active={scene === 'dashboard'} />
                </motion.div>
              )}

              {scene === 'lesson' && <LessonCard active={scene === 'lesson'} />}

              {scene === 'activity' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>النشاط التفاعلي 🎯</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>
                      صل كل مفهوم بتعريفه الصحيح
                    </p>
                  </div>
                  <div style={{
                    background: 'white',
                    borderRadius: 20,
                    padding: 20,
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#1F2937',
                  }}>
                    {activityDone ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{ textAlign: 'center', padding: '20px 0' }}
                      >
                        <div style={{ fontSize: 60 }}>🎉</div>
                        <p style={{ color: GOLD, fontWeight: 800, fontSize: 20 }}>
                          نتيجتك: {activityScore}%
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                          انتقلنا للمكافأة...
                        </p>
                      </motion.div>
                    ) : (
                      <MatchActivity
                        items={MATCH_ITEMS}
                        locale={locale}
                        onComplete={handleActivityComplete}
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {scene === 'reward' && <RewardScene active={scene === 'reward'} />}
            </div>

            {/* ── RIGHT: Xbot 3D ── (hidden in full-width activity scene) */}
            {scene !== 'activity' && scene !== 'reward' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0,
                order: isRtl ? -1 : 1,
              }}>
                {/* Speech bubble */}
                <AnimatePresence mode="wait">
                  <SpeechBubble key={scene} text={meta.bubble} isRtl={isRtl} />
                </AnimatePresence>

                {/* Xbot 3D */}
                <motion.div
                  animate={meta.mood === 'happy' ? { y: [0, -8, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  style={{
                    filter: `drop-shadow(0 0 30px ${PURPLE}55)`,
                    marginTop: 16,
                  }}
                >
                  <XbotExpressive
                    mood={meta.mood}
                    width={280}
                    height={380}
                  />
                </motion.div>

                {/* Mood label */}
                <div style={{
                  marginTop: -8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255,255,255,0.06)',
                  padding: '5px 14px',
                  borderRadius: 99,
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.5)',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                  Xbot — {meta.mood}
                </div>
              </div>
            )}

            {/* ── Xbot in corner for reward/activity scenes ── */}
            {(scene === 'reward') && (
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  position: 'fixed',
                  bottom: 100,
                  insetInlineEnd: 24,
                  zIndex: 40,
                  filter: `drop-shadow(0 0 20px ${GOLD}44)`,
                }}
              >
                <XbotExpressive mood="happy" width={150} height={200} />
              </motion.div>
            )}
            {(scene === 'activity') && (
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  position: 'fixed',
                  bottom: 100,
                  insetInlineEnd: 24,
                  zIndex: 40,
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -50, right: 0, left: 0 }}>
                    <SpeechBubble text="فكّر معي! 🤔" isRtl={isRtl} />
                  </div>
                  <XbotExpressive mood="thinking" width={130} height={180} />
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
