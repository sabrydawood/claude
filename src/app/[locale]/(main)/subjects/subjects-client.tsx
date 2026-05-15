'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronRight } from 'lucide-react';
import type { SubjectRow } from '@/lib/db/queries/content';

interface Props {
  subjects: SubjectRow[];
  locale: string;
}

export default function SubjectsClient({ subjects, locale: _locale }: Props) {
  const t = useTranslations('subjects');

  if (subjects.length === 0) {
    return (
      <div className="text-center py-20">
        <BookOpen size={52} className="mx-auto mb-4 text-[var(--text-muted)]" />
        <p className="text-[var(--text-muted)]">{t('empty')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {subjects.map((subject, i) => (
        <motion.div
          key={subject.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          whileHover={{ scale: 1.04, y: -4 }}
        >
          <Link href={`/subjects/${subject.slug}`} className="block h-full">
            <div
              className="relative rounded-3xl border-2 p-6 cursor-pointer transition-all h-full flex flex-col"
              style={{
                borderColor: subject.color + '40',
                background: subject.color + '08',
              }}
            >
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
                style={{ background: subject.color + '20', color: subject.color }}
              >
                <DynamicIcon name={subject.icon} size={28} />
              </div>

              {/* Name */}
              <h3 className="font-black text-xl text-[var(--text)] mb-2 leading-tight">
                {subject.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-[var(--text-muted)] mb-4 flex-1 leading-relaxed line-clamp-3">
                {subject.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <Badge
                  className="text-xs font-bold"
                  style={{
                    background: subject.color + '20',
                    color: subject.color,
                    border: `1px solid ${subject.color}30`,
                  }}
                >
                  {subject.courseCount} {t('courses')}
                </Badge>
                <ChevronRight
                  size={18}
                  className="flip-rtl"
                  style={{ color: subject.color }}
                />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
