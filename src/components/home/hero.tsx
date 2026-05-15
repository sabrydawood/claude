'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Zap, Star, Sparkles, Bot, Target, Lightbulb, Trophy, User } from 'lucide-react';

export default function HomeHero({ locale }: { locale: string }) {
  const t = useTranslations('home.hero');
  const tCommon = useTranslations('common');

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white py-20 md:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 start-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        <div className="absolute top-1/3 end-1/4 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl" />
        <div className="absolute bottom-10 start-1/3 w-24 h-24 bg-pink-400/20 rounded-full blur-xl" />
        <div className="absolute top-1/2 start-1/2 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Floating stars */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-amber-300/60"
          style={{
            top: `${15 + (i * 13) % 70}%`,
            left: `${5 + (i * 17) % 85}%`,
          }}
          animate={{
            y: [0, -10, 0],
            rotate: [0, 180, 360],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        >
          <Star size={8 + i * 3} fill="currentColor" />
        </motion.div>
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-start"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 text-sm font-bold mb-6"
            >
              <Sparkles size={14} className="text-amber-300" />
              {t('badge')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4"
            >
              {t('title')}{' '}
              <span className="text-amber-300 drop-shadow-sm">
                {t('titleHighlight')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-purple-100 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
            >
              {t('subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/register">
                <Button
                  size="xl"
                  variant="secondary"
                  className="w-full sm:w-auto text-amber-900 font-black shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50"
                >
                  <Zap size={20} fill="currentColor" />
                  {t('ctaPrimary')}
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button
                  size="xl"
                  variant="glass"
                  className="w-full sm:w-auto font-bold"
                >
                  <Sparkles size={16} />
                  {t('ctaSecondary')}
                </Button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-3 mt-8 justify-center lg:justify-start"
            >
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {[
                  'from-pink-400 to-rose-500',
                  'from-violet-400 to-purple-600',
                  'from-amber-400 to-orange-500',
                  'from-teal-400 to-emerald-500',
                ].map((gradient, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} border-2 border-white flex items-center justify-center`}
                  >
                    <User size={16} className="text-white" strokeWidth={2} />
                  </div>
                ))}
              </div>
              <div className="text-sm text-purple-200">
                <span className="font-bold text-white">+1,200</span> طالب بيتعلموا دلوقتي
              </div>
            </motion.div>
          </motion.div>

          {/* Mascot / Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Main robot mascot */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/30">
                  <Bot size={140} className="text-amber-900/75 md:hidden" strokeWidth={1.2} />
                  <Bot size={180} className="text-amber-900/75 hidden md:block" strokeWidth={1.2} />
                </div>

                {/* Floating badges around the mascot */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0"
                >
                  {[
                    { Icon: Star,      top: '5%',  left: '80%', color: '#F59E0B' },
                    { Icon: Target,    top: '75%', left: '85%', color: '#EF4444' },
                    { Icon: Lightbulb, top: '85%', left: '5%',  color: '#10B981' },
                    { Icon: Trophy,    top: '5%',  left: '0%',  color: '#8B5CF6' },
                  ].map(({ Icon, top, left, color }, i) => (
                    <div
                      key={i}
                      className="absolute bg-[var(--surface)] rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
                      style={{ top, left }}
                    >
                      <Icon size={20} style={{ color }} strokeWidth={1.8} />
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* XP popup */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-4 -start-4 bg-[var(--surface)] rounded-2xl shadow-xl p-3 flex items-center gap-2"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--zkawi-purple)] to-[var(--zkawi-purple-dark)] rounded-xl flex items-center justify-center">
                  <Zap size={18} className="text-white" fill="white" />
                </div>
                <div>
                  <div className="text-xs text-[var(--text-muted)] font-medium">XP كسبت</div>
                  <div className="text-sm font-black text-[var(--zkawi-purple)]">+50 XP</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className="fill-[#FFF9F0] dark:fill-[#0D0D1A]" d="M0 80L1440 80L1440 40C1200 80 960 0 720 20C480 40 240 80 0 40L0 80Z" />
        </svg>
      </div>
    </section>
  );
}
