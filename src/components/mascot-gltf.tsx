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
import { useGLTF, useAnimations, OrbitControls } from '@react-three/drei';
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

  // Offset by -1.75 so robot center lands at world y=0:
  //   feet  ≈ -1.75,  chest ≈ 0.25,  head ≈ 1.75
  // Model faces -Z → rotate π so it faces camera at +Z
  return (
    <primitive
      ref={clonedRef}
      object={clonedScene}
      scale={1.0}
      position={[0, -1.75, 0]}
      rotation={[0, Math.PI, 0]}
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
  /** Allow user to rotate/zoom — useful for dev preview pages */
  orbitControls?: boolean;
}

/*
 * Camera calibration — model centered at y=0 (position=[0,-1.75,0]):
 *   feet≈-1.75  waist≈-0.75  chest≈0.25  head≈1.75
 *
 * Full body: cam at [0,0.4,6] tilted slightly up, lookAt=[0,0,0]
 *   → half_h=6*tan21°=2.30 → visible [-1.90, 2.70] → covers feet+head ✓
 *   → face (y≈1.3) appears at upper-center of frame
 *
 * Portrait: cam at [0,1.4,2.5], lookAt=[0,1.4,0]
 *   → half_h=2.5*tan15°=0.67 → visible [0.73, 2.07] → head area ✓
 */

export function RobotExpressive({
  mood,
  walking = false,
  width = 100,
  height = 130,
  orbitControls = false,
}: CanvasProps) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.2, 7.5], fov: 40 }}
      style={{ width, height, display: 'block', background: 'transparent' }}
    >
      <RobotLighting />
      <RobotExpressiveInner mood={mood} walking={walking} />
      {orbitControls && (
        <OrbitControls target={[0, 0, 0]} enableZoom enableRotate enablePan={false} minDistance={3} maxDistance={20} />
      )}
    </Canvas>
  );
}

export function RobotExpressivePortrait({
  mood,
  width = 150,
  height = 270,
  orbitControls = false,
}: {
  mood: RobotMood;
  width?: number;
  height?: number;
  orbitControls?: boolean;
}) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.8, 2.8], fov: 32 }}
      style={{ width, height, display: 'block', background: 'transparent' }}
    >
      <RobotLighting />
      <RobotExpressiveInner mood={mood} walking={false} />
      {orbitControls && (
        <OrbitControls target={[0, 0.8, 0]} enableZoom enableRotate enablePan={false} />
      )}
    </Canvas>
  );
}

// Preload so the first render doesn't stall
useGLTF.preload('/models/RobotExpressive.glb');
