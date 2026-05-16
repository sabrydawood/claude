'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ZakiRobotProps {
  mood: 'idle' | 'happy' | 'thinking' | 'talking';
  walking: boolean;
  scale?: number;
}

interface ZakiPortraitProps {
  mood: 'idle' | 'happy' | 'thinking' | 'talking';
  talking: boolean;
  width?: number;
  height?: number;
}

// ─── Materials (constants, not recreated per frame) ─────────────────────────

const purpleMat = { color: '#7C3AED', metalness: 0.4, roughness: 0.4 };
const darkMat   = { color: '#4C1D95', metalness: 0.5, roughness: 0.3 };
const bodyMat   = { color: '#6D28D9', metalness: 0.3, roughness: 0.5 };

// ─── Inner robot (must be inside Canvas to use useFrame) ───────────────────

function ZakiRobotInner({ mood, walking, scale = 1 }: ZakiRobotProps) {
  // Mesh refs for body-part animation
  const rootRef        = useRef<THREE.Group>(null);
  const headRef        = useRef<THREE.Mesh>(null);
  const bodyRef        = useRef<THREE.Mesh>(null);
  const leftArmRef     = useRef<THREE.Mesh>(null);
  const rightArmRef    = useRef<THREE.Mesh>(null);
  const leftLegRef     = useRef<THREE.Mesh>(null);
  const rightLegRef    = useRef<THREE.Mesh>(null);
  const antennaTipRef  = useRef<THREE.Mesh>(null);

  // Material refs for emissive intensity animation
  const leftEyeMatRef      = useRef<THREE.MeshStandardMaterial>(null);
  const rightEyeMatRef     = useRef<THREE.MeshStandardMaterial>(null);
  const antennaTipMatRef   = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    // ── Eye glow pulse ────────────────────────────────
    const eyeGlow = Math.sin(t * 2) * 0.5 + 1.5;
    if (leftEyeMatRef.current)  leftEyeMatRef.current.emissiveIntensity  = eyeGlow;
    if (rightEyeMatRef.current) rightEyeMatRef.current.emissiveIntensity = eyeGlow;

    // ── Antenna tip pulse ─────────────────────────────
    const antennaGlow = Math.sin(t * 3) * 1 + 2;
    if (antennaTipMatRef.current) antennaTipMatRef.current.emissiveIntensity = antennaGlow;

    // ── Idle: gentle body bob + head tilt ─────────────
    if (mood === 'idle' && !walking) {
      if (bodyRef.current)  bodyRef.current.position.y  = Math.sin(t * 1.5) * 0.04;
      if (headRef.current)  headRef.current.rotation.z  = Math.sin(t * 0.8) * 0.05;
      if (leftArmRef.current)  leftArmRef.current.rotation.z  = -0.2;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.2;
      if (leftLegRef.current)  leftLegRef.current.rotation.x  = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
    }

    // ── Happy: arms wave alternating ──────────────────
    if (mood === 'happy' && !walking) {
      if (bodyRef.current)  bodyRef.current.position.y  = Math.sin(t * 2.5) * 0.05;
      if (headRef.current)  headRef.current.rotation.z  = Math.sin(t * 1.2) * 0.08;
      const wave = Math.sin(t * 4) * 0.5;
      if (leftArmRef.current)  leftArmRef.current.rotation.z  = -0.2 - wave;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.2 + wave;
    }

    // ── Thinking: slow head tilt side-to-side ─────────
    if (mood === 'thinking') {
      if (headRef.current)  headRef.current.rotation.z  = Math.sin(t * 0.6) * 0.12;
      if (bodyRef.current)  bodyRef.current.position.y  = Math.sin(t * 0.9) * 0.02;
      if (leftArmRef.current)  leftArmRef.current.rotation.z  = -0.35;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.1;
    }

    // ── Talking: head bobs faster ─────────────────────
    if (mood === 'talking') {
      if (headRef.current)  headRef.current.position.y  = 0.9 + Math.sin(t * 3) * 0.06;
      if (bodyRef.current)  bodyRef.current.position.y  = Math.sin(t * 3) * 0.03;
      if (leftArmRef.current)  leftArmRef.current.rotation.z  = -0.2 + Math.sin(t * 2.5) * 0.15;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.2 - Math.sin(t * 2.5) * 0.15;
    }

    // ── Walking: arms swing + legs stride ─────────────
    if (walking) {
      const swing = Math.sin(t * 5);
      if (leftArmRef.current)  leftArmRef.current.rotation.z  = -0.2 - swing * 0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.2 + swing * 0.4;
      if (leftLegRef.current)  leftLegRef.current.rotation.x  =  swing * 0.25;
      if (rightLegRef.current) rightLegRef.current.rotation.x  = -swing * 0.25;
      if (bodyRef.current)  bodyRef.current.position.y  = Math.abs(Math.sin(t * 5)) * 0.03;
      if (headRef.current)  headRef.current.rotation.z  = 0;
    }
  });

  return (
    <group ref={rootRef} scale={scale}>

      {/* ── Antenna shaft ─────────────────────────────── */}
      <mesh position={[0, 1.32, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.28, 8]} />
        <meshStandardMaterial color="#5B21B6" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* ── Antenna tip (emissive gold) ───────────────── */}
      <mesh ref={antennaTipRef} position={[0, 1.47, 0]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial
          ref={antennaTipMatRef}
          color="#FCD34D"
          emissive="#FCD34D"
          emissiveIntensity={2}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>

      {/* ── Head ──────────────────────────────────────── */}
      <mesh ref={headRef} position={[0, 0.9, 0]}>
        <RoundedBox args={[0.9, 0.65, 0.75]} radius={0.12} smoothness={4}>
          <meshStandardMaterial {...purpleMat} />
        </RoundedBox>
      </mesh>

      {/* ── Head shine (specular highlight plane) ────── */}
      <mesh position={[0.12, 1.07, 0.38]} rotation={[Math.PI / 6, 0, Math.PI / 8]}>
        <planeGeometry args={[0.18, 0.07]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.18}
          metalness={0}
          roughness={0}
        />
      </mesh>

      {/* ── Left eye (emissive cyan) ─────────────────── */}
      <mesh position={[-0.22, 0.92, 0.38]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial
          ref={leftEyeMatRef}
          color="#00E5FF"
          emissive="#00E5FF"
          emissiveIntensity={2}
          metalness={0}
          roughness={0.1}
        />
      </mesh>

      {/* ── Left pupil ───────────────────────────────── */}
      <mesh position={[-0.22, 0.92, 0.445]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color="#003040" metalness={0} roughness={0.8} />
      </mesh>

      {/* ── Right eye (emissive cyan) ────────────────── */}
      <mesh position={[0.22, 0.92, 0.38]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial
          ref={rightEyeMatRef}
          color="#00E5FF"
          emissive="#00E5FF"
          emissiveIntensity={2}
          metalness={0}
          roughness={0.1}
        />
      </mesh>

      {/* ── Right pupil ──────────────────────────────── */}
      <mesh position={[0.22, 0.92, 0.445]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color="#003040" metalness={0} roughness={0.8} />
      </mesh>

      {/* ── Neck ─────────────────────────────────────── */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.15, 12]} />
        <meshStandardMaterial color="#5B21B6" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* ── Body ─────────────────────────────────────── */}
      <mesh ref={bodyRef} position={[0, 0.06, 0]}>
        <RoundedBox args={[0.78, 0.82, 0.62]} radius={0.1} smoothness={4}>
          <meshStandardMaterial {...bodyMat} />
        </RoundedBox>
      </mesh>

      {/* ── Chest panel (dark inset) ─────────────────── */}
      <mesh position={[0, 0.1, 0.33]}>
        <RoundedBox args={[0.42, 0.28, 0.05]} radius={0.04} smoothness={3}>
          <meshStandardMaterial {...darkMat} />
        </RoundedBox>
      </mesh>

      {/* ── Left chest button (gold) ─────────────────── */}
      <mesh position={[-0.1, 0.12, 0.37]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial
          color="#FCD34D"
          emissive="#FCD34D"
          emissiveIntensity={1.2}
          metalness={0.3}
          roughness={0.3}
        />
      </mesh>

      {/* ── Right chest button (green) ───────────────── */}
      <mesh position={[0.1, 0.12, 0.37]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial
          color="#34D399"
          emissive="#34D399"
          emissiveIntensity={1.2}
          metalness={0.3}
          roughness={0.3}
        />
      </mesh>

      {/* ── Left arm ─────────────────────────────────── */}
      <mesh ref={leftArmRef} position={[-0.52, 0.06, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.11, 0.11, 0.62, 10]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>

      {/* ── Right arm ────────────────────────────────── */}
      <mesh ref={rightArmRef} position={[0.52, 0.06, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.11, 0.11, 0.62, 10]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>

      {/* ── Left hand ────────────────────────────────── */}
      <mesh position={[-0.52, -0.27, 0]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial {...purpleMat} />
      </mesh>

      {/* ── Right hand ───────────────────────────────── */}
      <mesh position={[0.52, -0.27, 0]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial {...purpleMat} />
      </mesh>

      {/* ── Left leg ─────────────────────────────────── */}
      <mesh ref={leftLegRef} position={[-0.2, -0.62, 0]}>
        <RoundedBox args={[0.24, 0.55, 0.24]} radius={0.06} smoothness={3}>
          <meshStandardMaterial {...darkMat} />
        </RoundedBox>
      </mesh>

      {/* ── Right leg ────────────────────────────────── */}
      <mesh ref={rightLegRef} position={[0.2, -0.62, 0]}>
        <RoundedBox args={[0.24, 0.55, 0.24]} radius={0.06} smoothness={3}>
          <meshStandardMaterial {...darkMat} />
        </RoundedBox>
      </mesh>

      {/* ── Left foot ────────────────────────────────── */}
      <mesh position={[-0.2, -0.93, 0.05]}>
        <RoundedBox args={[0.3, 0.16, 0.42]} radius={0.06} smoothness={3}>
          <meshStandardMaterial color="#3B0764" metalness={0.5} roughness={0.4} />
        </RoundedBox>
      </mesh>

      {/* ── Right foot ───────────────────────────────── */}
      <mesh position={[0.2, -0.93, 0.05]}>
        <RoundedBox args={[0.3, 0.16, 0.42]} radius={0.06} smoothness={3}>
          <meshStandardMaterial color="#3B0764" metalness={0.5} roughness={0.4} />
        </RoundedBox>
      </mesh>

    </group>
  );
}

// ─── Portrait inner (tighter crop, same robot) ──────────────────────────────

function ZakiPortraitInner({ mood, talking }: ZakiPortraitProps) {
  return (
    <ZakiRobotInner
      mood={talking ? 'talking' : mood}
      walking={false}
      scale={0.9}
    />
  );
}

// ─── Public components ───────────────────────────────────────────────────────

/**
 * Full 3D robot canvas — transparent background, no orbit controls.
 * Suitable for embedding in a sidebar or hero section.
 */
export function ZakiRobot({ mood, walking, scale = 1 }: ZakiRobotProps) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 3.5], fov: 45 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 3]} intensity={1.2} color="#ffffff" castShadow />
      <pointLight position={[-2, 2, 2]} intensity={0.8} color="#A78BFA" />
      <pointLight position={[0, -1, 3]} intensity={0.4} color="#00E5FF" />
      <ZakiRobotInner mood={mood} walking={walking} scale={scale} />
    </Canvas>
  );
}

/**
 * Small portrait canvas for the RPG dialogue box — shows head + upper body.
 * Fixed at 90×110px.
 */
export function ZakiPortrait({ mood, talking, width = 90, height = 110 }: ZakiPortraitProps) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.2, 2.8], fov: 40 }}
      style={{ width, height, background: 'transparent' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 4, 3]} intensity={1.1} color="#ffffff" />
      <pointLight position={[-1.5, 1.5, 2]} intensity={0.7} color="#A78BFA" />
      <pointLight position={[0, -0.5, 2]} intensity={0.3} color="#00E5FF" />
      <ZakiPortraitInner mood={mood} talking={talking} />
    </Canvas>
  );
}
