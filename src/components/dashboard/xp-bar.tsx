'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Zap, Star } from 'lucide-react';
import { calculateLevel } from '@/lib/utils';

interface XpBarProps {
  totalXp: number;
  showDetails?: boolean;
}

export default function XpBar({ totalXp, showDetails = true }: XpBarProps) {
  const t = useTranslations('dashboard');
  const { level, currentXp, xpToNext, progress } = calculateLevel(totalXp);

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 text-white">
      {/* Level badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center"
          >
            <Star size={24} className="text-amber-300" fill="currentColor" />
          </motion.div>
          <div>
            <div className="text-xs font-medium text-purple-200">{t('level')}</div>
            <div className="text-2xl font-black">{level}</div>
          </div>
        </div>

        <div className="text-end">
          <div className="text-xs font-medium text-purple-200">{t('stats.totalXp')}</div>
          <div className="text-xl font-black flex items-center gap-1 justify-end">
            <Zap size={16} className="text-amber-300" fill="currentColor" />
            {totalXp.toLocaleString('ar-EG')}
          </div>
        </div>
      </div>

      {/* XP progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-purple-200 font-medium">
          <span>{currentXp} XP</span>
          <span>{xpToNext} XP {t('xpToNext')}</span>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className="h-full bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full"
          />
        </div>
        <div className="text-xs text-purple-200 text-center">
          {Math.round(progress)}% {t('level')} {level + 1}
        </div>
      </div>
    </div>
  );
}
