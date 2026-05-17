'use client';

import { Bot, Globe, Star, CheckCircle2, Lock } from 'lucide-react';

export type AgeGroup = 'spark' | 'explorer' | 'builder';

export function GetAgeGroup(birthdate: Date | string | null): AgeGroup {
  if (!birthdate) return 'explorer';
  const age = Math.floor((Date.now() - new Date(birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  if (age < 9) return 'spark';
  if (age < 13) return 'explorer';
  return 'builder';
}

interface NavigationItem {
  id: string;
  titleAr: string;
  titleEn: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  href: string;
}

interface AgeAdaptiveNavigationProps {
  ageGroup: AgeGroup;
  items: NavigationItem[];
  locale: string;
}

export default function AgeAdaptiveNavigation({ ageGroup, items, locale }: AgeAdaptiveNavigationProps) {
  const isRtl = locale === 'ar';

  if (ageGroup === 'spark') return <SparkNavigation items={items} isRtl={isRtl} />;
  if (ageGroup === 'builder') return <BuilderNavigation items={items} isRtl={isRtl} />;
  return <ExplorerNavigation items={items} isRtl={isRtl} />;
}

// ─── Spark: Linear steps (6-9) ──────────────────────────────────────────────
function SparkNavigation({ items, isRtl }: { items: NavigationItem[]; isRtl: boolean }) {
  const visible = items.slice(0, 4); // Show only 3-4 steps
  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="flex flex-col gap-4 px-4 py-6">
      <div className="flex items-center gap-2 mb-2">
        <Bot size={20} className="text-purple-500" />
        <p className="text-sm font-medium text-gray-600">
          {isRtl ? 'Xbot يقودك خطوة بخطوة' : 'Xbot guides you step by step'}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {visible.map((item, i) => (
          <a
            key={item.id}
            href={item.isUnlocked ? item.href : '#'}
            className={[
              'flex items-center gap-3 p-4 rounded-2xl border-2 min-h-[56px] transition-all',
              item.isCompleted ? 'bg-green-50 border-green-300 text-green-800' :
              item.isUnlocked ? 'bg-white border-blue-300 text-blue-800 shadow-sm hover:shadow-md' :
              'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60',
            ].join(' ')}
          >
            <span className="w-8 flex items-center justify-center">
              {item.isCompleted
                ? <CheckCircle2 size={24} className="text-green-600" />
                : item.isUnlocked
                  ? <span className="text-2xl font-bold">{i + 1}</span>
                  : <Lock size={20} />}
            </span>
            <span className="font-semibold text-base flex-1">
              {isRtl ? item.titleAr : item.titleEn}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Explorer: Knowledge Islands (9-12) ─────────────────────────────────────
function ExplorerNavigation({ items, isRtl }: { items: NavigationItem[]; isRtl: boolean }) {
  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="p-4">
      <p className="text-sm text-gray-500 mb-4 text-center">
        {isRtl ? 'اكتشف الجزر — كل جزيرة عالم جديد' : 'Explore islands — each one a new world'}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.isUnlocked ? item.href : '#'}
            className={[
              'relative flex flex-col items-center justify-center aspect-square rounded-3xl border-2 p-3 transition-all min-h-[80px]',
              item.isCompleted ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-300 text-white shadow-lg' :
              item.isUnlocked ? 'bg-gradient-to-br from-blue-400 to-indigo-500 border-blue-300 text-white shadow-md hover:shadow-xl hover:scale-105' :
              'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed',
            ].join(' ')}
          >
            {!item.isUnlocked && (
              <span className="absolute top-2 end-2">
                <Lock size={14} />
              </span>
            )}
            <span className="mb-1 flex items-center justify-center">
              {item.isCompleted
                ? <Star size={16} className="fill-current" />
                : <Globe size={20} />}
            </span>
            <span className="text-xs font-bold text-center leading-tight">
              {isRtl ? item.titleAr : item.titleEn}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Builder: Skill Map (12-14) ──────────────────────────────────────────────
function BuilderNavigation({ items, isRtl }: { items: NavigationItem[]; isRtl: boolean }) {
  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="p-4">
      <p className="text-sm text-gray-500 mb-4">
        {isRtl ? 'خريطة مهاراتك — اختر مسارك' : 'Your skill map — choose your path'}
      </p>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.isUnlocked ? item.href : '#'}
            className={[
              'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all min-h-[48px]',
              item.isCompleted ? 'bg-green-50 border-green-200 text-green-800' :
              item.isUnlocked ? 'bg-white border-gray-200 text-gray-800 hover:border-blue-300 hover:bg-blue-50' :
              'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed',
            ].join(' ')}
          >
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              bg-gray-100 text-gray-500 shrink-0">
              {item.isCompleted ? '✓' : item.isUnlocked ? '○' : '×'}
            </span>
            <span className="font-medium text-sm flex-1">
              {isRtl ? item.titleAr : item.titleEn}
            </span>
            {item.isUnlocked && !item.isCompleted && (
              <span className="text-blue-400 text-xs">{isRtl ? 'ابدأ ←' : '→ Start'}</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
