'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { ZakiRobot } from '@/components/mascot-3d';

// ─── Shared types ────────────────────────────────────────────────────────────

export type Mood = 'idle' | 'happy' | 'thinking' | 'talking';

export interface CharacterProps {
  mood: Mood;
  walking?: boolean;
  width?: number;
  height?: number;
}

// ─── Shared lighting ─────────────────────────────────────────────────────────

function CharacterLighting() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 3]} intensity={1.0} color="#ffffff" />
      <pointLight position={[-2, 1, 3]} intensity={0.7} color="#A78BFA" />
      <pointLight position={[0, -2, 2]} intensity={0.3} color="#60A5FA" />
    </>
  );
}

// ─── 1. Zaki — re-export wrapper ─────────────────────────────────────────────

export function ZakiCharacter({ mood, walking = false }: CharacterProps) {
  return <ZakiRobot mood={mood} walking={walking} />;
}

// ─── 2. Luna — round feminine blue robot ─────────────────────────────────────

function LunaInner({ mood, walking = false }: CharacterProps) {
  const bodyRef        = useRef<THREE.Mesh>(null);
  const headRef        = useRef<THREE.Mesh>(null);
  const leftArmRef     = useRef<THREE.Mesh>(null);
  const rightArmRef    = useRef<THREE.Mesh>(null);
  const leftLegRef     = useRef<THREE.Mesh>(null);
  const rightLegRef    = useRef<THREE.Mesh>(null);
  const leftEyeMatRef  = useRef<THREE.MeshStandardMaterial>(null);
  const rightEyeMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const eyeGlow = Math.sin(t * 2) * 0.5 + 1.5;
    if (leftEyeMatRef.current)  leftEyeMatRef.current.emissiveIntensity  = eyeGlow;
    if (rightEyeMatRef.current) rightEyeMatRef.current.emissiveIntensity = eyeGlow;

    if (walking) {
      const sw = Math.sin(t * 5);
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.2 - sw * 0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.2 + sw * 0.4;
      if (leftLegRef.current)  leftLegRef.current.rotation.x   =  sw * 0.25;
      if (rightLegRef.current) rightLegRef.current.rotation.x  = -sw * 0.25;
      if (bodyRef.current)     bodyRef.current.position.y       = Math.abs(Math.sin(t * 5)) * 0.03;
      return;
    }
    if (mood === 'idle') {
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 1.5) * 0.04;
      if (headRef.current)     headRef.current.rotation.z      = Math.sin(t * 0.8) * 0.05;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.2;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.2;
      if (leftLegRef.current)  leftLegRef.current.rotation.x   = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x  = 0;
    }
    if (mood === 'happy') {
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 2.5) * 0.07;
      if (headRef.current)     headRef.current.rotation.z      = Math.sin(t * 1.2) * 0.1;
      const wave = Math.sin(t * 4) * 0.55;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.2 - wave;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.2 + wave;
    }
    if (mood === 'thinking') {
      if (headRef.current)     headRef.current.rotation.z      = Math.sin(t * 0.6) * 0.15;
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 0.9) * 0.02;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.1;
    }
    if (mood === 'talking') {
      if (headRef.current)     headRef.current.rotation.x      = Math.sin(t * 5) * 0.06;
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 3) * 0.03;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.2 + Math.sin(t * 2.5) * 0.15;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.2 - Math.sin(t * 2.5) * 0.15;
    }
  });

  return (
    <group>
      {/* Bow left sphere */}
      <mesh position={[-0.18, 1.28, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#F472B6" emissive="#F472B6" emissiveIntensity={0.8} />
      </mesh>
      {/* Bow right sphere */}
      <mesh position={[0.18, 1.28, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#F472B6" emissive="#F472B6" emissiveIntensity={0.8} />
      </mesh>
      {/* Bow connector */}
      <mesh position={[0, 1.28, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.36, 8]} />
        <meshStandardMaterial color="#F472B6" />
      </mesh>
      {/* Head — flattened sphere */}
      <mesh ref={headRef} position={[0, 0.88, 0]} scale={[1, 0.92, 0.9]}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial color="#60A5FA" metalness={0.2} roughness={0.4} />
      </mesh>
      {/* Face plate */}
      <mesh position={[0, 0.88, 0.46]}>
        <circleGeometry args={[0.32, 24]} />
        <meshStandardMaterial color="#93C5FD" metalness={0.1} roughness={0.5} />
      </mesh>
      {/* Left eyelashes */}
      <mesh position={[-0.18, 1.01, 0.5]} rotation={[0.3, 0, -0.3]}>
        <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
        <meshStandardMaterial color="#1E40AF" />
      </mesh>
      <mesh position={[-0.12, 1.03, 0.5]} rotation={[0.3, 0, -0.1]}>
        <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
        <meshStandardMaterial color="#1E40AF" />
      </mesh>
      {/* Right eyelashes */}
      <mesh position={[0.18, 1.01, 0.5]} rotation={[0.3, 0, 0.3]}>
        <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
        <meshStandardMaterial color="#1E40AF" />
      </mesh>
      <mesh position={[0.12, 1.03, 0.5]} rotation={[0.3, 0, 0.1]}>
        <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
        <meshStandardMaterial color="#1E40AF" />
      </mesh>
      {/* Left eye */}
      <mesh position={[-0.18, 0.92, 0.5]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial ref={leftEyeMatRef} color="#F472B6" emissive="#F472B6" emissiveIntensity={2.5} metalness={0} roughness={0.1} />
      </mesh>
      <mesh position={[-0.18, 0.92, 0.625]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color="#1a0020" />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.18, 0.92, 0.5]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial ref={rightEyeMatRef} color="#F472B6" emissive="#F472B6" emissiveIntensity={2.5} metalness={0} roughness={0.1} />
      </mesh>
      <mesh position={[0.18, 0.92, 0.625]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color="#1a0020" />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.14, 10]} />
        <meshStandardMaterial color="#3B82F6" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0.0, 0]}>
        <cylinderGeometry args={[0.42, 0.36, 0.7, 18]} />
        <meshStandardMaterial color="#60A5FA" metalness={0.25} roughness={0.45} />
      </mesh>
      {/* Body accent ring */}
      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[0.38, 0.03, 8, 24]} />
        <meshStandardMaterial color="#F472B6" emissive="#F472B6" emissiveIntensity={0.6} />
      </mesh>
      {/* Left arm + hand */}
      <mesh ref={leftArmRef} position={[-0.55, 0.08, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.58, 10]} />
        <meshStandardMaterial color="#93C5FD" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[-0.58, -0.24, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#F472B6" emissive="#F472B6" emissiveIntensity={0.4} />
      </mesh>
      {/* Right arm + hand */}
      <mesh ref={rightArmRef} position={[0.55, 0.08, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.58, 10]} />
        <meshStandardMaterial color="#93C5FD" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[0.58, -0.24, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#F472B6" emissive="#F472B6" emissiveIntensity={0.4} />
      </mesh>
      {/* Left leg + foot */}
      <mesh ref={leftLegRef} position={[-0.18, -0.58, 0]}>
        <cylinderGeometry args={[0.13, 0.11, 0.46, 10]} />
        <meshStandardMaterial color="#3B82F6" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[-0.18, -0.88, 0.06]}>
        <sphereGeometry args={[0.17, 14, 14]} />
        <meshStandardMaterial color="#2563EB" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Right leg + foot */}
      <mesh ref={rightLegRef} position={[0.18, -0.58, 0]}>
        <cylinderGeometry args={[0.13, 0.11, 0.46, 10]} />
        <meshStandardMaterial color="#3B82F6" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[0.18, -0.88, 0.06]}>
        <sphereGeometry args={[0.17, 14, 14]} />
        <meshStandardMaterial color="#2563EB" metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

export function LunaCharacter({ mood, walking = false, width = 160, height = 200 }: CharacterProps) {
  return (
    <Canvas gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0.2, 3.2], fov: 42 }} style={{ width, height, background: 'transparent' }}>
      <CharacterLighting />
      <LunaInner mood={mood} walking={walking} />
    </Canvas>
  );
}

// ─── 3. Rex — bulky tough red/orange robot ────────────────────────────────────

function RexInner({ mood, walking = false }: CharacterProps) {
  const bodyRef     = useRef<THREE.Mesh>(null);
  const headRef     = useRef<THREE.Mesh>(null);
  const leftArmRef  = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef  = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const eyeMatRef   = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (eyeMatRef.current) eyeMatRef.current.emissiveIntensity = Math.sin(t * 2) * 0.7 + 2.3;

    if (walking) {
      const sw = Math.sin(t * 5);
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.15 - sw * 0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.15 + sw * 0.4;
      if (leftLegRef.current)  leftLegRef.current.rotation.x   =  sw * 0.2;
      if (rightLegRef.current) rightLegRef.current.rotation.x  = -sw * 0.2;
      if (bodyRef.current)     bodyRef.current.position.y       = Math.abs(Math.sin(t * 5)) * 0.03;
      return;
    }
    if (mood === 'idle') {
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 1.5) * 0.04;
      if (headRef.current)     headRef.current.rotation.z      = Math.sin(t * 0.8) * 0.04;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.15;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.15;
    }
    if (mood === 'happy') {
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 2.5) * 0.07;
      if (headRef.current)     headRef.current.rotation.z      = Math.sin(t * 1.2) * 0.08;
      const wave = Math.sin(t * 4) * 0.5;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.15 - wave;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.15 + wave;
    }
    if (mood === 'thinking') {
      if (headRef.current)     headRef.current.rotation.z      = Math.sin(t * 0.6) * 0.12;
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 0.9) * 0.02;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.05;
    }
    if (mood === 'talking') {
      if (headRef.current)     headRef.current.rotation.x      = Math.sin(t * 5) * 0.06;
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 3) * 0.03;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.15 + Math.sin(t * 2.5) * 0.15;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.15 - Math.sin(t * 2.5) * 0.15;
    }
  });

  return (
    <group>
      {/* Exhaust pipes */}
      <mesh position={[-0.52, 0.72, -0.28]}>
        <cylinderGeometry args={[0.065, 0.065, 0.38, 8]} />
        <meshStandardMaterial color="#4B1D1D" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.52, 0.72, -0.28]}>
        <cylinderGeometry args={[0.065, 0.065, 0.38, 8]} />
        <meshStandardMaterial color="#4B1D1D" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.88, 0]}>
        <RoundedBox args={[1.1, 0.7, 0.85]} radius={0.08} smoothness={4}>
          <meshStandardMaterial color="#991B1B" metalness={0.55} roughness={0.35} />
        </RoundedBox>
      </mesh>
      {/* Visor */}
      <mesh position={[0, 0.88, 0.44]}>
        <boxGeometry args={[0.92, 0.22, 0.02]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Cyclops eye */}
      <mesh position={[0, 0.88, 0.47]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial ref={eyeMatRef} color="#F97316" emissive="#F97316" emissiveIntensity={3} metalness={0} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.88, 0.58]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color="#200800" />
      </mesh>
      {/* Visor glow strips */}
      <mesh position={[-0.35, 0.88, 0.445]}>
        <boxGeometry args={[0.12, 0.06, 0.01]} />
        <meshStandardMaterial color="#F97316" emissive="#F97316" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.35, 0.88, 0.445]}>
        <boxGeometry args={[0.12, 0.06, 0.01]} />
        <meshStandardMaterial color="#F97316" emissive="#F97316" emissiveIntensity={2} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.22, 0.25, 0.1, 10]} />
        <meshStandardMaterial color="#7F1D1D" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0.02, 0]}>
        <RoundedBox args={[1.1, 1.0, 0.75]} radius={0.08} smoothness={4}>
          <meshStandardMaterial color="#DC2626" metalness={0.4} roughness={0.4} />
        </RoundedBox>
      </mesh>
      {/* Shoulder pads */}
      <mesh position={[-0.72, 0.34, 0]}>
        <RoundedBox args={[0.32, 0.28, 0.45]} radius={0.06} smoothness={4}>
          <meshStandardMaterial color="#B91C1C" metalness={0.5} roughness={0.35} />
        </RoundedBox>
      </mesh>
      <mesh position={[0.72, 0.34, 0]}>
        <RoundedBox args={[0.32, 0.28, 0.45]} radius={0.06} smoothness={4}>
          <meshStandardMaterial color="#B91C1C" metalness={0.5} roughness={0.35} />
        </RoundedBox>
      </mesh>
      {/* Chest plate + accent */}
      <mesh position={[0, 0.08, 0.4]}>
        <boxGeometry args={[0.58, 0.42, 0.04]} />
        <meshStandardMaterial color="#7F1D1D" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.08, 0.425]}>
        <boxGeometry args={[0.3, 0.08, 0.01]} />
        <meshStandardMaterial color="#F97316" emissive="#F97316" emissiveIntensity={1.5} />
      </mesh>
      {/* Left arm + fist */}
      <mesh ref={leftArmRef} position={[-0.75, -0.02, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.18, 0.16, 0.72, 10]} />
        <meshStandardMaterial color="#C41C1C" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[-0.82, -0.42, 0]}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
        <meshStandardMaterial color="#991B1B" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Right arm + fist */}
      <mesh ref={rightArmRef} position={[0.75, -0.02, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.18, 0.16, 0.72, 10]} />
        <meshStandardMaterial color="#C41C1C" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[0.82, -0.42, 0]}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
        <meshStandardMaterial color="#991B1B" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Left leg + boot */}
      <mesh ref={leftLegRef} position={[-0.26, -0.66, 0]}>
        <RoundedBox args={[0.34, 0.58, 0.36]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color="#7F1D1D" metalness={0.4} roughness={0.5} />
        </RoundedBox>
      </mesh>
      <mesh position={[-0.28, -1.0, 0.06]}>
        <RoundedBox args={[0.4, 0.2, 0.52]} radius={0.05} smoothness={3}>
          <meshStandardMaterial color="#4B0909" metalness={0.5} roughness={0.4} />
        </RoundedBox>
      </mesh>
      {/* Right leg + boot */}
      <mesh ref={rightLegRef} position={[0.26, -0.66, 0]}>
        <RoundedBox args={[0.34, 0.58, 0.36]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color="#7F1D1D" metalness={0.4} roughness={0.5} />
        </RoundedBox>
      </mesh>
      <mesh position={[0.28, -1.0, 0.06]}>
        <RoundedBox args={[0.4, 0.2, 0.52]} radius={0.05} smoothness={3}>
          <meshStandardMaterial color="#4B0909" metalness={0.5} roughness={0.4} />
        </RoundedBox>
      </mesh>
    </group>
  );
}

export function RexCharacter({ mood, walking = false, width = 160, height = 200 }: CharacterProps) {
  return (
    <Canvas gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0.2, 3.2], fov: 42 }} style={{ width, height, background: 'transparent' }}>
      <CharacterLighting />
      <RexInner mood={mood} walking={walking} />
    </Canvas>
  );
}

// ─── 4. Byte — retro pixel-art cubic robot ───────────────────────────────────

function ByteInner({ mood, walking = false }: CharacterProps) {
  const bodyRef     = useRef<THREE.Mesh>(null);
  const headRef     = useRef<THREE.Mesh>(null);
  const leftArmRef  = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef  = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const eye1MatRef  = useRef<THREE.MeshStandardMaterial>(null);
  const eye2MatRef  = useRef<THREE.MeshStandardMaterial>(null);
  const eye3MatRef  = useRef<THREE.MeshStandardMaterial>(null);
  const eye4MatRef  = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const eyeGlow = Math.sin(t * 2) * 0.5 + 1.5;
    if (eye1MatRef.current) eye1MatRef.current.emissiveIntensity = eyeGlow;
    if (eye2MatRef.current) eye2MatRef.current.emissiveIntensity = eyeGlow;
    if (eye3MatRef.current) eye3MatRef.current.emissiveIntensity = eyeGlow;
    if (eye4MatRef.current) eye4MatRef.current.emissiveIntensity = eyeGlow;

    if (walking) {
      const sw = Math.sin(t * 5);
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.2 - sw * 0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.2 + sw * 0.4;
      if (leftLegRef.current)  leftLegRef.current.rotation.x   =  sw * 0.25;
      if (rightLegRef.current) rightLegRef.current.rotation.x  = -sw * 0.25;
      if (bodyRef.current)     bodyRef.current.position.y       = Math.abs(Math.sin(t * 5)) * 0.03;
      return;
    }
    if (mood === 'idle') {
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 1.5) * 0.04;
      if (headRef.current)     headRef.current.rotation.z      = Math.sin(t * 0.8) * 0.04;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.2;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.2;
    }
    if (mood === 'happy') {
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 2.5) * 0.07;
      if (headRef.current)     headRef.current.rotation.z      = Math.sin(t * 1.2) * 0.08;
      const wave = Math.sin(t * 4) * 0.5;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.2 - wave;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.2 + wave;
    }
    if (mood === 'thinking') {
      if (headRef.current)     headRef.current.rotation.z      = Math.sin(t * 0.6) * 0.14;
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 0.9) * 0.02;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.05;
    }
    if (mood === 'talking') {
      if (headRef.current)     headRef.current.rotation.x      = Math.sin(t * 5) * 0.06;
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 3) * 0.03;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.2 + Math.sin(t * 2.5) * 0.15;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.2 - Math.sin(t * 2.5) * 0.15;
    }
  });

  const pixelGreen = '#10B981';
  const headColor  = '#1F2937';
  const bodyColor  = '#374151';

  return (
    <group>
      {/* Antenna — pixel stacked cubes */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color={headColor} />
      </mesh>
      <mesh position={[0, 1.52, 0]}>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
        <meshStandardMaterial color={pixelGreen} emissive={pixelGreen} emissiveIntensity={1.5} />
      </mesh>
      {/* Head — perfect cube */}
      <mesh ref={headRef} position={[0, 0.94, 0]}>
        <boxGeometry args={[0.75, 0.75, 0.75]} />
        <meshStandardMaterial color={headColor} metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Face panel */}
      <mesh position={[0, 0.94, 0.385]}>
        <boxGeometry args={[0.62, 0.62, 0.02]} />
        <meshStandardMaterial color="#111827" metalness={0.1} roughness={0.7} />
      </mesh>
      {/* 2x2 pixel eyes */}
      <mesh position={[-0.14, 1.04, 0.4]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshStandardMaterial ref={eye1MatRef} color={pixelGreen} emissive={pixelGreen} emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.14, 1.04, 0.4]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshStandardMaterial ref={eye2MatRef} color={pixelGreen} emissive={pixelGreen} emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.14, 0.86, 0.4]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshStandardMaterial ref={eye3MatRef} color={pixelGreen} emissive={pixelGreen} emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.14, 0.86, 0.4]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshStandardMaterial ref={eye4MatRef} color={pixelGreen} emissive={pixelGreen} emissiveIntensity={2} />
      </mesh>
      {/* Cheek pixel */}
      <mesh position={[0.28, 0.86, 0.4]}>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshStandardMaterial color={pixelGreen} emissive={pixelGreen} emissiveIntensity={1} />
      </mesh>
      {/* Mouth pixel dash */}
      <mesh position={[0, 0.76, 0.4]}>
        <boxGeometry args={[0.22, 0.05, 0.02]} />
        <meshStandardMaterial color={pixelGreen} emissive={pixelGreen} emissiveIntensity={1} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.53, 0]}>
        <boxGeometry args={[0.22, 0.1, 0.22]} />
        <meshStandardMaterial color="#4B5563" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0.04, 0]}>
        <boxGeometry args={[0.85, 0.85, 0.85]} />
        <meshStandardMaterial color={bodyColor} metalness={0.25} roughness={0.65} />
      </mesh>
      {/* Chest panel + pixel accents */}
      <mesh position={[0, 0.1, 0.44]}>
        <boxGeometry args={[0.5, 0.38, 0.02]} />
        <meshStandardMaterial color="#111827" metalness={0.2} roughness={0.6} />
      </mesh>
      <mesh position={[-0.12, 0.14, 0.456]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial color={pixelGreen} emissive={pixelGreen} emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0, 0.14, 0.456]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0.12, 0.14, 0.456]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.5} />
      </mesh>
      {/* Left arm + hand */}
      <mesh ref={leftArmRef} position={[-0.6, 0.04, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.2, 0.68, 0.2]} />
        <meshStandardMaterial color="#4B5563" metalness={0.25} roughness={0.65} />
      </mesh>
      <mesh position={[-0.66, -0.35, 0]}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial color={headColor} metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Right arm + hand */}
      <mesh ref={rightArmRef} position={[0.6, 0.04, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.2, 0.68, 0.2]} />
        <meshStandardMaterial color="#4B5563" metalness={0.25} roughness={0.65} />
      </mesh>
      <mesh position={[0.66, -0.35, 0]}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial color={headColor} metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Left leg + foot */}
      <mesh ref={leftLegRef} position={[-0.22, -0.6, 0]}>
        <boxGeometry args={[0.3, 0.52, 0.3]} />
        <meshStandardMaterial color={bodyColor} metalness={0.25} roughness={0.65} />
      </mesh>
      <mesh position={[-0.22, -0.92, 0.06]}>
        <boxGeometry args={[0.34, 0.14, 0.44]} />
        <meshStandardMaterial color={headColor} metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Right leg + foot */}
      <mesh ref={rightLegRef} position={[0.22, -0.6, 0]}>
        <boxGeometry args={[0.3, 0.52, 0.3]} />
        <meshStandardMaterial color={bodyColor} metalness={0.25} roughness={0.65} />
      </mesh>
      <mesh position={[0.22, -0.92, 0.06]}>
        <boxGeometry args={[0.34, 0.14, 0.44]} />
        <meshStandardMaterial color={headColor} metalness={0.3} roughness={0.6} />
      </mesh>
    </group>
  );
}

export function ByteCharacter({ mood, walking = false, width = 160, height = 200 }: CharacterProps) {
  return (
    <Canvas gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0.2, 3.2], fov: 42 }} style={{ width, height, background: 'transparent' }}>
      <CharacterLighting />
      <ByteInner mood={mood} walking={walking} />
    </Canvas>
  );
}

// ─── 5. Nova — sleek white/silver minimalist robot ───────────────────────────

function NovaInner({ mood, walking = false }: CharacterProps) {
  const bodyRef        = useRef<THREE.Mesh>(null);
  const headRef        = useRef<THREE.Mesh>(null);
  const leftArmRef     = useRef<THREE.Mesh>(null);
  const rightArmRef    = useRef<THREE.Mesh>(null);
  const leftLegRef     = useRef<THREE.Mesh>(null);
  const rightLegRef    = useRef<THREE.Mesh>(null);
  const leftEyeMatRef  = useRef<THREE.MeshStandardMaterial>(null);
  const rightEyeMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const chestMatRef    = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const eyeGlow = Math.sin(t * 2) * 0.5 + 1.5;
    if (leftEyeMatRef.current)  leftEyeMatRef.current.emissiveIntensity  = eyeGlow;
    if (rightEyeMatRef.current) rightEyeMatRef.current.emissiveIntensity = eyeGlow;
    if (chestMatRef.current)    chestMatRef.current.emissiveIntensity     = Math.sin(t * 3) * 0.8 + 1.8;

    if (walking) {
      const sw = Math.sin(t * 5);
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.15 - sw * 0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.15 + sw * 0.4;
      if (leftLegRef.current)  leftLegRef.current.rotation.x   =  sw * 0.25;
      if (rightLegRef.current) rightLegRef.current.rotation.x  = -sw * 0.25;
      if (bodyRef.current)     bodyRef.current.position.y       = Math.abs(Math.sin(t * 5)) * 0.03;
      return;
    }
    if (mood === 'idle') {
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 1.5) * 0.04;
      if (headRef.current)     headRef.current.rotation.z      = Math.sin(t * 0.8) * 0.04;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.15;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.15;
    }
    if (mood === 'happy') {
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 2.5) * 0.07;
      if (headRef.current)     headRef.current.rotation.z      = Math.sin(t * 1.2) * 0.08;
      const wave = Math.sin(t * 4) * 0.5;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.15 - wave;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.15 + wave;
    }
    if (mood === 'thinking') {
      if (headRef.current)     headRef.current.rotation.z      = Math.sin(t * 0.6) * 0.14;
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 0.9) * 0.02;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.05;
    }
    if (mood === 'talking') {
      if (headRef.current)     headRef.current.rotation.x      = Math.sin(t * 5) * 0.06;
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 3) * 0.03;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.15 + Math.sin(t * 2.5) * 0.15;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.15 - Math.sin(t * 2.5) * 0.15;
    }
  });

  return (
    <group>
      {/* Antenna shaft */}
      <mesh position={[0, 1.42, 0]}>
        <cylinderGeometry args={[0.018, 0.012, 0.36, 8]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Antenna tip */}
      <mesh position={[0, 1.62, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={2.5} />
      </mesh>
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.92, 0]}>
        <RoundedBox args={[0.7, 0.85, 0.65]} radius={0.14} smoothness={5}>
          <meshStandardMaterial color="#F8FAFC" metalness={0.3} roughness={0.2} />
        </RoundedBox>
      </mesh>
      {/* Visor band */}
      <mesh position={[0, 0.9, 0.34]}>
        <boxGeometry args={[0.58, 0.18, 0.02]} />
        <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.15} />
      </mesh>
      {/* Eyes — pill shapes */}
      <mesh position={[-0.14, 0.9, 0.36]}>
        <boxGeometry args={[0.1, 0.06, 0.02]} />
        <meshStandardMaterial ref={leftEyeMatRef} color="#38BDF8" emissive="#38BDF8" emissiveIntensity={2.5} />
      </mesh>
      <mesh position={[0.14, 0.9, 0.36]}>
        <boxGeometry args={[0.1, 0.06, 0.02]} />
        <meshStandardMaterial ref={rightEyeMatRef} color="#38BDF8" emissive="#38BDF8" emissiveIntensity={2.5} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.47, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.1, 10]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, -0.06, 0]}>
        <RoundedBox args={[0.55, 1.0, 0.5]} radius={0.1} smoothness={5}>
          <meshStandardMaterial color="#F1F5F9" metalness={0.3} roughness={0.25} />
        </RoundedBox>
      </mesh>
      {/* Chest stripe */}
      <mesh position={[0, -0.04, 0.27]}>
        <boxGeometry args={[0.04, 0.6, 0.02]} />
        <meshStandardMaterial ref={chestMatRef} color="#38BDF8" emissive="#38BDF8" emissiveIntensity={2} />
      </mesh>
      {/* Side accent lines */}
      <mesh position={[-0.18, 0.1, 0.27]}>
        <boxGeometry args={[0.02, 0.28, 0.01]} />
        <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0.18, 0.1, 0.27]}>
        <boxGeometry args={[0.02, 0.28, 0.01]} />
        <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={1} />
      </mesh>
      {/* Left arm + hand */}
      <mesh ref={leftArmRef} position={[-0.4, -0.04, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.09, 0.08, 0.82, 10]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.35} roughness={0.25} />
      </mesh>
      <mesh position={[-0.44, -0.5, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Right arm + hand */}
      <mesh ref={rightArmRef} position={[0.4, -0.04, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.09, 0.08, 0.82, 10]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.35} roughness={0.25} />
      </mesh>
      <mesh position={[0.44, -0.5, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Left leg + foot */}
      <mesh ref={leftLegRef} position={[-0.16, -0.74, 0]}>
        <cylinderGeometry args={[0.1, 0.09, 0.58, 10]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.3} roughness={0.3} />
      </mesh>
      <mesh position={[-0.16, -1.07, 0.06]}>
        <RoundedBox args={[0.24, 0.14, 0.38]} radius={0.06} smoothness={4}>
          <meshStandardMaterial color="#0F172A" metalness={0.6} roughness={0.3} />
        </RoundedBox>
      </mesh>
      {/* Right leg + foot */}
      <mesh ref={rightLegRef} position={[0.16, -0.74, 0]}>
        <cylinderGeometry args={[0.1, 0.09, 0.58, 10]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.3} roughness={0.3} />
      </mesh>
      <mesh position={[0.16, -1.07, 0.06]}>
        <RoundedBox args={[0.24, 0.14, 0.38]} radius={0.06} smoothness={4}>
          <meshStandardMaterial color="#0F172A" metalness={0.6} roughness={0.3} />
        </RoundedBox>
      </mesh>
    </group>
  );
}

export function NovaCharacter({ mood, walking = false, width = 160, height = 200 }: CharacterProps) {
  return (
    <Canvas gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0.2, 3.2], fov: 42 }} style={{ width, height, background: 'transparent' }}>
      <CharacterLighting />
      <NovaInner mood={mood} walking={walking} />
    </Canvas>
  );
}

// ─── 6. Finn — small child-like colorful robot ───────────────────────────────

function FinnInner({ mood, walking = false }: CharacterProps) {
  const bodyRef        = useRef<THREE.Mesh>(null);
  const headRef        = useRef<THREE.Mesh>(null);
  const leftArmRef     = useRef<THREE.Mesh>(null);
  const rightArmRef    = useRef<THREE.Mesh>(null);
  const leftLegRef     = useRef<THREE.Mesh>(null);
  const rightLegRef    = useRef<THREE.Mesh>(null);
  const leftEyeMatRef  = useRef<THREE.MeshStandardMaterial>(null);
  const rightEyeMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const starMatRef     = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const eyeGlow = Math.sin(t * 2) * 0.5 + 1.5;
    if (leftEyeMatRef.current)  leftEyeMatRef.current.emissiveIntensity  = eyeGlow;
    if (rightEyeMatRef.current) rightEyeMatRef.current.emissiveIntensity = eyeGlow;
    if (starMatRef.current)     starMatRef.current.emissiveIntensity      = Math.sin(t * 3) * 1 + 2;

    if (walking) {
      const sw = Math.sin(t * 5);
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.25 - sw * 0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.25 + sw * 0.4;
      if (leftLegRef.current)  leftLegRef.current.rotation.x   =  sw * 0.2;
      if (rightLegRef.current) rightLegRef.current.rotation.x  = -sw * 0.2;
      if (bodyRef.current)     bodyRef.current.position.y       = Math.abs(Math.sin(t * 5)) * 0.04;
      return;
    }
    if (mood === 'idle') {
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 1.5) * 0.05;
      if (headRef.current)     headRef.current.rotation.z      = Math.sin(t * 0.8) * 0.06;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.25;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.25;
    }
    if (mood === 'happy') {
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 3) * 0.1;
      if (headRef.current)     headRef.current.rotation.z      = Math.sin(t * 1.5) * 0.12;
      const wave = Math.sin(t * 4.5) * 0.65;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.25 - wave;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.25 + wave;
    }
    if (mood === 'thinking') {
      if (headRef.current)     headRef.current.rotation.z      = Math.sin(t * 0.6) * 0.18;
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 0.9) * 0.02;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.1;
    }
    if (mood === 'talking') {
      if (headRef.current)     headRef.current.rotation.x      = Math.sin(t * 5) * 0.08;
      if (bodyRef.current)     bodyRef.current.position.y      = Math.sin(t * 3) * 0.04;
      if (leftArmRef.current)  leftArmRef.current.rotation.z   = -0.25 + Math.sin(t * 2.5) * 0.18;
      if (rightArmRef.current) rightArmRef.current.rotation.z  =  0.25 - Math.sin(t * 2.5) * 0.18;
    }
  });

  return (
    <group>
      {/* Antenna */}
      <mesh position={[0.22, 1.28, 0]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[0.025, 0.025, 0.22, 8]} />
        <meshStandardMaterial color="#F472B6" />
      </mesh>
      {/* Star tip */}
      <mesh position={[0.36, 1.38, 0]}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial ref={starMatRef} color="#FBBF24" emissive="#FBBF24" emissiveIntensity={2} />
      </mesh>
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.88, 0]}>
        <RoundedBox args={[0.85, 0.8, 0.75]} radius={0.2} smoothness={5}>
          <meshStandardMaterial color="#FDE047" metalness={0.1} roughness={0.5} />
        </RoundedBox>
      </mesh>
      {/* Left eye: sclera + iris + pupil + shine */}
      <mesh position={[-0.2, 0.9, 0.4]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0} roughness={0.3} />
      </mesh>
      <mesh position={[-0.2, 0.9, 0.55]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial ref={leftEyeMatRef} color="#22C55E" emissive="#22C55E" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[-0.2, 0.9, 0.635]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshStandardMaterial color="#0a1a00" />
      </mesh>
      <mesh position={[-0.14, 0.96, 0.65]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Right eye: sclera + iris + pupil + shine */}
      <mesh position={[0.2, 0.9, 0.4]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0} roughness={0.3} />
      </mesh>
      <mesh position={[0.2, 0.9, 0.55]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial ref={rightEyeMatRef} color="#22C55E" emissive="#22C55E" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0.2, 0.9, 0.635]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshStandardMaterial color="#0a1a00" />
      </mesh>
      <mesh position={[0.26, 0.96, 0.65]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Rosy cheeks */}
      <mesh position={[-0.32, 0.8, 0.38]}>
        <circleGeometry args={[0.1, 16]} />
        <meshStandardMaterial color="#FDA4AF" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0.32, 0.8, 0.38]}>
        <circleGeometry args={[0.1, 16]} />
        <meshStandardMaterial color="#FDA4AF" transparent opacity={0.7} />
      </mesh>
      {/* Freckles left */}
      <mesh position={[-0.28, 0.76, 0.39]}><sphereGeometry args={[0.022, 6, 6]} /><meshStandardMaterial color="#F97316" /></mesh>
      <mesh position={[-0.22, 0.73, 0.39]}><sphereGeometry args={[0.022, 6, 6]} /><meshStandardMaterial color="#F97316" /></mesh>
      <mesh position={[-0.35, 0.73, 0.39]}><sphereGeometry args={[0.022, 6, 6]} /><meshStandardMaterial color="#F97316" /></mesh>
      {/* Freckles right */}
      <mesh position={[0.28, 0.76, 0.39]}><sphereGeometry args={[0.022, 6, 6]} /><meshStandardMaterial color="#F97316" /></mesh>
      <mesh position={[0.22, 0.73, 0.39]}><sphereGeometry args={[0.022, 6, 6]} /><meshStandardMaterial color="#F97316" /></mesh>
      <mesh position={[0.35, 0.73, 0.39]}><sphereGeometry args={[0.022, 6, 6]} /><meshStandardMaterial color="#F97316" /></mesh>
      {/* Smile */}
      <mesh position={[0, 0.72, 0.4]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.1, 0.02, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#92400E" />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.1, 10]} />
        <meshStandardMaterial color="#EAB308" metalness={0.2} roughness={0.5} />
      </mesh>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0.04, 0]}>
        <RoundedBox args={[0.75, 0.6, 0.65]} radius={0.18} smoothness={5}>
          <meshStandardMaterial color="#22C55E" metalness={0.15} roughness={0.5} />
        </RoundedBox>
      </mesh>
      {/* Belly star */}
      <mesh position={[0, 0.1, 0.35]}>
        <octahedronGeometry args={[0.07, 0]} />
        <meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={1.5} />
      </mesh>
      {/* Left arm + hand */}
      <mesh ref={leftArmRef} position={[-0.5, 0.06, 0]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.1, 0.1, 0.44, 10]} />
        <meshStandardMaterial color="#16A34A" metalness={0.1} roughness={0.55} />
      </mesh>
      <mesh position={[-0.54, -0.18, 0]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial color="#FDE047" metalness={0.1} roughness={0.5} />
      </mesh>
      {/* Right arm + hand */}
      <mesh ref={rightArmRef} position={[0.5, 0.06, 0]} rotation={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.1, 0.1, 0.44, 10]} />
        <meshStandardMaterial color="#16A34A" metalness={0.1} roughness={0.55} />
      </mesh>
      <mesh position={[0.54, -0.18, 0]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial color="#FDE047" metalness={0.1} roughness={0.5} />
      </mesh>
      {/* Left leg + foot */}
      <mesh ref={leftLegRef} position={[-0.18, -0.52, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.3, 10]} />
        <meshStandardMaterial color="#16A34A" metalness={0.1} roughness={0.55} />
      </mesh>
      <mesh position={[-0.18, -0.74, 0.06]}>
        <sphereGeometry args={[0.2, 14, 14]} />
        <meshStandardMaterial color="#F9A8D4" metalness={0.1} roughness={0.5} />
      </mesh>
      {/* Right leg + foot */}
      <mesh ref={rightLegRef} position={[0.18, -0.52, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.3, 10]} />
        <meshStandardMaterial color="#16A34A" metalness={0.1} roughness={0.55} />
      </mesh>
      <mesh position={[0.18, -0.74, 0.06]}>
        <sphereGeometry args={[0.2, 14, 14]} />
        <meshStandardMaterial color="#F9A8D4" metalness={0.1} roughness={0.5} />
      </mesh>
    </group>
  );
}

export function FinnCharacter({ mood, walking = false, width = 160, height = 200 }: CharacterProps) {
  return (
    <Canvas gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0.2, 3.2], fov: 42 }} style={{ width, height, background: 'transparent' }}>
      <CharacterLighting />
      <FinnInner mood={mood} walking={walking} />
    </Canvas>
  );
}
