'use client';

/**
 * mascot-gltf.tsx
 * RobotExpressive GLTF mascot — uses the official Three.js demo robot.
 * Available animations: Dance, Death, Idle, Jump, No, Punch, Running,
 *   Sitting, Standing, ThumbsUp, Walking, WalkJump, Wave, Yes
 */

import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

// ─── Types ───────────────────────────────────────────────────────────────────

export type RobotMood = 'idle' | 'happy' | 'thinking' | 'talking' | 'walking';

interface RobotProps {
  mood: RobotMood;
  walking?: boolean;
}

// ─── Mood → animation mapping ─────────────────────────────────────────────────

const MOOD_ANIM: Record<RobotMood, string> = {
  idle:     'Idle',
  happy:    'Wave',
  thinking: 'ThumbsUp',
  talking:  'Yes',
  walking:  'Walking',
};

// ─── Inner robot (inside Canvas so useFrame works) ───────────────────────────

function RobotExpressiveInner({ mood, walking }: RobotProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/models/RobotExpressive.glb');
  const { actions, mixer } = useAnimations(animations, group);

  const currentAnim = useRef<string>('');
  const fadeTime = 0.4;

  // Clone the scene so multiple instances don't share state
  const clonedScene = useRef<THREE.Group | null>(null);
  if (!clonedScene.current) {
    clonedScene.current = scene.clone(true);
  }

  // Switch animation when mood or walking changes
  useEffect(() => {
    const targetAnim = walking ? 'Walking' : MOOD_ANIM[mood];
    if (targetAnim === currentAnim.current) return;

    const prev = currentAnim.current;
    currentAnim.current = targetAnim;

    // Fade out previous
    if (prev && actions[prev]) {
      actions[prev]?.fadeOut(fadeTime);
    }

    // Fade in new
    const next = actions[targetAnim];
    if (next) {
      next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1);
      next.clampWhenFinished = false;
      next.fadeIn(fadeTime).play();
    }
  }, [mood, walking, actions]);

  // Play idle on mount
  useEffect(() => {
    const idle = actions['Idle'];
    if (idle) {
      idle.play();
      currentAnim.current = 'Idle';
    }
    return () => { mixer.stopAllAction(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gentle floating bob in idle/talking
  useFrame(({ clock }) => {
    if (!group.current) return;
    if (!walking && (mood === 'idle' || mood === 'talking')) {
      group.current.position.y = Math.sin(clock.elapsedTime * 1.2) * 0.04;
    }
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} scale={1.1} position={[0, -1.1, 0]} />
    </group>
  );
}

// ─── Lighting ─────────────────────────────────────────────────────────────────

function RobotLighting() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 8, 4]} intensity={1.4} color="#ffffff" castShadow />
      <pointLight position={[-3, 3, 3]} intensity={0.9} color="#A78BFA" />
      <pointLight position={[0, -1, 4]} intensity={0.4} color="#60A5FA" />
    </>
  );
}

// ─── Public: full canvas robot (for mascot NPC) ───────────────────────────────

interface CanvasProps extends RobotProps {
  width?: number;
  height?: number;
  cameraY?: number;
  fov?: number;
}

export function RobotExpressive({
  mood,
  walking = false,
  width = 100,
  height = 130,
  cameraY = 0.5,
  fov = 42,
}: CanvasProps) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, cameraY, 3.6], fov }}
      style={{ width, height, background: 'transparent' }}
    >
      <RobotLighting />
      <RobotExpressiveInner mood={mood} walking={walking} />
    </Canvas>
  );
}

// ─── Portrait variant (close-up for dialogue box) ────────────────────────────

export function RobotExpressivePortrait({
  mood,
  width = 150,
  height = 270,
}: {
  mood: RobotMood;
  width?: number;
  height?: number;
}) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 1.1, 2.6], fov: 38 }}
      style={{ width, height, background: 'transparent' }}
    >
      <RobotLighting />
      <RobotExpressiveInner mood={mood} walking={false} />
    </Canvas>
  );
}

// Preload the model
useGLTF.preload('/models/RobotExpressive.glb');
