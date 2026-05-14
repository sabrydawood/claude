'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { UserPlus, BookOpen, Trophy } from 'lucide-react';

export default function HomeHowItWorks({ locale }: { locale: string }) {
  const t = useTranslations('home.howItWorks');

  const steps = [
    {
      icon: <UserPlus size={32} />,
      number: '01',
      titleKey: 'step1.title',
      descKey: 'step1.description',
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      emoji: '🚀',
    },
    {
      icon: <BookOpen size={32} />,
      number: '02',
      titleKey: 'step2.title',
      descKey: 'step2.description',
      color: 'from-amber-400 to-orange-500',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      emoji: '🎓',
    },
    {
      icon: <Trophy size={32} />,
      number: '03',
      titleKey: 'step3.title',
      descKey: 'step3.description',
      color: 'from-emerald-400 to-teal-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      emoji: '🏆',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-4">
            {t('title')} 🗺️
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection lines (desktop) */}
          <div className="hidden md:block absolute top-1/2 start-1/3 end-1/3 h-0.5 bg-gradient-to-r from-purple-200 via-amber-200 to-emerald-200 -translate-y-1/2" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative ${step.bg} border-2 ${step.border} rounded-3xl p-8 text-center`}
            >
              {/* Step number */}
              <div className="absolute -top-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2">
                <div className={`bg-gradient-to-br ${step.color} text-white font-black text-sm px-3 py-1 rounded-full shadow-lg`}>
                  {step.number}
                </div>
              </div>

              <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                {step.icon}
              </div>

              <div className="text-3xl mb-3">{step.emoji}</div>

              <h3 className="text-xl font-black text-gray-800 mb-2">
                {t(step.titleKey as Parameters<typeof t>[0])}
              </h3>
              <p className="text-gray-500 leading-relaxed">
                {t(step.descKey as Parameters<typeof t>[0])}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
