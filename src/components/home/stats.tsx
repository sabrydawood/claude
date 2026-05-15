'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Users, BookOpen, Gamepad2 } from 'lucide-react';

function CountUp({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{count.toLocaleString('ar-EG')}</span>;
}

export default function HomeStats({ locale }: { locale: string }) {
  const t = useTranslations('home.stats');

  const stats = [
    {
      icon: <Users size={28} />,
      value: 1200,
      label: t('studentsLabel'),
      color: 'text-[var(--zkawi-purple)]',
      bg: 'bg-[var(--zkawi-purple)]/15',
      suffix: '+',
    },
    {
      icon: <BookOpen size={28} />,
      value: 25,
      label: t('lessonsLabel'),
      color: 'text-[var(--zkawi-gold)]',
      bg: 'bg-[var(--zkawi-gold)]/15',
      suffix: '+',
    },
    {
      icon: <Gamepad2 size={28} />,
      value: 50,
      label: t('activitiesLabel'),
      color: 'text-[var(--zkawi-green)]',
      bg: 'bg-[var(--zkawi-green)]/15',
      suffix: '+',
    },
  ];

  return (
    <section className="py-16 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-black text-[var(--text)]">
            {t('title')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--surface)] rounded-3xl p-6 md:p-8 text-center shadow-sm border border-[var(--border)] card-hover"
            >
              <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                {stat.icon}
              </div>
              <div className={`text-3xl md:text-4xl font-black ${stat.color} mb-2`}>
                <CountUp end={stat.value} />
                <span>{stat.suffix}</span>
              </div>
              <p className="text-sm md:text-base text-[var(--text-muted)] font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
