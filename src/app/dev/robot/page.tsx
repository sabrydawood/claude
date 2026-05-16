'use client';

/**
 * /dev/robot — RobotExpressive GLTF preview
 * Tests all 14 animations and both camera angles.
 */

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { RobotMood } from '@/components/mascot-gltf';

const RobotExpressive = dynamic(
  () => import('@/components/mascot-gltf').then(m => m.RobotExpressive),
  { ssr: false, loading: () => <div style={{ width: 240, height: 320, background: 'rgba(124,58,237,0.08)', borderRadius: 16 }} /> },
);

const RobotExpressivePortrait = dynamic(
  () => import('@/components/mascot-gltf').then(m => m.RobotExpressivePortrait),
  { ssr: false, loading: () => <div style={{ width: 150, height: 270, background: 'rgba(124,58,237,0.08)', borderRadius: 12 }} /> },
);

const MOODS: RobotMood[] = ['idle', 'happy', 'thinking', 'talking', 'walking'];

const ANIM_MAP: Record<RobotMood, string> = {
  idle:     'Idle',
  happy:    'Wave',
  thinking: 'ThumbsUp',
  talking:  'Yes',
  walking:  'Walking',
};

export default function RobotDevPage() {
  const [mood, setMood] = useState<RobotMood>('idle');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#06030f',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem',
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4, color: '#C4B5FD' }}>
        🤖 RobotExpressive — GLTF Preview
      </h1>
      <p style={{ fontSize: 12, color: 'rgba(196,181,253,0.5)', marginBottom: 32 }}>
        /dev/robot · three.js official model · 14 built-in animations
      </p>

      {/* Mood selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 40, flexWrap: 'wrap' }}>
        {MOODS.map(m => (
          <button
            key={m}
            onClick={() => setMood(m)}
            style={{
              padding: '8px 20px',
              borderRadius: 12,
              border: '1.5px solid',
              borderColor: mood === m ? '#7C3AED' : 'rgba(124,58,237,0.3)',
              background: mood === m ? 'rgba(124,58,237,0.25)' : 'transparent',
              color: mood === m ? '#C4B5FD' : 'rgba(196,181,253,0.6)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {m} → <span style={{ opacity: 0.7, fontWeight: 400 }}>{ANIM_MAP[m]}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 48, alignItems: 'flex-end', flexWrap: 'wrap' }}>

        {/* Full size view */}
        <div>
          <p style={{ fontSize: 11, color: 'rgba(196,181,253,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Full (240×320) — mascot NPC
          </p>
          <div style={{ border: '1px solid rgba(124,58,237,0.3)', borderRadius: 16, overflow: 'hidden', background: 'rgba(124,58,237,0.05)' }}>
            <RobotExpressive
              mood={mood}
              walking={mood === 'walking'}
              width={240}
              height={320}
              cameraY={0.5}
              fov={42}
            />
          </div>
        </div>

        {/* Portrait view */}
        <div>
          <p style={{ fontSize: 11, color: 'rgba(196,181,253,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Portrait (150×270) — dialogue box
          </p>
          <div style={{ border: '1px solid rgba(124,58,237,0.3)', borderRadius: 16, overflow: 'hidden', background: 'rgba(124,58,237,0.05)' }}>
            <RobotExpressivePortrait mood={mood} />
          </div>
        </div>

        {/* Small size (as it appears in the mascot NPC) */}
        <div>
          <p style={{ fontSize: 11, color: 'rgba(196,181,253,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            NPC size (80×100) — actual mascot
          </p>
          <div style={{ border: '1px solid rgba(124,58,237,0.3)', borderRadius: 16, overflow: 'hidden', background: 'rgba(124,58,237,0.05)', display: 'inline-block' }}>
            <RobotExpressive
              mood={mood}
              walking={mood === 'walking'}
              width={80}
              height={100}
              cameraY={0.3}
              fov={50}
            />
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ marginTop: 48, padding: '20px 24px', background: 'rgba(124,58,237,0.08)', borderRadius: 16, border: '1px solid rgba(124,58,237,0.2)', maxWidth: 600 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#C4B5FD', marginBottom: 12 }}>All 14 available animations</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Dance','Death','Idle','Jump','No','Punch','Running','Sitting','Standing','ThumbsUp','Walking','WalkJump','Wave','Yes'].map(a => (
            <span key={a} style={{ padding: '3px 10px', background: 'rgba(124,58,237,0.15)', borderRadius: 8, fontSize: 11, color: 'rgba(196,181,253,0.8)', border: '1px solid rgba(124,58,237,0.2)' }}>
              {a}
            </span>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'rgba(196,181,253,0.4)', marginTop: 12 }}>
          Model: threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb
        </p>
      </div>
    </div>
  );
}
