'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Baby, Gamepad2, TrendingUp, Globe } from 'lucide-react';

export default function HomeFeatures({ locale }: { locale: string }) {
  const t = useTranslations('home.features');

  const features = [
    {
      icon: <Baby size={28} />,
      titleKey: 'forKids.title',
      descKey: 'forKids.description',
      color: 'text-pink-500',
      bg: 'bg-pink-500/15',
      emoji: '🧒',
    },
    {
      icon: <Gamepad2 size={28} />,
      titleKey: 'interactive.title',
      descKey: 'interactive.description',
      color: 'text-[var(--zkawi-purple)]',
      bg: 'bg-[var(--zkawi-purple)]/15',
      emoji: '🎮',
    },
    {
      icon: <TrendingUp size={28} />,
      titleKey: 'progress.title',
      descKey: 'progress.description',
      color: 'text-[var(--zkawi-green)]',
      bg: 'bg-[var(--zkawi-green)]/15',
      emoji: '📈',
    },
    {
      icon: <Globe size={28} />,
      titleKey: 'arabic.title',
      descKey: 'arabic.description',
      color: 'text-[var(--zkawi-gold)]',
      bg: 'bg-[var(--zkawi-gold)]/15',
      emoji: '🌍',
    },
  ];

  return (
    <section className="py-20 bg-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black text-[var(--text)] mb-4">
            {t('title')} 💜
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-[var(--surface-2)] border border-[var(--border)] rounded-3xl p-6 text-center shadow-sm"
            >
              <div className="text-4xl mb-3">{feature.emoji}</div>
              <div className={`${feature.bg} ${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-black text-[var(--text)] mb-2">
                {t(feature.titleKey as Parameters<typeof t>[0])}
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {t(feature.descKey as Parameters<typeof t>[0])}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
