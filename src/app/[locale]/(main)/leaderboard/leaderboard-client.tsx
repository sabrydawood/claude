'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/lib/i18n/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { BookOpen, Flame, Trophy } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  name: string;
  image: string | null;
  totalXp: number;
  streakDays: number;
  lessonsCompleted: number;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardClient({ entries }: { entries: LeaderboardEntry[] }) {
  const t = useTranslations('leaderboard');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl flex flex-col gap-6">
        <div className="text-center">
          <Trophy size={52} className="mx-auto mb-3 text-[var(--zkawi-gold)]" />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {t('title')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('subtitle')}
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            {t('noData')}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link href={`/profile/${entry.userId}`}>
                  <Card
                    className="p-4 flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.01]"
                    style={{
                      background: 'var(--surface)',
                      border: i === 0 ? '1px solid #F59E0B' : i === 1 ? '1px solid #9CA3AF' : i === 2 ? '1px solid #B45309' : '1px solid var(--border)',
                    }}
                  >
                    <div className="w-10 text-center flex-shrink-0">
                      {i < 3 ? (
                        <span className="text-2xl">{MEDALS[i]}</span>
                      ) : (
                        <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
                          #{i + 1}
                        </span>
                      )}
                    </div>

                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                      style={{ background: 'var(--zkawi-purple)', color: '#fff' }}
                    >
                      {entry.image ? (
                        <img src={entry.image} alt={entry.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        entry.name?.[0]?.toUpperCase() ?? '?'
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>
                        {entry.name}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <BookOpen size={11} />
                          {entry.lessonsCompleted} {t('lessons')}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <Flame size={11} />
                          {entry.streakDays} {t('days')}
                        </span>
                      </div>
                    </div>

                    <div className="text-end flex-shrink-0">
                      <p className="font-bold text-lg" style={{ color: 'var(--zkawi-purple)' }}>
                        {entry.totalXp.toLocaleString()}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>XP</p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
