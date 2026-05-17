'use client';
import { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
  { id: '1', name: 'أحمد',  mastery: 92, xp: 1240, level: 8, status: 'active',     streak: 5, pos: [-5, 0, -1] },
  { id: '2', name: 'سارة',  mastery: 78, xp: 890,  level: 6, status: 'thinking',   streak: 3, pos: [0,  0, -1] },
  { id: '3', name: 'محمد',  mastery: 61, xp: 650,  level: 5, status: 'struggling', streak: 1, pos: [5,  0, -1] },
  { id: '4', name: 'ليلى',  mastery: 85, xp: 1050, level: 7, status: 'active',     streak: 7, pos: [-5, 0,  3] },
  { id: '5', name: 'يوسف',  mastery: 45, xp: 420,  level: 4, status: 'offline',    streak: 0, pos: [0,  0,  3] },
  { id: '6', name: 'نور',   mastery: 73, xp: 780,  level: 6, status: 'thinking',   streak: 4, pos: [5,  0,  3] },
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

// ─── CameraSetup ──────────────────────────────────────────────────────────────

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 1, -1);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
}

// ─── StudentAvatar ────────────────────────────────────────────────────────────

function StudentAvatar({ student, isDirected }: { student: Student; isDirected: boolean }) {
  const headRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.PointLight>(null!);
  const tabletRef = useRef<THREE.Mesh>(null!);

  const bodyColor =
    student.status === 'active'     ? '#6366F1' :
    student.status === 'thinking'   ? '#D97706' :
    student.status === 'struggling' ? '#DC2626' :
    '#4B5563';

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (headRef.current && student.status !== 'offline') {
      headRef.current.position.y = 1.35 + Math.sin(t * 1.2 + parseFloat(student.id)) * 0.025;
    }
    if (glowRef.current) {
      glowRef.current.intensity = isDirected ? 3 + Math.sin(t * 5) * 1 : 0;
    }
    if (tabletRef.current) {
      const mat = tabletRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.4 + Math.sin(t * 0.8 + parseFloat(student.id)) * 0.1;
    }
  });

  return (
    <group position={student.pos}>
      {/* Desk surface */}
      <mesh position={[0, -0.15, 0.2]}>
        <boxGeometry args={[1.8, 0.06, 1.0]} />
        <meshStandardMaterial color="#1E1A3A" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Desk legs */}
      {([ [-0.8, -0.1], [-0.8, 1.1], [0.8, -0.1], [0.8, 1.1] ] as [number, number][]).map(([dx, dz], i) => (
        <mesh key={i} position={[dx, -0.65, dz]}>
          <cylinderGeometry args={[0.04, 0.04, 1, 6]} />
          <meshStandardMaterial color="#2A2040" roughness={0.8} />
        </mesh>
      ))}
      {/* Glowing tablet on desk */}
      <mesh ref={tabletRef} position={[0.3, -0.1, 0.5]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.7, 0.45, 0.02]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={bodyColor}
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>
      {/* Chair seat */}
      <mesh position={[0, -0.6, 1.1]}>
        <boxGeometry args={[1.1, 0.06, 0.9]} />
        <meshStandardMaterial color="#1A1630" roughness={0.8} />
      </mesh>
      {/* Chair back */}
      <mesh position={[0, -0.15, 1.55]}>
        <boxGeometry args={[1.1, 0.9, 0.06]} />
        <meshStandardMaterial color="#1A1630" roughness={0.8} />
      </mesh>

      {/* Student body */}
      <mesh position={[0, 0.55, 1.0]}>
        <boxGeometry args={[0.65, 0.9, 0.35]} />
        <meshStandardMaterial color={bodyColor} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.1, 0.98]}>
        <cylinderGeometry args={[0.1, 0.12, 0.2, 8]} />
        <meshStandardMaterial color="#E8C09A" roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.35, 0.97]}>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshStandardMaterial color="#F0C090" roughness={0.6} />
      </mesh>
      {/* Eyes */}
      {([-0.09, 0.09] as number[]).map((ex, i) => (
        <mesh key={i} position={[ex, 1.37, 1.22]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#1A1040" />
        </mesh>
      ))}

      {/* Directed highlight ring */}
      {isDirected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.13, 0.2]}>
          <ringGeometry args={[0.85, 0.95, 40]} />
          <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={1.5} transparent opacity={0.9} />
        </mesh>
      )}
      <pointLight ref={glowRef} color="#F59E0B" intensity={0} distance={4} position={[0, 2, 1]} />

      {/* Name label */}
      <Suspense fallback={null}>
        <Text
          position={[0, 2.0, 0.97]}
          fontSize={0.22}
          color="white"
          anchorX="center"
          outlineWidth={0.025}
          outlineColor="#000000"
        >
          {student.name}
        </Text>
        <Text
          position={[0, 1.73, 0.97]}
          fontSize={0.14}
          color={bodyColor}
          anchorX="center"
        >
          {`${student.mastery}% • Lv.${student.level}`}
        </Text>
      </Suspense>
    </group>
  );
}

// ─── SpeechBubble3D ───────────────────────────────────────────────────────────

function SpeechBubble3D({ text, teacherRef }: { text: string; teacherRef: React.RefObject<THREE.Group | null> }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(({ camera, clock }) => {
    if (!groupRef.current) return;
    const src = teacherRef.current?.position ?? new THREE.Vector3(0, -1.35, -4.5);
    groupRef.current.position.set(src.x, src.y + 4.2, src.z + 0.5);
    groupRef.current.position.y += Math.sin(clock.elapsedTime * 1.5) * 0.06;
    groupRef.current.lookAt(camera.position);
  });

  return (
    <group ref={groupRef}>
      {/* Border */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[3.2, 1.5]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.95} />
      </mesh>
      {/* White background */}
      <mesh>
        <planeGeometry args={[3.0, 1.35]} />
        <meshBasicMaterial color="white" transparent opacity={0.96} />
      </mesh>
      {/* Text */}
      <Text
        position={[0, 0.02, 0.01]}
        fontSize={0.22}
        color="#1E1040"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.7}
        textAlign="center"
      >
        {text}
      </Text>
      {/* Tail pointing down */}
      <mesh position={[0, -0.82, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.15, 0.35, 4]} />
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
  const targetPos = useRef(new THREE.Vector3(0, 0, -4.5));
  const targetRotY = useRef(0);

  const phase = phases[phaseIdx];

  useEffect(() => {
    const directed = phase.directed ? students.find(s => s.id === phase.directed) : null;
    if (directed) {
      targetPos.current.set(directed.pos[0] * 0.4, 0, directed.pos[2] * 0.3 - 2.5);
      const dx = directed.pos[0] - targetPos.current.x;
      const dz = directed.pos[2] - targetPos.current.z;
      targetRotY.current = Math.atan2(dx, dz);
    } else {
      targetPos.current.set(0, 0, -4.5);
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
      new THREE.Vector3(targetPos.current.x, -1.35, targetPos.current.z),
      0.04,
    );
    let dy = targetRotY.current - groupRef.current.rotation.y;
    while (dy >  Math.PI) dy -= 2 * Math.PI;
    while (dy < -Math.PI) dy += 2 * Math.PI;
    groupRef.current.rotation.y += dy * 0.06;
  });

  return (
    <>
      <primitive ref={groupRef} object={cloned} scale={1.5} position={[0, -1.35, -4.5]} dispose={null} />
      <Suspense fallback={null}>
        <SpeechBubble3D
          text={phase.bubble}
          teacherRef={groupRef}
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
      <color attach="background" args={['#0A0918']} />
      <fog attach="fog" args={['#0A0918', 25, 50]} />

      {/* Lighting */}
      <ambientLight intensity={0.35} color="#8B9FCC" />
      <directionalLight position={[0, 10, 3]} intensity={0.8} color="#FFF5E0" castShadow />

      {/* Ceiling strip lights */}
      {([-5, 0, 5] as number[]).map((x, i) => (
        <group key={i} position={[x, 4.8, -0.5]}>
          <mesh>
            <boxGeometry args={[1.2, 0.06, 6]} />
            <meshStandardMaterial color="#FFFAF0" emissive="#FFFAF0" emissiveIntensity={0.9} />
          </mesh>
          <pointLight intensity={1.5} color="#FFF5E0" distance={8} position={[0, -0.5, 0]} />
        </group>
      ))}

      {/* Desk accent lights */}
      {students.map(s => (
        <pointLight key={s.id} position={[s.pos[0], 1.5, s.pos[2]]} intensity={0.3} color="#4A90D9" distance={3} />
      ))}

      {/* Dramatic purple accent */}
      <pointLight position={[0, 5, -6]} intensity={2} color="#7C3AED" distance={12} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}>
        <planeGeometry args={[22, 18]} />
        <meshStandardMaterial color="#12102A" roughness={0.8} metalness={0.1} />
      </mesh>
      <gridHelper args={[22, 22, '#252040', '#1A1830']} position={[0, -1.34, 0]} />

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[22, 18]} />
        <meshStandardMaterial color="#0D0B1E" roughness={1} />
      </mesh>

      {/* Front wall (behind blackboard) */}
      <mesh position={[0, 1.8, -8]}>
        <planeGeometry args={[22, 8]} />
        <meshStandardMaterial color="#14122A" roughness={0.9} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.8, 7]}>
        <planeGeometry args={[22, 8]} />
        <meshStandardMaterial color="#14122A" roughness={0.9} side={2} />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-11, 1.8, -0.5]}>
        <planeGeometry args={[18, 8]} />
        <meshStandardMaterial color="#12102A" roughness={0.9} />
      </mesh>

      {/* Windows on left wall */}
      {([-4, 2] as number[]).map((z, i) => (
        <group key={i} position={[-10.9, 2.5, z]}>
          {/* Window frame background */}
          <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 0, 0.01]}>
            <planeGeometry args={[3.1, 2.6]} />
            <meshStandardMaterial color="#2A2448" />
          </mesh>
          {/* Window glass */}
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[3, 2.5]} />
            <meshStandardMaterial color="#1A3A6A" emissive="#0A2040" emissiveIntensity={0.5} transparent opacity={0.85} />
          </mesh>
          <pointLight position={[0.5, 0, 0]} intensity={0.4} color="#4A7FC1" distance={5} />
        </group>
      ))}

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[11, 1.8, -0.5]}>
        <planeGeometry args={[18, 8]} />
        <meshStandardMaterial color="#12102A" roughness={0.9} />
      </mesh>

      {/* Blackboard */}
      <group position={[0, 2.2, -7.8]}>
        {/* Board border */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[10.3, 3.8]} />
          <meshStandardMaterial color="#2A1A10" roughness={1} />
        </mesh>
        {/* Board surface */}
        <mesh>
          <planeGeometry args={[10, 3.5]} />
          <meshStandardMaterial color="#1A3D28" roughness={0.95} />
        </mesh>
        {/* Overhead board light */}
        <pointLight position={[0, 3, 1]} intensity={2.5} color="#FFFAF0" distance={8} />
        {/* Chalk text */}
        <Suspense fallback={null}>
          <Text position={[0, 0.8, 0.02]} fontSize={0.38} color="#C8F5D0" anchorX="center" maxWidth={9}>
            {'درس الحلقات (Loops)'}
          </Text>
          <Text position={[0, 0.1, 0.02]} fontSize={0.24} color="#9BE3B0" anchorX="center" maxWidth={9}>
            {'for i in range(n):    print(i)'}
          </Text>
          <Text position={[0, -0.55, 0.02]} fontSize={0.22} color="#9BE3B0" anchorX="center" maxWidth={9}>
            {'while condition:    # keep looping'}
          </Text>
        </Suspense>
        {/* Chalk tray */}
        <mesh position={[0, -1.9, 0.08]}>
          <boxGeometry args={[10, 0.1, 0.2]} />
          <meshStandardMaterial color="#2A1A10" roughness={1} />
        </mesh>
      </group>

      {/* Teacher's desk (moved slightly forward from z=-4.5 teacher position) */}
      <group position={[0, -1.35, -3.2]}>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[2, 0.06, 0.9]} />
          <meshStandardMaterial color="#1E1A3A" roughness={0.7} metalness={0.2} />
        </mesh>
        {([ [-0.9, -0.4], [0.9, -0.4], [-0.9, 0.4], [0.9, 0.4] ] as [number, number][]).map(([dx, dz], i) => (
          <mesh key={i} position={[dx, 0.15, dz]}>
            <cylinderGeometry args={[0.04, 0.04, 0.68, 6]} />
            <meshStandardMaterial color="#2A2040" roughness={1} />
          </mesh>
        ))}
        {/* Laptop screen */}
        <mesh position={[0.3, 0.42, -0.1]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.5, 0.35, 0.02]} />
          <meshStandardMaterial color="#6366F1" emissive="#6366F1" emissiveIntensity={0.5} roughness={0.3} metalness={0.5} />
        </mesh>
      </group>

      {/* Student avatars */}
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
      <Stars radius={40} depth={20} count={200} factor={2} fade speed={0.2} />
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
    explaining:      'Xbot يشرح للجميع',
    questioning:     'Xbot يسأل طالباً',
    praising:        'Xbot يشجع',
    'peer-teaching': 'تعليم الأقران',
  };

  const actionIcon: Record<string, React.ReactNode> = {
    explaining:      <BookOpen size={14} />,
    questioning:     <MessageSquare size={14} />,
    praising:        <Award size={14} />,
    'peer-teaching': <Users size={14} />,
  };

  return (
    <div style={{ position: 'fixed', inset: 0 }} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 8, 10], fov: 55 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <CameraSetup />
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
