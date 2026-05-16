'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { RobotMood } from '@/components/mascot-gltf';

const RobotExpressive = dynamic(
  () => import('@/components/mascot-gltf').then(m => m.RobotExpressive),
  { ssr: false, loading: () => <div style={{ width: '100%', height: '100%', background: 'rgba(124,58,237,0.06)', borderRadius: 16 }} /> },
);
const RobotExpressivePortrait = dynamic(
  () => import('@/components/mascot-gltf').then(m => m.RobotExpressivePortrait),
  { ssr: false, loading: () => <div style={{ width: '100%', height: '100%', background: 'rgba(124,58,237,0.06)', borderRadius: 16 }} /> },
);

const MOODS: RobotMood[] = ['idle', 'happy', 'thinking', 'talking', 'walking'];

const ANIM_MAP: Record<RobotMood, string> = {
  idle: 'Idle', happy: 'Wave', thinking: 'ThumbsUp', talking: 'Yes', walking: 'Walking',
};

const BTN = (active: boolean): React.CSSProperties => ({
  padding: '8px 20px', borderRadius: 12, border: '1.5px solid',
  borderColor: active ? '#7C3AED' : 'rgba(124,58,237,0.3)',
  background: active ? 'rgba(124,58,237,0.25)' : 'transparent',
  color: active ? '#C4B5FD' : 'rgba(196,181,253,0.6)',
  cursor: 'pointer', fontSize: 13, fontWeight: 700,
});

export default function RobotDevPage() {
  const [mood, setMood] = useState<RobotMood>('idle');

  return (
    <div style={{ minHeight: '100vh', background: '#06030f', color: 'white', fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, color: '#C4B5FD' }}>
        🤖 RobotExpressive — GLTF Preview
      </h1>
      <p style={{ fontSize: 11, color: 'rgba(196,181,253,0.4)', marginBottom: 24 }}>
        /dev/robot · three.js official model · 14 built-in animations · drag to rotate, scroll to zoom
      </p>

      {/* Mood buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 36, flexWrap: 'wrap' }}>
        {MOODS.map(m => (
          <button key={m} onClick={() => setMood(m)} style={BTN(mood === m)}>
            {m} <span style={{ opacity: 0.6, fontWeight: 400 }}>→ {ANIM_MAP[m]}</span>
          </button>
        ))}
      </div>

      {/* Previews */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── Full body ── */}
        <div>
          <p style={{ fontSize: 10, color: 'rgba(196,181,253,0.45)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Full body — 400 × 480
          </p>
          <div style={{ border: '1px solid rgba(124,58,237,0.35)', borderRadius: 16, overflow: 'hidden', background: 'rgba(124,58,237,0.04)', width: 400, height: 480 }}>
            <RobotExpressive mood={mood} walking={mood === 'walking'} width={400} height={480} orbitControls />
          </div>
          <p style={{ fontSize: 10, color: 'rgba(196,181,253,0.3)', marginTop: 6, textAlign: 'center' }}>drag to rotate • scroll to zoom</p>
        </div>

        {/* ── Portrait ── */}
        <div>
          <p style={{ fontSize: 10, color: 'rgba(196,181,253,0.45)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Portrait (dialogue box) — 220 × 360
          </p>
          <div style={{ border: '1px solid rgba(124,58,237,0.35)', borderRadius: 16, overflow: 'hidden', background: 'rgba(124,58,237,0.04)', width: 220, height: 360 }}>
            <RobotExpressivePortrait mood={mood} width={220} height={360} orbitControls />
          </div>
          <p style={{ fontSize: 10, color: 'rgba(196,181,253,0.3)', marginTop: 6, textAlign: 'center' }}>drag to rotate</p>
        </div>

        {/* ── NPC sizes ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <p style={{ fontSize: 10, color: 'rgba(196,181,253,0.45)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              NPC mascot — 120 × 160
            </p>
            <div style={{ border: '1px solid rgba(124,58,237,0.35)', borderRadius: 12, overflow: 'hidden', background: 'rgba(124,58,237,0.04)', width: 120, height: 160, display: 'inline-block' }}>
              <RobotExpressive mood={mood} walking={mood === 'walking'} width={120} height={160} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: 10, color: 'rgba(196,181,253,0.45)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Tiny (80 × 100) — actual on-page size
            </p>
            <div style={{ border: '1px solid rgba(124,58,237,0.35)', borderRadius: 10, overflow: 'hidden', background: 'rgba(124,58,237,0.04)', width: 80, height: 100, display: 'inline-block' }}>
              <RobotExpressive mood={mood} walking={mood === 'walking'} width={80} height={100} />
            </div>
          </div>
        </div>
      </div>

      {/* All 14 animations */}
      <div style={{ marginTop: 48, padding: '20px 24px', background: 'rgba(124,58,237,0.06)', borderRadius: 16, border: '1px solid rgba(124,58,237,0.18)', maxWidth: 680 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#C4B5FD', marginBottom: 12 }}>All 14 built-in animations</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Dance','Death','Idle','Jump','No','Punch','Running','Sitting','Standing','ThumbsUp','Walking','WalkJump','Wave','Yes'].map(a => (
            <span key={a} style={{ padding: '3px 10px', background: 'rgba(124,58,237,0.12)', borderRadius: 8, fontSize: 11, color: 'rgba(196,181,253,0.75)', border: '1px solid rgba(124,58,237,0.2)' }}>
              {a}
            </span>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'rgba(196,181,253,0.35)', marginTop: 12 }}>
          Source: threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb
        </p>
      </div>
    </div>
  );
}
