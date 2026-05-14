'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import XpBar from '@/components/dashboard/xp-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, BookOpen, Trophy, Target, ChevronRight, Lock, CheckCircle2, Clock } from 'lucide-react';
import { agents, getLessonsByAgent } from '@/lib/content/claude-lessons';
import { useRouter } from '@/lib/i18n/navigation';

interface UserProgress {
  completedLessons: number[];
  totalXp: number;
  streakDays: number;
  quizzesCompleted: number;
}

const DEMO_ACHIEVEMENTS = [
  { id: 1, emoji: '🎯', nameAr: 'الخطوة الأولى', nameEn: 'First Step', earned: true },
  { id: 2, emoji: '🔥', nameAr: '3 أيام ناري', nameEn: '3-Day Streak', earned: false },
  { id: 3, emoji: '🏆', nameAr: 'ملك الكويز', nameEn: 'Quiz Master', earned: false },
  { id: 4, emoji: '⭐', nameAr: 'بداية قوية', nameEn: 'Strong Start', earned: true },
  { id: 5, emoji: '🌟', nameAr: 'المستكشف', nameEn: 'Explorer', earned: false },
  { id: 6, emoji: '💎', nameAr: 'خبير ذكاوي', nameEn: 'Zkawi Expert', earned: false },
];

function getStoredProgress(): UserProgress {
  if (typeof window === 'undefined') return { completedLessons: [], totalXp: 0, streakDays: 1, quizzesCompleted: 0 };
  try {
    const stored = localStorage.getItem('zkawi_progress');
    if (stored) return JSON.parse(stored);
  } catch {}
  return { completedLessons: [], totalXp: 0, streakDays: 1, quizzesCompleted: 0 };
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress>({ completedLessons: [], totalXp: 0, streakDays: 1, quizzesCompleted: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProgress(getStoredProgress());
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  if (isPending || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F0]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">⚡</div>
          <p className="text-purple-600 font-bold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const claudeLessons = getLessonsByAgent('claude');
  const agentProgress = (progress.completedLessons.length / claudeLessons.length) * 100;

  const userName = session.user?.name || 'صديقي';

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 end-0 text-8xl opacity-20 translate-x-4 -translate-y-4">🤖</div>
              <div className="relative">
                <p className="text-purple-200 text-sm font-medium mb-1">
                  {t('welcomeBack')} 👋
                </p>
                <h1 className="text-2xl md:text-3xl font-black mb-2">
                  {t('welcome')}, {userName}!
                </h1>
                <p className="text-purple-200 text-sm">
                  كمل تعلمك النهارده وكسب XP جديدة! 🚀
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* XP Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <XpBar totalXp={progress.totalXp} />
              </motion.div>

              {/* Stats grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                {[
                  {
                    icon: <Flame className="text-orange-500" size={20} />,
                    value: progress.streakDays,
                    label: t('stats.streak'),
                    suffix: locale === 'ar' ? ' يوم 🔥' : ' days 🔥',
                    bg: 'bg-orange-50',
                    border: 'border-orange-200',
                  },
                  {
                    icon: <BookOpen className="text-purple-500" size={20} />,
                    value: progress.completedLessons.length,
                    label: t('stats.lessonsCompleted'),
                    suffix: '',
                    bg: 'bg-purple-50',
                    border: 'border-purple-200',
                  },
                  {
                    icon: <Target className="text-emerald-500" size={20} />,
                    value: progress.quizzesCompleted,
                    label: t('stats.quizzesCompleted'),
                    suffix: '',
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-200',
                  },
                  {
                    icon: <Trophy className="text-amber-500" size={20} />,
                    value: DEMO_ACHIEVEMENTS.filter(a => a.earned).length,
                    label: 'إنجازات',
                    suffix: '',
                    bg: 'bg-amber-50',
                    border: 'border-amber-200',
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={`${stat.bg} border ${stat.border} rounded-2xl p-4 text-center`}
                  >
                    <div className="flex justify-center mb-2">{stat.icon}</div>
                    <div className="text-2xl font-black text-gray-800">
                      {stat.value}{stat.suffix}
                    </div>
                    <div className="text-xs text-gray-500 font-medium mt-1">{stat.label}</div>
                  </div>
                ))}
              </motion.div>

              {/* Continue Learning */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-black text-gray-800">
                      {t('agents.title')} 🎓
                    </h2>
                  </div>

                  {/* Claude agent card */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-purple-200">
                        🤖
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-black text-gray-800">Claude</h3>
                          <Badge variant="default">متاح الآن</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">
                          {progress.completedLessons.length} / {claudeLessons.length} دروس اتكملت
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

              {/* Recent Lessons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6">
                  <h2 className="text-lg font-black text-gray-800 mb-4">
                    دروس Claude 📚
                  </h2>
                  <div className="space-y-3">
                    {claudeLessons.slice(0, 3).map((lesson) => {
                      const isCompleted = progress.completedLessons.includes(lesson.id);
                      return (
                        <Link key={lesson.id} href={`/agents/claude/lessons/${lesson.id}`}>
                          <div className={`flex items-center gap-3 p-3 rounded-2xl transition-all hover:scale-[1.01] cursor-pointer ${
                            isCompleted
                              ? 'bg-emerald-50 border border-emerald-200'
                              : 'bg-gray-50 border border-gray-200 hover:border-purple-200 hover:bg-purple-50'
                          }`}>
                            <div className="text-2xl w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm">
                              {lesson.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm text-gray-800 truncate">
                                {locale === 'ar' ? lesson.titleAr : lesson.titleEn}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Clock size={11} className="text-gray-400" />
                                <span className="text-xs text-gray-400">{lesson.estimatedMinutes} دقيقة</span>
                                <span className="text-xs text-purple-500 font-bold">+{lesson.xpReward} XP</span>
                              </div>
                            </div>
                            <div>
                              {isCompleted ? (
                                <CheckCircle2 size={20} className="text-emerald-500" />
                              ) : (
                                <ChevronRight size={16} className="text-gray-400 flip-rtl" />
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    <Link href="/agents/claude">
                      <div className="text-center pt-2">
                        <span className="text-sm text-purple-600 font-bold hover:text-purple-800">
                          شوف كل الدروس ({claudeLessons.length}) →
                        </span>
                      </div>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Right column - Achievements */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <h2 className="text-lg font-black text-gray-800 mb-4">
                    {t('achievements.title')} 🏆
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {DEMO_ACHIEVEMENTS.map((achievement) => (
                      <motion.div
                        key={achievement.id}
                        whileHover={{ scale: 1.1 }}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center cursor-default transition-all ${
                          achievement.earned
                            ? 'bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 shadow-sm achievement-glow'
                            : 'bg-gray-100 border-2 border-gray-200 opacity-50'
                        }`}
                        title={locale === 'ar' ? achievement.nameAr : achievement.nameEn}
                      >
                        <span className="text-2xl">{achievement.emoji}</span>
                        <span className="text-[9px] font-bold text-gray-600 mt-1 leading-tight">
                          {locale === 'ar' ? achievement.nameAr : achievement.nameEn}
                        </span>
                        {!achievement.earned && (
                          <Lock size={10} className="text-gray-400 mt-0.5" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    {DEMO_ACHIEVEMENTS.filter(a => a.earned).length} / {DEMO_ACHIEVEMENTS.length} إنجازات
                  </p>
                </Card>
              </motion.div>

              {/* Streak card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔥</div>
                    <div className="text-3xl font-black text-orange-500 mb-1">
                      {progress.streakDays}
                    </div>
                    <div className="text-sm font-bold text-gray-600 mb-2">
                      {t('streak.current')}
                    </div>
                    <p className="text-xs text-gray-500">
                      {t('streak.keepGoing')}
                    </p>
                    {/* Streak calendar */}
                    <div className="flex justify-center gap-1.5 mt-4">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                            i < progress.streakDays
                              ? 'bg-orange-400 text-white font-bold'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {i < progress.streakDays ? '🔥' : '○'}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Quick tip */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <div className="text-center">
                    <div className="text-3xl mb-2">💡</div>
                    <h3 className="font-black text-gray-800 mb-2 text-sm">نصيحة اليوم</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      اتعلم لو 15 دقيقة بس كل يوم وهتشوف نتايج مذهلة خلال أسبوع! 🌟
                    </p>
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
