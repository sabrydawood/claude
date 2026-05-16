'use client';

/**
 * mascot-gltf.tsx
 * RobotExpressive GLTF mascot — uses the official Three.js demo robot.
 *
 * Key fixes vs naive approach:
 * 1. SkeletonUtils.clone() — properly remaps bone refs in skinned meshes.
 *    scene.clone(true) breaks animation binding (PropertyBinding errors).
 * 2. Ref points to the cloned scene root, not an outer group — so the
 *    AnimationMixer finds bones by name inside the correct hierarchy.
 * 3. Each Canvas instance gets its own independent clone, so multiple
 *    instances on the same page all render correctly (a Three.js Object3D
 *    can only live in ONE scene at a time).
 */

import { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

// ─── Types ───────────────────────────────────────────────────────────────────

export type RobotMood = 'idle' | 'happy' | 'thinking' | 'talking' | 'walking';

interface RobotProps {
  mood: RobotMood;
  walking?: boolean;
}

// ─── Mood → animation name ────────────────────────────────────────────────────

const MOOD_ANIM: Record<RobotMood, string> = {
  idle:     'Idle',
  happy:    'Wave',
  thinking: 'ThumbsUp',
  talking:  'Yes',
  walking:  'Walking',
};

const FADE = 0.35; // crossfade seconds

// ─── Inner robot (must be inside Canvas for useFrame / useAnimations) ─────────

function RobotExpressiveInner({ mood, walking }: RobotProps) {
  const { scene, animations } = useGLTF('/models/RobotExpressive.glb');

  // SkeletonUtils.clone() deep-clones skinned mesh + remaps skeleton refs
  // so every instance has its own independent bone hierarchy.
  const clonedScene = useMemo(
    () => SkeletonUtils.clone(scene) as THREE.Group,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Ref TO the cloned scene root — AnimationMixer needs this as its root
  // so it can find bones by name inside the cloned skeleton.
  const clonedRef = useRef<THREE.Group>(clonedScene);

  const { actions, mixer } = useAnimations(animations, clonedRef);
  const activeAnim = useRef('');

  // Play Idle on mount; clean up mixer on unmount
  useEffect(() => {
    const idle = actions['Idle'];
    if (idle) { idle.play(); activeAnim.current = 'Idle'; }
    return () => { mixer.stopAllAction(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Crossfade to new animation when mood / walking changes
  useEffect(() => {
    const target = walking ? 'Walking' : MOOD_ANIM[mood];
    if (target === activeAnim.current) return;

    const prev = activeAnim.current;
    activeAnim.current = target;

    if (prev && actions[prev]) actions[prev]!.fadeOut(FADE);

    const next = actions[target];
    if (next) {
      next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1);
      next.clampWhenFinished = false;
      next.fadeIn(FADE).play();
    }
  }, [mood, walking, actions]);

  // Gentle float in idle / talking modes
  useFrame(({ clock }) => {
    if (!clonedRef.current) return;
    if (!walking && (mood === 'idle' || mood === 'talking')) {
      clonedRef.current.position.y = Math.sin(clock.elapsedTime * 1.2) * 0.05 - 1.1;
    } else {
      clonedRef.current.position.y = -1.1;
    }
  });

  return (
    <primitive
      ref={clonedRef}
      object={clonedScene}
      scale={1.1}
      position={[0, -1.1, 0]}
      dispose={null}
    />
  );
}

// ─── Shared lighting ──────────────────────────────────────────────────────────

function RobotLighting() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 8, 4]} intensity={1.4} castShadow />
      <pointLight position={[-3, 3, 3]} intensity={0.9} color="#A78BFA" />
      <pointLight position={[0, -1, 4]} intensity={0.4} color="#60A5FA" />
    </>
  );
}

// ─── Public exports ───────────────────────────────────────────────────────────

interface CanvasProps extends RobotProps {
  width?: number;
  height?: number;
  cameraZ?: number;
  cameraY?: number;
  fov?: number;
}

/** Full 3D robot on a transparent canvas — for the NPC mascot. */
export function RobotExpressive({
  mood,
  walking = false,
  width = 100,
  height = 130,
  cameraZ = 3.6,
  cameraY = 0.5,
  fov = 42,
}: CanvasProps) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, cameraY, cameraZ], fov }}
      style={{ width, height, display: 'block', background: 'transparent' }}
    >
      <RobotLighting />
      <RobotExpressiveInner mood={mood} walking={walking} />
    </Canvas>
  );
}

/** Close-up portrait crop for the RPG dialogue box. */
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
      camera={{ position: [0, 0.6, 2.4], fov: 36 }}
      style={{ width, height, display: 'block', background: 'transparent' }}
    >
      <RobotLighting />
      <RobotExpressiveInner mood={mood} walking={false} />
    </Canvas>
  );
}

// Preload so the first render doesn't stall
useGLTF.preload('/models/RobotExpressive.glb');
