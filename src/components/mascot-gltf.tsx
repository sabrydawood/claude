"use client";

/**
 * mascot-gltf.tsx
 * Xbot (Mixamo) 3D mascot — the one and only mascot for Zkawi.
 *
 * Key implementation notes:
 * 1. SkeletonUtils.clone() — properly remaps bone refs in skinned meshes.
 * 2. rotationY=0 because Xbot faces +Z by default (unlike most Mixamo models).
 * 3. Walking direction: facingLeft ? -π/2 : +π/2 offset from base.
 */

import { useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";

// ─── Types ───────────────────────────────────────────────────────────────────

export type RobotMood = "idle" | "happy" | "thinking" | "talking" | "walking";

interface RobotProps {
  mood: RobotMood;
  walking?: boolean;
}

// ─── Mood → animation name ────────────────────────────────────────────────────

const MOOD_ANIM: Record<RobotMood, string> = {
  idle: "Idle",
  happy: "Wave",
  thinking: "ThumbsUp",
  talking: "Yes",
  walking: "Walking",
};

const FADE = 0.35; // crossfade seconds

interface CanvasProps extends RobotProps {
  width?: number;
  height?: number;
  facingLeft?: boolean;
  orbitControls?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic GLTF character — parameterised model path + animation map
// ─────────────────────────────────────────────────────────────────────────────

interface GltfConfig {
  modelPath: string;
  animMap: Record<RobotMood, string>;
  scale?: number;
  positionY?: number;
  rotationY?: number;
  /** Optional hex color to tint all mesh materials */
  tint?: string;
  /** If true, skip the sin-wave float (GLTF models with their own idle anim don't need it) */
  noFloat?: boolean;
}

function GltfModelInner({
  mood,
  walking,
  cfg,
  facingLeft = false,
}: RobotProps & { cfg: GltfConfig; facingLeft?: boolean }) {
  const { scene, animations } = useGLTF(cfg.modelPath);
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene) as THREE.Group;
    // Set rotation synchronously BEFORE any useFrame runs to avoid the
    // "rotation snap" bug where useEffect runs one frame after useFrame starts.
    clone.rotation.y = cfg.rotationY ?? 0;
    return clone;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const clonedRef = useRef<THREE.Group>(clonedScene);
  const { actions, mixer } = useAnimations(animations, clonedRef);
  const activeAnim = useRef("");

  // Apply tint color to all mesh materials on mount
  useEffect(() => {
    if (!cfg.tint) return;
    const color = new THREE.Color(cfg.tint);
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        mats.forEach((m: THREE.Material) => {
          const sm = m as THREE.MeshStandardMaterial;
          if (sm.color) sm.color.set(color);
          sm.metalness = 0.3;
          sm.roughness = 0.5;
          sm.needsUpdate = true;
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Play idle when actions first become available (actions populate after first render,
  // so [] deps would miss them — depend on actions to retry)
  useEffect(() => {
    const first = cfg.animMap["idle"];
    const a = actions[first];
    if (a && !activeAnim.current) {
      a.play();
      activeAnim.current = first;
    }
    return () => { mixer.stopAllAction(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  // Crossfade when mood / walking changes
  useEffect(() => {
    console.log({
      mood,
      walking,
      cfg,
      activeAnim: activeAnim.current,
      target: walking ? cfg.animMap["walking"] : cfg.animMap[mood],
    })
    const target = walking ? cfg.animMap["walking"] : cfg.animMap[mood];
    if (!target || target === activeAnim.current) return;
    const prev = activeAnim.current;
    activeAnim.current = target;
    if (prev && actions[prev]) actions[prev]!.fadeOut(0.35);
    const next = actions[target];
    if (next) {
      next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(0.35).play();
    }
  }, [mood, walking, actions, cfg]);

  // Track previous walking/facingLeft to detect walk-start transitions
  const prevWalkingRef = useRef(false);
  const prevFacingRef = useRef(facingLeft);

  // Rotation strategy:
  //   Walk START or direction change → snap immediately (no lag during movement)
  //   Walk STOP → slow smooth lerp back to face camera (looks natural)
  useFrame(({ clock }) => {
    if (!clonedRef.current) return;

    const baseRotY = cfg.rotationY ?? 0;
    const targetRotY = walking
      ? baseRotY + (facingLeft ? -Math.PI / 2 : Math.PI / 2)
      : baseRotY;

    const justStartedWalking = walking && !prevWalkingRef.current;
    const changedDirection = walking && facingLeft !== prevFacingRef.current;
    prevWalkingRef.current = !!walking;
    prevFacingRef.current = facingLeft;

    if (justStartedWalking || changedDirection) {
      // SNAP: instant rotation when walk begins or direction changes
      // This prevents the slow 90° turn-during-movement that causes shaking
      clonedRef.current.rotation.y = targetRotY;
    } else {
      // LERP: smooth only when stopping (idle ← walking)
      let delta = targetRotY - clonedRef.current.rotation.y;
      if (delta > Math.PI) delta -= 2 * Math.PI;
      else if (delta < -Math.PI) delta += 2 * Math.PI;
      clonedRef.current.rotation.y += delta * 0.12;
    }

    // Float (only for models without their own idle animation)
    if (!cfg.noFloat) {
      const baseY = cfg.positionY ?? 0;
      clonedRef.current.position.y =
        !walking && (mood === "idle" || mood === "talking")
          ? baseY + Math.sin(clock.elapsedTime * 1.2) * 0.04
          : baseY;
    }
  });

  return (
    <primitive
      ref={clonedRef}
      object={clonedScene}
      scale={cfg.scale ?? 1}
      position={[0, cfg.positionY ?? 0, 0]}
      dispose={null}
    />
  );
}

function GltfCanvas({
  mood,
  walking = false,
  facingLeft = false,
  cfg,
  width = 200,
  height = 280,
  camPos,
  camTarget,
  fov,
  orbitControls = false,
}: RobotProps & {
  facingLeft?: boolean;
  cfg: GltfConfig;
  width?: number;
  height?: number;
  camPos: [number, number, number];
  camTarget: [number, number, number];
  fov: number;
  orbitControls?: boolean;
}) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      camera={{ position: camPos, fov }}
      style={{ width, height, display: "block", background: "transparent", pointerEvents: orbitControls ? "auto" : "none" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 8, 4]} intensity={1.4} castShadow />
      <pointLight position={[-3, 3, 3]} intensity={0.9} color="#A78BFA" />
      <pointLight position={[0, -1, 4]} intensity={0.4} color="#60A5FA" />
      <GltfModelInner mood={mood} walking={walking} facingLeft={facingLeft} cfg={cfg} />
      {/* Always render OrbitControls to set camera lookAt (target) correctly.
          enableZoom/enableRotate controlled by orbitControls prop. */}
      <OrbitControls
        target={camTarget}
        enableZoom={orbitControls}
        enableRotate={orbitControls}
        enablePan={false}
        minDistance={2}
        maxDistance={20}
      />
    </Canvas>
  );
}

// ─── Xbot (Mixamo humanoid) ────────────────────────────────────────────────────
// Available: agree · headShake · idle · run · sad_pose · headshake · walk

const XBOT_CFG: GltfConfig = {
  modelPath: "/models/Xbot.glb",
  animMap: {
    idle: "idle",        // standing idle breathing
    happy: "agree",      // enthusiastic nodding = happy/excited
    thinking: "headshake", // looking around = more "thinking" than sad
    talking: "agree",    // nodding while speaking
    walking: "walk",
  },
  scale: 2.2,
  positionY: -1.75,
  rotationY: 0,
  tint: "#7C3AED", // Zkawi purple
  noFloat: true, // Xbot has its own idle animation, no extra float needed
};

// Full body: fov tighter (32) + camera moved back (z=9) for better full-body framing
export function XbotExpressive({
  mood,
  walking = false,
  facingLeft = false,
  width = 200,
  height = 280,
  orbitControls = false,
}: CanvasProps) {
  return (
    <GltfCanvas
      mood={mood}
      walking={walking}
      facingLeft={facingLeft}
      cfg={XBOT_CFG}
      width={width}
      height={height}
      camPos={[0, 0, 9]}
      camTarget={[0, 0, 0]}
      fov={32}
      orbitControls={orbitControls}
    />
  );
}

useGLTF.preload("/models/Xbot.glb");
