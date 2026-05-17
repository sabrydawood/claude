'use client';
import { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Text, useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Users, Target, Zap, BookOpen, Award, MessageSquare } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type StudentStatus = 'active' | 'thinking' | 'struggling' | 'offline';

interface Student {
  id: string;
  name: string;
  mastery: number;
  xp: number;
  level: number;
  status: StudentStatus;
  streak: number;
  pos: [number, number, number];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STUDENTS: Student[] = [
  { id: '1', name: 'أحمد',  mastery: 92, xp: 1240, level: 8, status: 'active',     streak: 5, pos: [-3.5, 0, -1] },
  { id: '2', name: 'سارة',  mastery: 78, xp: 890,  level: 6, status: 'thinking',   streak: 3, pos: [0,    0, -1] },
  { id: '3', name: 'محمد',  mastery: 61, xp: 650,  level: 5, status: 'struggling', streak: 1, pos: [3.5,  0, -1] },
  { id: '4', name: 'ليلى',  mastery: 85, xp: 1050, level: 7, status: 'active',     streak: 7, pos: [-3.5, 0,  2] },
  { id: '5', name: 'يوسف',  mastery: 45, xp: 420,  level: 4, status: 'offline',    streak: 0, pos: [0,    0,  2] },
  { id: '6', name: 'نور',   mastery: 73, xp: 780,  level: 6, status: 'thinking',   streak: 4, pos: [3.5,  0,  2] },
];

const PHASES = [
  { id: 0, bubble: 'اليوم نتعلم الحلقات!\nالحلقة تكرر كوداً عدة مرات.',  directed: null, action: 'explaining'    },
  { id: 1, bubble: 'أحمد — ما الفرق بين\nfor و while؟',                   directed: '1',  action: 'questioning'   },
  { id: 2, bubble: 'إجابة ممتازة يا أحمد!\n+5 نقاط لك.',                  directed: '1',  action: 'praising'      },
  { id: 3, bubble: 'الآن — متى نستخدم break؟\nمن يعرف؟',                  directed: null, action: 'explaining'    },
  { id: 4, bubble: 'سارة — ساعدي محمد\nفي فهم break',                     directed: '2',  action: 'peer-teaching' },
  { id: 5, bubble: 'رائع! كلاهما يفهم الآن.\n+10 XP لسارة.',              directed: '2',  action: 'praising'      },
] as const;

type Phase = typeof PHASES[number];

// ─── StudentAvatar ────────────────────────────────────────────────────────────

function StudentAvatar({ student, isDirected }: { student: Student; isDirected: boolean }) {
  const headRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.PointLight>(null!);

  const bodyColor =
    student.status === 'active'     ? '#818CF8' :
    student.status === 'thinking'   ? '#F59E0B' :
    student.status === 'struggling' ? '#EF4444' :
    '#374151';

  useFrame(({ clock }) => {
    if (headRef.current && student.status !== 'offline') {
      headRef.current.position.y = 1.15 + Math.sin(clock.elapsedTime * 1.2 + parseFloat(student.id)) * 0.02;
    }
    if (glowRef.current) {
      glowRef.current.intensity = isDirected
        ? 2 + Math.sin(clock.elapsedTime * 4) * 0.8
        : 0;
    }
  });

  return (
    <group position={student.pos}>
      {/* Desk surface */}
      <mesh position={[0, -0.2, 0.3]}>
        <boxGeometry args={[1.2, 0.05, 0.7]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>
      {/* Desk legs */}
      {([ [-0.55, -0.1], [-0.55, 0.65], [0.55, -0.1], [0.55, 0.65] ] as [number, number][]).map(([dx, dz], i) => (
        <mesh key={i} position={[dx, -0.55, dz]}>
          <cylinderGeometry args={[0.03, 0.03, 0.7, 6]} />
          <meshStandardMaterial color="#5D3A1A" roughness={1} />
        </mesh>
      ))}
      {/* Chair seat */}
      <mesh position={[0, -0.55, 0.9]}>
        <boxGeometry args={[0.8, 0.05, 0.7]} />
        <meshStandardMaterial color="#374151" roughness={0.8} />
      </mesh>
      {/* Chair back */}
      <mesh position={[0, -0.15, 1.25]}>
        <boxGeometry args={[0.8, 0.8, 0.05]} />
        <meshStandardMaterial color="#374151" roughness={0.8} />
      </mesh>

      {/* Student body */}
      <mesh position={[0, 0.4, 0.7]}>
        <boxGeometry args={[0.5, 0.7, 0.3]} />
        <meshStandardMaterial color={bodyColor} roughness={0.5} />
      </mesh>
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.15, 0.7]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#F5C5A3" roughness={0.6} />
      </mesh>
      {/* Eyes */}
      {([-0.08, 0.08] as number[]).map((ex, i) => (
        <mesh key={i} position={[ex, 1.17, 0.91]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#1E1B4B" />
        </mesh>
      ))}

      {/* Glow when directed */}
      <pointLight ref={glowRef} color="#F59E0B" intensity={0} distance={3} position={[0, 1.5, 0.7]} />

      {/* Highlight ring on desk */}
      {isDirected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.17, 0.3]}>
          <ringGeometry args={[0.55, 0.65, 32]} />
          <meshBasicMaterial color="#F59E0B" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Name label */}
      <Text
        position={[0, 1.65, 0.7]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {student.name}
      </Text>

      {/* Status dot */}
      <mesh position={[0.3, 1.15, 0.92]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={student.status !== 'offline' ? bodyColor : '#374151'}
          emissiveIntensity={student.status !== 'offline' ? 1 : 0}
        />
      </mesh>
    </group>
  );
}

// ─── SpeechBubble3D ───────────────────────────────────────────────────────────

function SpeechBubble3D({ text, xbotPos }: { text: string; xbotPos: THREE.Vector3 }) {
  const ref = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.set(xbotPos.x, xbotPos.y + 3.2, xbotPos.z);
      ref.current.position.y += Math.sin(clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <group ref={ref}>
      {/* Border (rendered behind) */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.3, 1.2]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.9} />
      </mesh>
      {/* Bubble background */}
      <mesh>
        <planeGeometry args={[2.2, 1.1]} />
        <meshBasicMaterial color="white" transparent opacity={0.92} />
      </mesh>
      {/* Text */}
      <Text
        position={[0, 0.02, 0.01]}
        fontSize={0.19}
        color="#1E293B"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.0}
        textAlign="center"
      >
        {text}
      </Text>
      {/* Tail */}
      <mesh position={[0, -0.65, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.12, 0.3, 4]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
}

// ─── ClassroomTeacher (Xbot) ──────────────────────────────────────────────────

function ClassroomTeacher({
  phaseIdx,
  phases,
  students,
}: {
  phaseIdx: number;
  phases: typeof PHASES;
  students: Student[];
}) {
  const { scene, animations } = useGLTF('/models/Xbot.glb');
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Group;
    c.traverse(child => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mats = Array.isArray((child as THREE.Mesh).material)
        ? ((child as THREE.Mesh).material as THREE.Material[])
        : [(child as THREE.Mesh).material as THREE.Material];
      mats.forEach(m => {
        const sm = m as THREE.MeshStandardMaterial;
        if (sm.color) sm.color.set('#7C3AED');
        sm.metalness = 0.4;
        sm.roughness = 0.4;
        sm.needsUpdate = true;
      });
    });
    return c;
  }, [scene]);

  const groupRef = useRef<THREE.Group>(cloned);
  const { actions } = useAnimations(animations, groupRef);
  const prevAnim = useRef('');
  const targetPos = useRef(new THREE.Vector3(0, 0, -3.5));
  const targetRotY = useRef(0);

  const phase = phases[phaseIdx];

  useEffect(() => {
    const directed = phase.directed ? students.find(s => s.id === phase.directed) : null;
    if (directed) {
      targetPos.current.set(directed.pos[0] * 0.4, 0, directed.pos[2] * 0.3 - 2);
      const dx = directed.pos[0] - targetPos.current.x;
      const dz = directed.pos[2] - targetPos.current.z;
      targetRotY.current = Math.atan2(dx, dz);
    } else {
      targetPos.current.set(0, 0, -3.5);
      targetRotY.current = Math.PI;
    }

    const anim =
      phase.action === 'praising'    ? 'agree' :
      phase.action === 'questioning' ? 'headshake' :
      'idle';

    if (anim !== prevAnim.current) {
      prevAnim.current = anim;
      Object.values(actions).forEach(a => a?.fadeOut(0.3));
      const tgt = actions[anim] ?? actions['idle'];
      if (tgt) tgt.reset().setEffectiveTimeScale(1).fadeIn(0.3).play();
    }
  }, [phaseIdx, phase, students, actions]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    void delta;
    groupRef.current.position.lerp(
      new THREE.Vector3(targetPos.current.x, -1.3, targetPos.current.z),
      0.04,
    );
    let dy = targetRotY.current - groupRef.current.rotation.y;
    while (dy >  Math.PI) dy -= 2 * Math.PI;
    while (dy < -Math.PI) dy += 2 * Math.PI;
    groupRef.current.rotation.y += dy * 0.06;
  });

  return (
    <>
      <primitive ref={groupRef} object={cloned} scale={1.3} position={[0, -1.3, -3.5]} dispose={null} />
      <Suspense fallback={null}>
        <SpeechBubble3D
          text={phase.bubble}
          xbotPos={groupRef.current?.position ?? new THREE.Vector3(0, -1.3, -3.5)}
        />
      </Suspense>
    </>
  );
}

// ─── ClassroomScene ───────────────────────────────────────────────────────────

function ClassroomScene({
  phaseIdx,
  phases,
  students,
  directedId,
}: {
  phaseIdx: number;
  phases: typeof PHASES;
  students: Student[];
  directedId: string | null;
}) {
  return (
    <>
      <color attach="background" args={['#0F0C22']} />
      <fog attach="fog" args={['#0F0C22', 20, 40]} />
      <ambientLight intensity={0.6} color="#C4B5FD" />
      <directionalLight position={[0, 8, 4]} intensity={1.2} color="#FFF9E6" />
      <pointLight position={[0, 4, 0]} intensity={0.5} color="#7C3AED" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#1C1A2E" roughness={0.9} />
      </mesh>
      {/* Floor grid */}
      <gridHelper args={[14, 14, '#2D1B69', '#1A0F3C']} position={[0, -1.34, 0]} />

      {/* Back wall — DoubleSide so it's visible from inside and outside */}
      <mesh position={[0, 1, 5.8]}>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color="#16142A" roughness={1} side={2} />
      </mesh>
      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-6.8, 1, 0]}>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#14122A" roughness={1} />
      </mesh>
      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[6.8, 1, 0]}>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#14122A" roughness={1} />
      </mesh>
      {/* Front wall */}
      <mesh position={[0, 1, -5.8]}>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color="#16142A" roughness={1} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.5, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#0F0D20" roughness={1} />
      </mesh>

      {/* Ceiling lights */}
      {([ [-3.5, 0], [-3.5, 2], [3.5, 0], [3.5, 2] ] as [number, number][]).map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x, 3.4, z]}>
            <boxGeometry args={[0.6, 0.08, 0.6]} />
            <meshStandardMaterial color="#FFF9E6" emissive="#FFF9E6" emissiveIntensity={1} />
          </mesh>
          <pointLight position={[x, 3.2, z]} intensity={1.2} color="#FFF9E6" distance={6} />
        </group>
      ))}

      {/* Blackboard */}
      <group position={[0, 1.2, -5.5]}>
        {/* Frame */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[6.2, 2.7]} />
          <meshStandardMaterial color="#2D1B0E" roughness={1} />
        </mesh>
        {/* Board surface */}
        <mesh>
          <planeGeometry args={[6, 2.5]} />
          <meshStandardMaterial color="#0F3D2E" roughness={0.95} />
        </mesh>
        <Suspense fallback={null}>
          <Text position={[0, 0.4, 0.02]} fontSize={0.28} color="#E2F5DC" anchorX="center" maxWidth={5.5}>
            {'درس الحلقات (Loops)'}
          </Text>
          <Text position={[0, -0.1, 0.02]} fontSize={0.18} color="#A7D9B0" anchorX="center" maxWidth={5.5}>
            {'for i in range(n): ...'}
          </Text>
          <Text position={[0, -0.5, 0.02]} fontSize={0.16} color="#A7D9B0" anchorX="center" maxWidth={5.5}>
            {'while condition: ...'}
          </Text>
        </Suspense>
        {/* Chalk tray */}
        <mesh position={[0, -1.37, 0.06]}>
          <boxGeometry args={[6, 0.08, 0.15]} />
          <meshStandardMaterial color="#2D1B0E" roughness={1} />
        </mesh>
      </group>

      {/* Teacher's desk */}
      <group position={[0, -1.35, -4.5]}>
        {/* Tabletop */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[2, 0.06, 0.9]} />
          <meshStandardMaterial color="#7C5D3A" roughness={0.8} />
        </mesh>
        {/* Legs */}
        {([ [-0.9, -0.4], [0.9, -0.4], [-0.9, 0.4], [0.9, 0.4] ] as [number, number][]).map(([dx, dz], i) => (
          <mesh key={i} position={[dx, 0.15, dz]}>
            <cylinderGeometry args={[0.04, 0.04, 0.68, 6]} />
            <meshStandardMaterial color="#5D3A1A" roughness={1} />
          </mesh>
        ))}
        {/* Laptop screen */}
        <mesh position={[0.3, 0.42, -0.1]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.5, 0.35, 0.02]} />
          <meshStandardMaterial color="#1F2937" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Laptop base */}
        <mesh position={[0.3, 0.39, 0.07]}>
          <boxGeometry args={[0.5, 0.02, 0.35]} />
          <meshStandardMaterial color="#374151" roughness={0.5} />
        </mesh>
      </group>

      {/* Student avatars — each in its own Suspense so Text font-load doesn't block the room */}
      {students.map(s => (
        <Suspense key={s.id} fallback={null}>
          <StudentAvatar student={s} isDirected={s.id === directedId} />
        </Suspense>
      ))}

      {/* Xbot teacher */}
      <Suspense fallback={null}>
        <ClassroomTeacher phaseIdx={phaseIdx} phases={phases} students={students} />
      </Suspense>

      {/* Background stars */}
      <Stars radius={30} depth={15} count={200} factor={2} fade speed={0.2} />
    </>
  );
}

// ─── Main ClassroomClient ─────────────────────────────────────────────────────

export default function ClassroomClient({ locale }: { locale: string }) {
  const isRtl = locale === 'ar';
  const [phaseIdx, setPhaseIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhaseIdx(p => (p + 1) % PHASES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const phase: Phase = PHASES[phaseIdx];
  const directedId = phase.directed;

  const actionLabel: Record<string, string> = {
    explaining:     'Xbot يشرح للجميع',
    questioning:    'Xbot يسأل طالباً',
    praising:       'Xbot يشجع',
    'peer-teaching': 'تعليم الأقران',
  };

  const actionIcon: Record<string, React.ReactNode> = {
    explaining:     <BookOpen size={14} />,
    questioning:    <MessageSquare size={14} />,
    praising:       <Award size={14} />,
    'peer-teaching': <Users size={14} />,
  };

  return (
    <div style={{ position: 'fixed', inset: 0 }} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 3.5, 5.5], fov: 58 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <ClassroomScene
            phaseIdx={phaseIdx}
            phases={PHASES}
            students={STUDENTS}
            directedId={directedId}
          />
        </Suspense>
      </Canvas>

      {/* Top stats bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
          padding: '12px 24px',
        }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-white/70 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <Users size={14} className="text-purple-400" />
            <span>6 طلاب متصلون</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <Target size={14} className="text-amber-400" />
            <span>78% متوسط الإتقان</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <Zap size={14} className="text-blue-400" />
            <span>الحلقات — الدرس الحالي</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 mr-auto">
            <BookOpen size={14} className="text-green-400" />
            <span>الجلسة 3/5</span>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
          padding: '16px 24px',
        }}
      >
        <div className="flex items-center justify-between">
          {/* Action type */}
          <div className="flex items-center gap-2 text-sm font-semibold text-white bg-purple-600/30 px-4 py-2 rounded-xl border border-purple-500/30">
            {actionIcon[phase.action]}
            <span>{actionLabel[phase.action]}</span>
          </div>

          {/* Phase dots */}
          <div className="flex items-center gap-2">
            {PHASES.map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: i === phaseIdx ? 1 : 0.7 }}
                className={`rounded-full transition-colors ${
                  i === phaseIdx ? 'w-6 h-2.5 bg-amber-400' : 'w-2.5 h-2.5 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Progress label */}
          <div className="text-xs text-white/40">
            {phaseIdx + 1}/{PHASES.length} مراحل الدرس
          </div>
        </div>
      </div>
    </div>
  );
}
