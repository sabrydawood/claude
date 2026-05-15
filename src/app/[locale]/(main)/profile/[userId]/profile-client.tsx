'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Trophy, Flame, BookOpen, Star, Calendar, Frown } from 'lucide-react';
import { DynamicIcon } from '@/components/ui/dynamic-icon';

interface ProfileData {
  user: { id: string; name: string; image: string | null; memberSince: string };
  stats: { totalXp: number; streakDays: number; lessonsCompleted: number; quizzesCompleted: number };
  achievements: { id: string; icon: string; name: string; earnedAt: string }[];
}

export default function ProfileClient({ data }: { data: ProfileData | null }) {
  const t = useTranslations('profile');

  if (!data) return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center gap-3">
        <Frown size={40} className="text-[var(--text-muted)]" />
        <p className="font-semibold" style={{ color: 'var(--text)' }}>{t('notFound')}</p>
      </main>
      <Footer />
    </div>
  );

  const { user, stats, achievements } = data;
  const memberYear = new Date(user.memberSince).getFullYear();

  const statCards = [
    { icon: <Star size={18} />, label: t('totalXp'), value: stats.totalXp.toLocaleString(), color: '#F59E0B' },
    { icon: <Flame size={18} />, label: t('streak'), value: stats.streakDays, color: '#EF4444' },
    { icon: <BookOpen size={18} />, label: t('lessonsCompleted'), value: stats.lessonsCompleted, color: '#10B981' },
    { icon: <Trophy size={18} />, label: t('quizzes'), value: stats.quizzesCompleted, color: '#8B5CF6' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl flex flex-col gap-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 flex flex-col items-center gap-4 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
              style={{ background: 'var(--zkawi-purple)', color: '#fff' }}
            >
              {user.image ? (
                <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name?.[0]?.toUpperCase() ?? '?'
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{user.name}</h1>
              <p className="text-sm flex items-center justify-center gap-1 mt-1" style={{ color: 'var(--text-muted)' }}>
                <Calendar size={12} />
                {t('memberSince')} {memberYear}
              </p>
            </div>

            <button
              onClick={() => navigator.share?.({ title: user.name, url: window.location.href }).catch(() => navigator.clipboard.writeText(window.location.href))}
              className="text-xs px-4 py-1.5 rounded-full transition-opacity hover:opacity-80"
              style={{ background: 'var(--zkawi-purple)', color: '#fff' }}
            >
              {t('shareProfile')}
            </button>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {statCards.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <Card className="p-4 flex items-center gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}20`, color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-lg font-bold leading-none" style={{ color: 'var(--text)' }}>{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {achievements.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h2 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>
              {t('achievements')} ({achievements.length})
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {achievements.map(a => (
                <Card
                  key={a.id}
                  className="p-3 flex flex-col items-center gap-1 text-center"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <DynamicIcon name={a.icon} size={28} className="mx-auto" />
                  <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                    {a.name}
                  </span>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
