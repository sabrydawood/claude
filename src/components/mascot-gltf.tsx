"use client";

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

// ─── Inner robot (must be inside Canvas for useFrame / useAnimations) ─────────

function RobotExpressiveInner({ mood, walking }: RobotProps) {
  const { scene, animations } = useGLTF("/models/RobotExpressive.glb");

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
  const activeAnim = useRef("");

  // Play Idle on mount; clean up mixer on unmount
  useEffect(() => {
    const idle = actions["Idle"];
    if (idle) {
      idle.play();
      activeAnim.current = "Idle";
    }
    return () => {
      mixer.stopAllAction();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Crossfade to new animation when mood / walking changes
  useEffect(() => {
    const target = walking ? "Walking" : MOOD_ANIM[mood];
    if (target === activeAnim.current) return;

    const prev = activeAnim.current;
    activeAnim.current = target;

    if (prev && actions[prev]) actions[prev]!.fadeOut(FADE);

    const next = actions[target];
    if (next) {
      // clampWhenFinished defaults to false in Three.js — no need to set it
      next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(FADE).play();
    }
  }, [mood, walking, actions]);

  // Gentle float in idle / talking modes
  useFrame(({ clock }) => {
    if (!clonedRef.current) return;
    if (!walking && (mood === "idle" || mood === "talking")) {
      clonedRef.current.position.y =
        Math.sin(clock.elapsedTime * 1.2) * 0.05 - 1.1;
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
  facingLeft?: boolean;
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
      style={{ width, height, display: "block", background: "transparent" }}
    >
      <RobotLighting />
      <RobotExpressiveInner mood={mood} walking={walking} />
      {orbitControls && (
        <OrbitControls
          target={[0, 0, 0]}
          enableZoom
          enableRotate
          enablePan={false}
          minDistance={3}
          maxDistance={20}
        />
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
      style={{ width, height, display: "block", background: "transparent" }}
    >
      <RobotLighting />
      <RobotExpressiveInner mood={mood} walking={false} />
      {orbitControls && (
        <OrbitControls
          target={[0, 0.8, 0]}
          enableZoom
          enableRotate
          enablePan={false}
        />
      )}
    </Canvas>
  );
}

// Preload so the first render doesn't stall
useGLTF.preload("/models/RobotExpressive.glb");

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

  // Smooth rotation with shortest-path lerp (no scaleX, no snap)
  useFrame(({ clock }) => {
    if (!clonedRef.current) return;

    const baseRotY = cfg.rotationY ?? 0;
    const targetRotY = walking
      ? baseRotY + (facingLeft ? Math.PI / 2 : -Math.PI / 2)
      : baseRotY;

    // Shortest-path delta: always rotate ≤ 180° (avoids the 270° long-way spin)
    let delta = targetRotY - clonedRef.current.rotation.y;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    else if (delta < -Math.PI) delta += 2 * Math.PI;

    clonedRef.current.rotation.y += delta * 0.15;

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
      style={{ width, height, display: "block", background: "transparent" }}
    >
      <RobotLighting />
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
// Available: agree · headShake · idle · run · sad_pose · sneak_pose · walk

const XBOT_CFG: GltfConfig = {
  modelPath: "/models/Xbot.glb",
  animMap: {
    idle: "idle",        // standing idle breathing
    happy: "agree",      // enthusiastic nodding = happy/excited
    thinking: "sneak_pose", // looking around = more "thinking" than sad
    talking: "agree",    // nodding while speaking
    walking: "walk",
  },
  scale: 2.2,
  positionY: -1.75,
  rotationY: Math.PI,
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

// Portrait: head + chest — cam higher (y=0.8) and close (z=3)
export function XbotPortrait({
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
    <GltfCanvas
      mood={mood}
      cfg={XBOT_CFG}
      width={width}
      height={height}
      camPos={[0, 0.8, 3]}
      camTarget={[0, 0.8, 0]}
      fov={28}
      orbitControls={orbitControls}
    />
  );
}

// ─── Soldier ──────────────────────────────────────────────────────────────────

const SOLDIER_CFG: GltfConfig = {
  modelPath: "/models/Soldier.glb",
  animMap: {
    idle: "Idle",
    happy: "Idle",
    thinking: "Idle",
    talking: "Idle",
    walking: "Walk",
  },
  scale: 1.0,
  positionY: -1.75,
  rotationY: Math.PI,
};

export function SoldierExpressive({
  mood,
  walking = false,
  width = 200,
  height = 280,
  orbitControls = false,
}: CanvasProps) {
  return (
    <GltfCanvas
      mood={mood}
      walking={walking}
      cfg={SOLDIER_CFG}
      width={width}
      height={height}
      camPos={[0, 0.2, 7.5]}
      camTarget={[0, 0, 0]}
      fov={40}
      orbitControls={orbitControls}
    />
  );
}

useGLTF.preload("/models/Xbot.glb");
useGLTF.preload("/models/Soldier.glb");
