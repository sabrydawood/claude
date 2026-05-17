'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Users,
  User,
  Bot,
  Star,
  Zap,
  CheckCircle2,
  MessageSquare,
  Trophy,
  BookOpen,
  Target,
  Award,
} from 'lucide-react';
import type { RobotMood } from '@/components/mascot-gltf';

// ─── Dynamic import (Canvas = client-only) ────────────────────────────────────

const XbotExpressive = dynamic(
  () => import('@/components/mascot-gltf').then(m => ({ default: m.XbotExpressive })),
  { ssr: false, loading: () => <div style={{ width: 220, height: 300 }} /> }
);

// ─── Types ────────────────────────────────────────────────────────────────────

type StudentStatus = 'active' | 'thinking' | 'struggling' | 'offline';
type ActionType = 'explaining' | 'questioning' | 'praising' | 'peer-teaching';

interface Student {
  id: string;
  name: string;
  mastery: number;
  xp: number;
  level: number;
  status: StudentStatus;
  streak: number;
}

interface Phase {
  id: number;
  mood: RobotMood;
  bubble: string;
  directed: string | null;
  action: ActionType;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STUDENTS: Student[] = [
  { id: '1', name: 'أحمد',  mastery: 92, xp: 1240, level: 8, status: 'active',     streak: 5 },
  { id: '2', name: 'سارة',  mastery: 78, xp: 890,  level: 6, status: 'thinking',   streak: 3 },
  { id: '3', name: 'محمد',  mastery: 61, xp: 650,  level: 5, status: 'struggling', streak: 1 },
  { id: '4', name: 'ليلى',  mastery: 85, xp: 1050, level: 7, status: 'active',     streak: 7 },
  { id: '5', name: 'يوسف',  mastery: 45, xp: 420,  level: 4, status: 'offline',    streak: 0 },
  { id: '6', name: 'نور',   mastery: 73, xp: 780,  level: 6, status: 'thinking',   streak: 4 },
];

const PHASES: Phase[] = [
  {
    id: 0,
    mood: 'talking',
    bubble: 'اليوم نتعلم الحلقات معاً!\nالحلقة تكرر كوداً عدة مرات.',
    directed: null,
    action: 'explaining',
  },
  {
    id: 1,
    mood: 'happy',
    bubble: 'أحمد — ما الفرق بين for و while؟',
    directed: '1',
    action: 'questioning',
  },
  {
    id: 2,
    mood: 'happy',
    bubble: 'إجابة ممتازة يا أحمد! 5 نقاط لك.',
    directed: '1',
    action: 'praising',
  },
  {
    id: 3,
    mood: 'talking',
    bubble: 'الآن — متى نستخدم break؟',
    directed: null,
    action: 'explaining',
  },
  {
    id: 4,
    mood: 'thinking',
    bubble: 'سارة — هل يمكنك مساعدة محمد في فهم break؟',
    directed: '2',
    action: 'peer-teaching',
  },
  {
    id: 5,
    mood: 'happy',
    bubble: 'رائع! كلاهما يفهم الآن. +10 XP لسارة.',
    directed: '2',
    action: 'praising',
  },
];

// ─── Action metadata ──────────────────────────────────────────────────────────

const ACTION_META: Record<ActionType, { icon: React.ReactNode; label: string }> = {
  explaining:    { icon: <BookOpen size={14} />,    label: 'Xbot يشرح للجميع' },
  questioning:   { icon: <MessageSquare size={14} />, label: 'Xbot يسأل طالباً' },
  praising:      { icon: <Award size={14} />,       label: 'Xbot يشجع' },
  'peer-teaching': { icon: <Users size={14} />,      label: 'تعليم الأقران' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLevelColor(level: number): string {
  if (level >= 7) return '#7C3AED';  // purple — high
  if (level >= 5) return '#3B82F6';  // blue — mid
  return '#6B7280';                   // gray — struggling
}

function getMasteryBarColor(mastery: number): string {
  if (mastery >= 80) return '#10B981';
  if (mastery >= 60) return '#F59E0B';
  return '#EF4444';
}

// ─── Status indicator ─────────────────────────────────────────────────────────

function StatusDot({ status }: { status: StudentStatus }) {
  const configs: Record<StudentStatus, { dotClass: string; pulse: boolean; label: string }> = {
    active:     { dotClass: 'bg-emerald-400', pulse: true,  label: 'يتعلم' },
    thinking:   { dotClass: 'bg-amber-400',   pulse: true,  label: 'يفكر' },
    struggling: { dotClass: 'bg-red-400',     pulse: false, label: 'يحتاج مساعدة' },
    offline:    { dotClass: 'bg-slate-500',   pulse: false, label: 'غير متصل' },
  };
  const cfg = configs[status];
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        {cfg.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dotClass}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dotClass}`} />
      </span>
      <span className="text-xs text-white/50">{cfg.label}</span>
    </div>
  );
}

// ─── Student Card ─────────────────────────────────────────────────────────────

function StudentCard({ student, isDirected }: { student: Student; isDirected: boolean }) {
  const levelColor = getLevelColor(student.level);
  const masteryColor = getMasteryBarColor(student.mastery);

  return (
    <motion.div
      animate={isDirected ? { scale: 1.03 } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      className={[
        'bg-white/5 border border-white/10 rounded-2xl p-4 transition-all duration-500 flex flex-col gap-3',
        isDirected ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-400/30 border-amber-400/40' : '',
      ].join(' ')}
    >
      {/* Avatar + name row */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: `${levelColor}33`, border: `2px solid ${levelColor}66` }}
        >
          <User size={20} style={{ color: levelColor }} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-white leading-none">{student.name}</span>
          <span className="text-xs text-purple-400 mt-0.5">Lv.{student.level}</span>
        </div>
        {isDirected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ms-auto"
          >
            <Star size={14} className="text-amber-400 fill-amber-400" />
          </motion.div>
        )}
      </div>

      {/* Mastery bar */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-white/40">إتقان</span>
          <span className="text-xs text-white/50">{student.mastery}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${student.mastery}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: masteryColor }}
          />
        </div>
      </div>

      {/* Status + XP row */}
      <div className="flex items-center justify-between">
        <StatusDot status={student.status} />
        <span className="text-xs text-amber-400 font-semibold">{student.xp.toLocaleString()} XP</span>
      </div>

      {/* Streak */}
      {student.streak > 0 && (
        <div className="flex items-center gap-1 text-xs text-orange-400">
          <Zap size={11} />
          <span>{student.streak} يوم متواصل</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Speech Bubble ────────────────────────────────────────────────────────────

function SpeechBubble({ text }: { text: string }) {
  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative bg-white rounded-2xl p-3 shadow-2xl max-w-[240px] text-center"
    >
      <p className="text-slate-800 text-sm font-semibold leading-relaxed whitespace-pre-line m-0">
        {text}
      </p>
      {/* Bubble tail */}
      <div
        className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: '14px solid white',
        }}
      />
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClassroomClient({ locale }: { locale: string }) {
  const isRtl = locale === 'ar';
  const [phaseIdx, setPhaseIdx] = useState(0);

  // Auto-advance every 4 seconds
  useEffect(() => {
    const t = setInterval(() => setPhaseIdx(i => (i + 1) % PHASES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const phase = PHASES[phaseIdx];
  const xbotMood = phase.mood;
  const action = ACTION_META[phase.action];

  // Split students: left column = first 3, right column = last 3
  const leftStudents = STUDENTS.slice(0, 3);
  const rightStudents = STUDENTS.slice(3, 6);

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white"
    >
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center shrink-0">
          <Bot size={18} />
        </div>
        <div>
          <h1 className="text-lg font-black text-white leading-none">فصل الحلقات — درس تفاعلي ذكي</h1>
          <p className="text-xs text-white/40 mt-0.5">Classroom AI — نظام إدارة الفصل الذكي</p>
        </div>
        <div className="ms-auto flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/30">
            DEV
          </span>
          <span className="text-xs text-white/30 hidden sm:inline">Ctrl+Shift+D للقائمة</span>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* ── Stats bar ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { icon: <Users size={14} />,    text: '6 طلاب متصلون' },
            { icon: <Target size={14} />,   text: '78% متوسط الإتقان' },
            { icon: <Zap size={14} />,      text: 'الحلقات — الدرس الحالي' },
            { icon: <Trophy size={14} />,   text: 'الجلسة 3/5' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-white/70"
            >
              <span className="text-purple-400 shrink-0">{stat.icon}</span>
              <span className="truncate">{stat.text}</span>
            </div>
          ))}
        </div>

        {/* ── 3-column grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* Left column: first 3 students */}
          <div className="flex flex-col gap-3">
            <p className="text-xs text-white/30 font-semibold uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircle2 size={11} />
              المجموعة أ
            </p>
            {leftStudents.map(s => (
              <StudentCard key={s.id} student={s} isDirected={phase.directed === s.id} />
            ))}
          </div>

          {/* Center: Xbot + lesson info */}
          <div className="flex flex-col items-center gap-4">
            {/* Xbot + speech bubble */}
            <div className="flex flex-col items-center gap-0 w-full">
              {/* Speech bubble */}
              <AnimatePresence mode="wait">
                <SpeechBubble key={phaseIdx} text={phase.bubble} />
              </AnimatePresence>

              {/* Xbot 3D */}
              <motion.div
                animate={xbotMood === 'happy' ? { y: [0, -6, 0] } : {}}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="mt-4 drop-shadow-[0_0_30px_#7C3AED55]"
              >
                <XbotExpressive mood={xbotMood} width={220} height={300} />
              </motion.div>

              {/* Mood label */}
              <div className="flex items-center gap-1.5 mt-1 text-xs text-white/30 bg-white/5 px-3 py-1 rounded-full">
                <Bot size={10} />
                Xbot — {xbotMood}
              </div>
            </div>

            {/* Lesson progress */}
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50 font-semibold">تقدم الدرس</span>
                <span className="text-xs text-purple-400">{phaseIdx + 1}/{PHASES.length}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${((phaseIdx + 1) / PHASES.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple-600 to-amber-400 rounded-full"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {PHASES.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setPhaseIdx(i)}
                    className={[
                      'w-2 h-2 rounded-full transition-all duration-300',
                      i === phaseIdx ? 'bg-amber-400 scale-125' : 'bg-white/20 hover:bg-white/40',
                    ].join(' ')}
                    title={`المرحلة ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right column: last 3 students */}
          <div className="flex flex-col gap-3">
            <p className="text-xs text-white/30 font-semibold uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircle2 size={11} />
              المجموعة ب
            </p>
            {rightStudents.map(s => (
              <StudentCard key={s.id} student={s} isDirected={phase.directed === s.id} />
            ))}
          </div>
        </div>

        {/* ── Bottom bar: Xbot status ────────────────────────────────────────── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-purple-400" />
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white/70">
              <span className="text-purple-400 flex items-center">{action.icon}</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={phase.action}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="font-semibold"
                >
                  {action.label}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Phase dots */}
          <div className="flex items-center gap-1.5">
            {PHASES.map((_, i) => (
              <span
                key={i}
                className={[
                  'rounded-full transition-all duration-300',
                  i === phaseIdx ? 'w-6 h-2 bg-amber-400' : 'w-2 h-2 bg-white/20',
                ].join(' ')}
              />
            ))}
          </div>

          {/* Student count */}
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Users size={12} />
            <span>{STUDENTS.filter(s => s.status !== 'offline').length} / {STUDENTS.length} متصل</span>
          </div>
        </div>
      </div>
    </div>
  );
}
