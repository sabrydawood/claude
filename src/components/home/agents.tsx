'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, BookOpen, ChevronRight } from 'lucide-react';
import { agents } from '@/lib/content/claude-lessons';

export default function HomeAgents({ locale }: { locale: string }) {
  const t = useTranslations('home.agents');

  return (
    <section className="py-20 bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black text-[var(--text)] mb-4">
            {t('title')} 🤖
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-[var(--surface)] rounded-3xl overflow-hidden shadow-sm border border-[var(--border)] card-hover ${!agent.isActive ? 'opacity-70' : ''}`}
            >
              {/* Card header with gradient */}
              <div className={`bg-gradient-to-br ${agent.gradient} p-6 text-white text-center`}>
                <div className="text-6xl mb-2">{agent.emoji}</div>
                <h3 className="text-2xl font-black">{locale === 'ar' ? agent.nameAr : agent.nameEn}</h3>
              </div>

              {/* Card body */}
              <div className="p-6">
                <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-4">
                  {locale === 'ar' ? agent.descriptionAr : agent.descriptionEn}
                </p>

                {agent.isActive ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen size={16} className="text-[var(--zkawi-purple)]" />
                      <span className="text-sm font-semibold text-[var(--text-muted)]">
                        5 {t('lessonsCount')}
                      </span>
                    </div>
                    <Link href={`/agents/${agent.slug}`}>
                      <Button className="w-full" size="sm">
                        {t('exploreButton')}
                        <ChevronRight size={16} className="flip-rtl" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <Lock size={16} className="text-[var(--text-muted)]" />
                      <span className="text-sm text-[var(--text-muted)]">{t('comingSoon')}</span>
                    </div>
                    <Button variant="outline" className="w-full" size="sm" disabled>
                      {t('comingSoon')} 🔒
                    </Button>
                  </>
                )}
              </div>

              {!agent.isActive && (
                <div className="absolute top-3 end-3">
                  <Badge variant="secondary">قريباً</Badge>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
