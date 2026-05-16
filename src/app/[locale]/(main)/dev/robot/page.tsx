'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { RobotMood } from '@/components/mascot-gltf';

// Dynamic imports — all Three.js (no SSR)
const RobotExpressive  = dynamic(() => import('@/components/mascot-gltf').then(m => m.RobotExpressive),  { ssr: false });
const XbotExpressive   = dynamic(() => import('@/components/mascot-gltf').then(m => m.XbotExpressive),   { ssr: false });
const SoldierExpressive = dynamic(() => import('@/components/mascot-gltf').then(m => m.SoldierExpressive), { ssr: false });

const MOODS: RobotMood[] = ['idle', 'happy', 'thinking', 'talking', 'walking'];

const BTN = (active: boolean): React.CSSProperties => ({
  padding: '7px 16px', borderRadius: 10, border: '1.5px solid',
  borderColor: active ? '#7C3AED' : 'rgba(124,58,237,0.3)',
  background: active ? 'rgba(124,58,237,0.25)' : 'transparent',
  color: active ? '#C4B5FD' : 'rgba(196,181,253,0.6)',
  cursor: 'pointer', fontSize: 12, fontWeight: 700,
});

const CARD: React.CSSProperties = {
  background: 'rgba(124,58,237,0.05)',
  border: '1px solid rgba(124,58,237,0.25)',
  borderRadius: 20,
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
};

interface ModelCardProps {
  title: string;
  subtitle: string;
  animations: string;
  mood: RobotMood;
  children: React.ReactNode;
}

function ModelCard({ title, subtitle, animations, mood, children }: ModelCardProps) {
  return (
    <div style={CARD}>
      <div style={{ border: '1px solid rgba(124,58,237,0.3)', borderRadius: 16, overflow: 'hidden', background: 'rgba(124,58,237,0.04)' }}>
        {children}
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 15, fontWeight: 900, color: '#C4B5FD', margin: 0 }}>{title}</p>
        <p style={{ fontSize: 11, color: 'rgba(196,181,253,0.5)', margin: '3px 0 0' }}>{subtitle}</p>
        <p style={{ fontSize: 10, color: 'rgba(196,181,253,0.35)', margin: '6px 0 0', fontFamily: 'monospace' }}>
          mood: <span style={{ color: '#A78BFA' }}>{mood}</span>
        </p>
        <p style={{ fontSize: 10, color: 'rgba(196,181,253,0.3)', margin: '4px 0 0', lineHeight: 1.5 }}>
          {animations}
        </p>
      </div>
    </div>
  );
}

export default function RobotDevPage() {
  const [mood, setMood] = useState<RobotMood>('idle');

  return (
    <div style={{ minHeight: '100vh', background: '#06030f', color: 'white', fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, color: '#C4B5FD' }}>
        🤖 GLTF Characters — Preview
      </h1>
      <p style={{ fontSize: 11, color: 'rgba(196,181,253,0.4)', marginBottom: 28 }}>
        /dev/robot · drag to rotate · scroll to zoom · pick your favourite
      </p>

      {/* Mood selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 36, flexWrap: 'wrap' }}>
        {MOODS.map(m => (
          <button key={m} onClick={() => setMood(m)} style={BTN(mood === m)}>{m}</button>
        ))}
      </div>

      {/* Three models side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, maxWidth: 900 }}>

        <ModelCard
          title="RobotExpressive"
          subtitle="three.js official robot"
          animations="Idle · Wave · ThumbsUp · Yes · Walking (+9 more)"
          mood={mood}
        >
          <RobotExpressive mood={mood} walking={mood === 'walking'} width={240} height={320} orbitControls />
        </ModelCard>

        <ModelCard
          title="Xbot"
          subtitle="Mixamo humanoid · 7 animations"
          animations="idle · agree · headShake · walk · run · sad_pose · sneak_pose"
          mood={mood}
        >
          <XbotExpressive mood={mood} walking={mood === 'walking'} width={240} height={320} orbitControls />
        </ModelCard>

        <ModelCard
          title="Soldier"
          subtitle="Mixamo soldier · 4 animations"
          animations="Idle · Run · Walk · TPose"
          mood={mood}
        >
          <SoldierExpressive mood={mood} walking={mood === 'walking'} width={240} height={320} orbitControls />
        </ModelCard>

      </div>

      <p style={{ fontSize: 11, color: 'rgba(196,181,253,0.3)', marginTop: 32 }}>
        قل لي أي شخصية تعجبك وأركّبها كـ mascot بديل
      </p>
    </div>
  );
}
