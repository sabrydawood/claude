'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, BookOpen, ChevronRight } from 'lucide-react';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import type { AgentRow } from '@/lib/db/queries/content';
import type { SubjectRow } from '@/lib/db/queries/content';

// Gradient mapping by slug (non-translatable visual config)
const AGENT_GRADIENTS: Record<string, string> = {
  claude: 'from-purple-500 to-purple-700',
  chatgpt: 'from-green-500 to-green-700',
  gemini: 'from-blue-500 to-blue-700',
};

interface Props {
  agents: AgentRow[];
  subjects: SubjectRow[];
  locale: string;
}

export default function HomeAgents({ agents, subjects, locale: _locale }: Props) {
  const t = useTranslations('home.agents');
  const tS = useTranslations('subjects');

  return (
    <>
      {/* Subjects section */}
      {subjects.length > 0 && (
        <section className="py-16 bg-[var(--bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-[var(--text)] mb-1">
                  {tS('title')}
                </h2>
                <p className="text-[var(--text-muted)] text-sm">{tS('subtitle')}</p>
              </div>
              <Link href="/subjects">
                <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                  {tS('allCourses')}
                  <ChevronRight size={14} className="flip-rtl" />
                </Button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {subjects.slice(0, 4).map((subject, i) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ scale: 1.04, y: -3 }}
                >
                  <Link href={`/subjects/${subject.slug}`} className="block">
                    <div
                      className="rounded-2xl border-2 p-4 transition-all h-full"
                      style={{
                        borderColor: subject.color + '35',
                        background: subject.color + '08',
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: subject.color + '20', color: subject.color }}
                      >
                        <DynamicIcon name={subject.icon} size={22} />
                      </div>
                      <h3 className="font-black text-sm text-[var(--text)] mb-1">{subject.name}</h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        {subject.courseCount} {tS('courses')}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Agents section */}
      <section className="py-20 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-[var(--text)] mb-4">
              {t('title')}
            </h2>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {agents.map((agent, i) => {
              const gradient = AGENT_GRADIENTS[agent.slug] ?? 'from-gray-500 to-gray-700';
              return (
                <motion.div
                  key={agent.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative bg-[var(--surface)] rounded-3xl overflow-hidden shadow-sm border border-[var(--border)] card-hover ${!agent.isActive ? 'opacity-70' : ''}`}
                >
                  {/* Card header with gradient */}
                  <div className={`bg-gradient-to-br ${gradient} p-6 text-white text-center`}>
                    <div className="flex justify-center mb-2 text-white/90">
                      <DynamicIcon name={agent.icon} size={52} />
                    </div>
                    <h3 className="text-2xl font-black">{agent.name}</h3>
                  </div>

                  {/* Card body */}
                  <div className="p-6">
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-4">
                      {agent.description}
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
                          {t('comingSoon')}
                        </Button>
                      </>
                    )}
                  </div>

                  {!agent.isActive && (
                    <div className="absolute top-3 end-3">
                      <Badge variant="secondary">{t('comingSoon')}</Badge>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
