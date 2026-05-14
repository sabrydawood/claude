'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export default function HomeCta({ locale }: { locale: string }) {
  const t = useTranslations('home.cta');

  return (
    <section className="py-20 bg-[#FFF9F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-purple-300"
        >
          {/* Background decorations */}
          <div className="absolute top-0 end-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 start-0 w-32 h-32 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              {t('title')}
            </h2>
            <p className="text-lg text-purple-200 mb-8 max-w-xl mx-auto">
              {t('subtitle')}
            </p>
            <Link href="/register">
              <Button
                size="xl"
                variant="secondary"
                className="text-amber-900 font-black shadow-xl hover:shadow-2xl"
              >
                <Zap size={20} fill="currentColor" />
                {t('button')} 🎉
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
