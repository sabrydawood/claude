'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { Mood } from '@/components/characters/npc-gallery';

// Dynamic import with ssr:false — Three.js requires browser
const ZakiCharacter = dynamic(
  () => import('@/components/characters/npc-gallery').then(m => m.ZakiCharacter),
  { ssr: false }
);
const LunaCharacter = dynamic(
  () => import('@/components/characters/npc-gallery').then(m => m.LunaCharacter),
  { ssr: false }
);
const RexCharacter = dynamic(
  () => import('@/components/characters/npc-gallery').then(m => m.RexCharacter),
  { ssr: false }
);
const ByteCharacter = dynamic(
  () => import('@/components/characters/npc-gallery').then(m => m.ByteCharacter),
  { ssr: false }
);
const NovaCharacter = dynamic(
  () => import('@/components/characters/npc-gallery').then(m => m.NovaCharacter),
  { ssr: false }
);
const FinnCharacter = dynamic(
  () => import('@/components/characters/npc-gallery').then(m => m.FinnCharacter),
  { ssr: false }
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface CharacterInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  description: string;
  color: string;
}

// ─── Character metadata ───────────────────────────────────────────────────────

const CHARACTERS: CharacterInfo[] = [
  {
    id: 'zaki',
    nameAr: 'زكي',
    nameEn: 'Zaki',
    description: 'The original purple robot — smart and adventurous',
    color: '#7C3AED',
  },
  {
    id: 'luna',
    nameAr: 'لونا',
    nameEn: 'Luna',
    description: 'Round feminine blue robot — gentle and creative',
    color: '#60A5FA',
  },
  {
    id: 'rex',
    nameAr: 'ريكس',
    nameEn: 'Rex',
    description: 'Bulky tough red robot — strong and determined',
    color: '#DC2626',
  },
  {
    id: 'byte',
    nameAr: 'بايت',
    nameEn: 'Byte',
    description: 'Retro pixel-art cubic robot — logical and precise',
    color: '#10B981',
  },
  {
    id: 'nova',
    nameAr: 'نوفا',
    nameEn: 'Nova',
    description: 'Sleek white minimalist robot — calm and futuristic',
    color: '#38BDF8',
  },
  {
    id: 'finn',
    nameAr: 'فين',
    nameEn: 'Finn',
    description: 'Child-like colorful robot — playful and curious',
    color: '#22C55E',
  },
];

const MOODS: Mood[] = ['idle', 'happy', 'thinking', 'talking'];

// ─── Character card ───────────────────────────────────────────────────────────

interface CardProps {
  info: CharacterInfo;
  mood: Mood;
  onMoodChange: (mood: Mood) => void;
}

function CharacterCard({ info, mood, onMoodChange }: CardProps) {
  const renderCharacter = () => {
    const props = { mood, width: 200, height: 250 };
    switch (info.id) {
      case 'zaki':  return <ZakiCharacter  {...props} />;
      case 'luna':  return <LunaCharacter  {...props} />;
      case 'rex':   return <RexCharacter   {...props} />;
      case 'byte':  return <ByteCharacter  {...props} />;
      case 'nova':  return <NovaCharacter  {...props} />;
      case 'finn':  return <FinnCharacter  {...props} />;
      default:      return null;
    }
  };

  return (
    <div
      className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
      style={{ boxShadow: `0 0 32px ${info.color}22` }}
    >
      {/* Version badge */}
      <div className="mb-2 self-end rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono text-white/50">
        Version 1
      </div>

      {/* Canvas area */}
      <div className="flex items-center justify-center" style={{ width: 200, height: 250 }}>
        {renderCharacter()}
      </div>

      {/* Name */}
      <div className="mt-3 text-center">
        <p className="text-lg font-bold text-white">
          {info.nameAr} <span className="text-white/50">·</span> {info.nameEn}
        </p>
        <p className="mt-0.5 text-xs text-white/50">{info.description}</p>
      </div>

      {/* Mood selector */}
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {MOODS.map(m => (
          <button
            key={m}
            onClick={() => onMoodChange(m)}
            className="rounded-full px-3 py-1 text-xs font-medium transition-all"
            style={{
              background: mood === m ? info.color : 'rgba(255,255,255,0.08)',
              color: mood === m ? '#fff' : 'rgba(255,255,255,0.55)',
              border: `1px solid ${mood === m ? info.color : 'rgba(255,255,255,0.12)'}`,
            }}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CharactersDevPage() {
  const [moods, setMoods] = useState<Record<string, Mood>>(() =>
    Object.fromEntries(CHARACTERS.map(c => [c.id, 'idle' as Mood]))
  );

  const setMood = (id: string, mood: Mood) =>
    setMoods(prev => ({ ...prev, [id]: mood }));

  return (
    <main className="min-h-screen bg-[#0a0a15] px-6 py-12">
      {/* Header */}
      <div className="mx-auto mb-12 max-w-5xl text-center">
        <div className="mb-2 inline-block rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-mono text-yellow-400/80">
          DEV ONLY — Not for production
        </div>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
          Character Gallery
        </h1>
        <p className="mt-2 text-sm text-white/40">
          Version 1 — 6 characters · Never delete previous versions
        </p>
        <p className="mt-1 text-xs text-white/25 font-mono">
          ذكاوي · Zkawi · NPC Robot Mascots for RPG Dialogue System
        </p>
      </div>

      {/* Grid */}
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-3">
        {CHARACTERS.map(info => (
          <CharacterCard
            key={info.id}
            info={info}
            mood={moods[info.id] ?? 'idle'}
            onMoodChange={mood => setMood(info.id, mood)}
          />
        ))}
      </div>

      {/* Footer */}
      <p className="mt-16 text-center text-[10px] text-white/20 font-mono">
        /dev/characters · {new Date().getFullYear()} ذكاوي
      </p>
    </main>
  );
}
