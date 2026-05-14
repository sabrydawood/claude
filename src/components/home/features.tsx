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
      color: 'text-pink-600',
      bg: 'bg-pink-100',
      emoji: '🧒',
    },
    {
      icon: <Gamepad2 size={28} />,
      titleKey: 'interactive.title',
      descKey: 'interactive.description',
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      emoji: '🎮',
    },
    {
      icon: <TrendingUp size={28} />,
      titleKey: 'progress.title',
      descKey: 'progress.description',
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      emoji: '📈',
    },
    {
      icon: <Globe size={28} />,
      titleKey: 'arabic.title',
      descKey: 'arabic.description',
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      emoji: '🌍',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-4">
            {t('title')} 💜
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
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
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-3xl p-6 text-center shadow-sm"
            >
              <div className="text-4xl mb-3">{feature.emoji}</div>
              <div className={`${feature.bg} ${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">
                {t(feature.titleKey as Parameters<typeof t>[0])}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t(feature.descKey as Parameters<typeof t>[0])}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
