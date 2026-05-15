'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import XpBar from '@/components/dashboard/xp-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, BookOpen, Trophy, Target, ChevronRight, Lock, CheckCircle2, Clock, Bot, Lightbulb, GraduationCap, Layers } from 'lucide-react';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import type { SubjectRow } from '@/lib/db/queries/content';

interface Achievement {
  id: string;
  icon: string;
  name: string;
  description: string;
  earned: boolean;
}

interface LessonSummary {
  id: string;
  title: string;
  estimatedMinutes: number;
  xpReward: number;
}

interface UserProgress {
  completedLessons: string[];
  totalXp: number;
  streakDays: number;
  quizzesCompleted: number;
  scores: Record<string, number>;
  achievements: Achievement[];
}

interface Props {
  userName: string;
  progress: UserProgress;
  lessons: LessonSummary[];
  lessonOrder: string[] | null;
  subjects: SubjectRow[];
}

export default function DashboardClient({ userName, progress, lessons, lessonOrder, subjects }: Props) {
  const t = useTranslations('dashboard');
  const tL = useTranslations('lessons');
  const tS = useTranslations('subjects');
  const [mounted] = useState(true);

  if (!mounted) return null;

  const claudeLessons = lessonOrder
    ? lessonOrder.map(id => lessons.find(l => l.id === id)).filter(Boolean) as LessonSummary[]
    : lessons;
  const agentProgress = lessons.length > 0 ? (progress.completedLessons.length / lessons.length) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="bg-gradient-to-r from-[var(--zkawi-purple)] to-indigo-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
              <Bot size={96} className="absolute top-0 end-0 opacity-10 translate-x-4 -translate-y-4" />
              <div className="relative">
                <p className="text-purple-200 text-sm font-medium mb-1">{t('welcomeBack')}</p>
                <h1 className="text-2xl md:text-3xl font-black mb-2">{t('welcome')}, {userName}!</h1>
                <p className="text-purple-200 text-sm">{t('motivational')}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <XpBar totalXp={progress.totalXp} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                {[
                  { icon: <Flame className="text-orange-500" size={20} />, value: progress.streakDays, label: t('stats.streak'), suffix: ` ${t('streak.days')}`, border: 'border-orange-500/30' },
                  { icon: <BookOpen className="text-[var(--zkawi-purple)]" size={20} />, value: progress.completedLessons.length, label: t('stats.lessonsCompleted'), suffix: '', border: 'border-[var(--zkawi-purple)]/30' },
                  { icon: <Target className="text-[var(--zkawi-green)]" size={20} />, value: progress.quizzesCompleted, label: t('stats.quizzesCompleted'), suffix: '', border: 'border-[var(--zkawi-green)]/30' },
                  { icon: <Trophy className="text-[var(--zkawi-gold)]" size={20} />, value: progress.achievements.filter(a => a.earned).length, label: t('stats.achievements'), suffix: '', border: 'border-[var(--zkawi-gold)]/30' },
                ].map((stat, i) => (
                  <div key={i} className={`bg-[var(--surface)] border ${stat.border} rounded-2xl p-4 text-center`}>
                    <div className="flex justify-center mb-2">{stat.icon}</div>
                    <div className="text-2xl font-black text-[var(--text)]">{stat.value}{stat.suffix}</div>
                    <div className="text-xs text-[var(--text-muted)] font-medium mt-1">{stat.label}</div>
                  </div>
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="flex items-center gap-2 text-lg font-black text-[var(--text)]">
                      <GraduationCap size={20} className="text-[var(--zkawi-purple)]" />
                      {t('agents.title')}
                    </h2>
                  </div>
                  <div className="bg-[var(--bg-secondary)] border border-[var(--zkawi-purple)]/25 rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-[var(--zkawi-purple)] to-[var(--zkawi-purple-dark)] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[var(--zkawi-purple)]/20 text-white">
                        <Bot size={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-black text-[var(--text)]">Claude</h3>
                          <Badge variant="default">{t('agents.badgeActive')}</Badge>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] mb-3">
                          {t('agents.lessonsProgress', { completed: progress.completedLessons.length, total: lessons.length })}
                        </p>
                        <Progress value={agentProgress} colorScheme="purple" className="mb-3 h-2" />
                        <Link href="/agents/claude">
                          <Button size="sm" className="gap-2">
                            {progress.completedLessons.length > 0 ? t('agents.continueLearning') : t('agents.startLearning')}
                            <ChevronRight size={14} className="flip-rtl" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="p-6">
                  <h2 className="flex items-center gap-2 text-lg font-black text-[var(--text)] mb-4">
                    <BookOpen size={20} className="text-[var(--zkawi-purple)]" />
                    {t('lessons.title')}
                  </h2>
                  <div className="space-y-3">
                    {claudeLessons.slice(0, 3).map((lesson) => {
                      const isCompleted = progress.completedLessons.includes(lesson.id);
                      return (
                        <Link key={lesson.id} href={`/agents/claude/lessons/${lesson.id}`}>
                          <div className={`flex items-center gap-3 p-3 rounded-2xl transition-all hover:scale-[1.01] cursor-pointer ${
                            isCompleted
                              ? 'bg-[var(--zkawi-green)]/10 border border-[var(--zkawi-green)]/30'
                              : 'bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--zkawi-purple-light)] hover:bg-[var(--bg-secondary)]'
                          }`}>
                            <div className="w-10 h-10 flex items-center justify-center bg-[var(--surface)] rounded-xl shadow-sm text-[var(--zkawi-purple)]">
                              <BookOpen size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm text-[var(--text)] truncate">{lesson.title}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Clock size={11} className="text-[var(--text-muted)]" />
                                <span className="text-xs text-[var(--text-muted)]">{lesson.estimatedMinutes} {tL('minutes')}</span>
                                <span className="text-xs text-[var(--zkawi-purple)] font-bold">+{lesson.xpReward} XP</span>
                              </div>
                            </div>
                            <div>
                              {isCompleted
                                ? <CheckCircle2 size={20} className="text-[var(--zkawi-green)]" />
                                : <ChevronRight size={16} className="text-[var(--text-muted)] flip-rtl" />}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    <Link href="/agents/claude">
                      <div className="text-center pt-2">
                        <span className="text-sm text-[var(--zkawi-purple)] font-bold hover:opacity-80">
                          {t('lessons.viewAll', { count: lessons.length })}
                        </span>
                      </div>
                    </Link>
                  </div>
                </Card>
              </motion.div>
              {/* Subjects mini section */}
              {subjects.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="flex items-center gap-2 text-lg font-black text-[var(--text)]">
                        <Layers size={20} className="text-[var(--zkawi-purple)]" />
                        {tS('title')}
                      </h2>
                      <Link href="/subjects">
                        <span className="text-sm text-[var(--zkawi-purple)] font-bold hover:opacity-80">
                          {tS('allCourses')} →
                        </span>
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {subjects.slice(0, 3).map((subject) => (
                        <Link key={subject.id} href={`/subjects/${subject.slug}`}>
                          <div
                            className="rounded-2xl border-2 p-3 transition-all hover:scale-[1.02] text-center"
                            style={{
                              borderColor: subject.color + '30',
                              background: subject.color + '08',
                            }}
                          >
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                              style={{ background: subject.color + '20', color: subject.color }}
                            >
                              <DynamicIcon name={subject.icon} size={18} />
                            </div>
                            <p className="text-xs font-black text-[var(--text)] truncate">{subject.name}</p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                              {subject.courseCount} {tS('courses')}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>

            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Card className="p-6">
                  <h2 className="flex items-center gap-2 text-lg font-black text-[var(--text)] mb-4">
                    <Trophy size={20} className="text-[var(--zkawi-gold)]" />
                    {t('achievements.title')}
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {progress.achievements.map((achievement) => (
                      <motion.div
                        key={achievement.id}
                        whileHover={{ scale: 1.1 }}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center cursor-default transition-all ${
                          achievement.earned
                            ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/40 shadow-sm achievement-glow'
                            : 'bg-[var(--surface-2)] border-2 border-[var(--border)] opacity-50'
                        }`}
                        title={achievement.name}
                      >
                        <DynamicIcon name={achievement.icon} size={22} />
                        <span className="text-[9px] font-bold text-[var(--text-muted)] mt-1 leading-tight">
                          {achievement.name}
                        </span>
                        {!achievement.earned && <Lock size={10} className="text-[var(--text-muted)] mt-0.5" />}
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] text-center mt-3">
                    {t('achievements.count', { earned: progress.achievements.filter(a => a.earned).length, total: progress.achievements.length })}
                  </p>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <Card className="p-6 border-orange-500/30">
                  <div className="text-center">
                    <Flame size={40} className="mx-auto mb-2 text-orange-500" />
                    <div className="text-3xl font-black text-orange-500 mb-1">{progress.streakDays}</div>
                    <div className="text-sm font-bold text-[var(--text)] mb-2">{t('streak.current')}</div>
                    <p className="text-xs text-[var(--text-muted)]">{t('streak.keepGoing')}</p>
                    <div className="flex justify-center gap-1.5 mt-4">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                            i < progress.streakDays ? 'bg-orange-400 text-white font-bold' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                          }`}
                        >
                          {i < progress.streakDays ? <Flame size={14} className="mx-auto" /> : <span className="text-[10px]">○</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <Card className="p-6 border-[var(--zkawi-purple)]/25">
                  <div className="text-center">
                    <Lightbulb size={32} className="mx-auto mb-2 text-[var(--zkawi-purple)]" />
                    <h3 className="font-black text-[var(--text)] mb-2 text-sm">{t('tip.title')}</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{t('tip.body')}</p>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
