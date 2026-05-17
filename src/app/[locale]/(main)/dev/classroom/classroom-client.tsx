'use client';
import { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Text, OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, Zap, BookOpen, Award, MessageSquare, Brain, TrendingUp } from 'lucide-react';

// Preload at module level so GLTF is ready before first render
useGLTF.preload('/models/Xbot.glb');

// ─── Types ─────────────────────────────────────────────────────────────────────

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

// ─── Data ──────────────────────────────────────────────────────────────────────

const STUDENTS: Student[] = [
  { id: '1', name: 'أحمد',  mastery: 92, xp: 1240, level: 8, status: 'active',     streak: 5, pos: [-4.5, 0,  0.0] },
  { id: '2', name: 'سارة',  mastery: 78, xp: 890,  level: 6, status: 'thinking',   streak: 3, pos: [0,    0,  0.0] },
  { id: '3', name: 'محمد',  mastery: 61, xp: 650,  level: 5, status: 'struggling', streak: 1, pos: [4.5,  0,  0.0] },
  { id: '4', name: 'ليلى',  mastery: 85, xp: 1050, level: 7, status: 'active',     streak: 7, pos: [-4.5, 0,  3.2] },
  { id: '5', name: 'يوسف',  mastery: 45, xp: 420,  level: 4, status: 'offline',    streak: 0, pos: [0,    0,  3.2] },
  { id: '6', name: 'نور',   mastery: 73, xp: 780,  level: 6, status: 'thinking',   streak: 4, pos: [4.5,  0,  3.2] },
];

const STUDENT_STYLES = [
  { hair: '#1C1C1C', shirt: '#6366F1', skin: '#F2C18A' },
  { hair: '#8B4513', shirt: '#EC4899', skin: '#F5C5A3' },
  { hair: '#2C2C2C', shirt: '#0EA5E9', skin: '#E8B48A' },
  { hair: '#8B0000', shirt: '#10B981', skin: '#F0C090' },
  { hair: '#4A3728', shirt: '#F59E0B', skin: '#E0A070' },
  { hair: '#1A1A2E', shirt: '#A855F7', skin: '#F5D0A9' },
];

const STUDENT_RESPONSES = [
  'for يتكرر عدداً محدداً من المرات!',
  'while يتكرر حتى الشرط يصبح false!',
  'break تخرج من الحلقة فوراً!',
  'أفهم الآن! شكراً يا معلم!',
  'هل يمكنك الشرح مرة أخرى؟',
  'أعتقد while أكثر مرونة!',
];

const PHASES = [
  { id: 0, bubble: 'اليوم نتعلم الحلقات!\nالحلقة تكرر كوداً عدة مرات.',   directed: null, action: 'explaining'    },
  { id: 1, bubble: 'أحمد — ما الفرق بين\nfor و while؟',                    directed: '1',  action: 'questioning'   },
  { id: 2, bubble: 'إجابة ممتازة يا أحمد!\n+5 نقاط لك.',                   directed: '1',  action: 'praising'      },
  { id: 3, bubble: 'الآن — متى نستخدم break؟\nمن يعرف؟',                   directed: null, action: 'explaining'    },
  { id: 4, bubble: 'سارة — ساعدي محمد\nفي فهم break',                      directed: '2',  action: 'peer-teaching' },
  { id: 5, bubble: 'رائع! كلاهما يفهم الآن.\n+10 XP لسارة.',               directed: '2',  action: 'praising'      },
] as const;

type Phase = typeof PHASES[number];

// ─── StudentAvatar — Xbot with unique color + sitting pose ──────────────────────

function StudentAvatar({ student, isDirected, idx }: {
  student: Student;
  isDirected: boolean;
  idx: number;
}) {
  const { scene, animations } = useGLTF('/models/Xbot.glb');
  const style = STUDENT_STYLES[idx % STUDENT_STYLES.length];

  // Clone scene AND clone each material independently so colors don't bleed
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Group;
    c.traverse(child => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const applyColor = (m: THREE.Material): THREE.Material => {
        const nm = (m as THREE.MeshStandardMaterial).clone();
        (nm as THREE.MeshStandardMaterial).color.set(style.shirt);
        (nm as THREE.MeshStandardMaterial).emissive.set(style.shirt);
        (nm as THREE.MeshStandardMaterial).emissiveIntensity = 0.14;
        (nm as THREE.MeshStandardMaterial).metalness  = 0.4;
        (nm as THREE.MeshStandardMaterial).roughness  = 0.42;
        return nm;
      };
      mesh.material = Array.isArray(mesh.material)
        ? (mesh.material as THREE.Material[]).map(applyColor)
        : applyColor(mesh.material as THREE.Material);
    });
    return c;
  }, [scene, style.shirt]);

  const groupRef = useRef<THREE.Group>(cloned);
  const glowRef  = useRef<THREE.PointLight>(null!);
  const { actions } = useAnimations(animations, groupRef);
  const prevAnim = useRef('idle');
  const [showResp, setShowResp] = useState(false);

  // Cache leg bone refs once after clone is ready
  const bones = useRef<{
    lUp: THREE.Object3D | null; rUp: THREE.Object3D | null;
    lLo: THREE.Object3D | null; rLo: THREE.Object3D | null;
  }>({ lUp: null, rUp: null, lLo: null, rLo: null });

  useEffect(() => {
    const b = bones.current;
    cloned.traverse(o => {
      const n = o.name;
      if (n.includes('LeftUpLeg'))                              b.lUp = o;
      if (n.includes('RightUpLeg'))                             b.rUp = o;
      if (n.includes('LeftLeg')  && !n.includes('Up') && !n.includes('Foot') && !n.includes('Toe')) b.lLo = o;
      if (n.includes('RightLeg') && !n.includes('Up') && !n.includes('Foot') && !n.includes('Toe')) b.rLo = o;
    });
  }, [cloned]);

  useEffect(() => {
    const delay = isDirected ? 1200 : 0;
    const t = setTimeout(() => setShowResp(isDirected), delay);
    return () => clearTimeout(t);
  }, [isDirected]);

  useEffect(() => {
    const target = isDirected ? 'agree' : 'idle';
    if (target === prevAnim.current) return;
    prevAnim.current = target;
    Object.values(actions).forEach(a => a?.fadeOut(0.3));
    const anim = actions[target] ?? actions['idle'];
    if (anim) {
      anim.reset()
        .setEffectiveTimeScale(isDirected ? 2.5 : 0.4 + idx * 0.04)
        .fadeIn(0.3)
        .play();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirected, idx]);

  // Sitting pose: override leg bones — useAnimations subscribes its useFrame first,
  // so at priority 0 this runs after the mixer update (same priority = subscription order)
  useFrame(({ clock }) => {
    const b = bones.current;
    const SIT = Math.PI / 2.1; // ~86°
    if (b.lUp) b.lUp.rotation.x = -SIT;
    if (b.rUp) b.rUp.rotation.x = -SIT;
    if (b.lLo) b.lLo.rotation.x =  SIT * 0.9;
    if (b.rLo) b.rLo.rotation.x =  SIT * 0.9;

    if (glowRef.current) {
      glowRef.current.intensity = isDirected
        ? 2.0 + Math.sin(clock.elapsedTime * 5) * 0.5 : 0;
    }
  });

  const statusColor =
    student.status === 'active'     ? '#10B981' :
    student.status === 'thinking'   ? '#F59E0B' :
    student.status === 'struggling' ? '#EF4444' : '#6B7280';

  return (
    <group position={student.pos}>
      {/* ── Desk surface ── */}
      <mesh position={[0, 0.06, 0.2]}>
        <boxGeometry args={[1.8, 0.06, 1.0]} />
        <meshStandardMaterial color="#1E1838" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Desk glow edge */}
      <mesh position={[0, 0.09, 0.2]}>
        <boxGeometry args={[1.82, 0.02, 1.02]} />
        <meshStandardMaterial color={style.shirt} emissive={style.shirt} emissiveIntensity={0.25} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Desk legs */}
      {([[-0.82,-0.25],[0.82,-0.25],[-0.82,0.85],[0.82,0.85]] as [number,number][]).map(([dx,dz],i) => (
        <mesh key={i} position={[dx, -0.65, dz]}>
          <cylinderGeometry args={[0.032, 0.032, 1.4, 6]} />
          <meshStandardMaterial color="#120F28" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Glowing tablet on desk */}
      <mesh position={[0, 0.13, 0.55]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[0.62, 0.4, 0.012]} />
        <meshStandardMaterial color={style.shirt} emissive={style.shirt}
          emissiveIntensity={isDirected ? 1.4 : 0.5} roughness={0.04} metalness={0.9} />
      </mesh>

      {/* ── Chair (behind student) ── */}
      <mesh position={[0, -0.42, 1.4]}>
        <boxGeometry args={[1.05, 0.055, 0.85]} />
        <meshBasicMaterial color="#150F25" />
      </mesh>
      <mesh position={[0, 0.06, 1.85]}>
        <boxGeometry args={[1.05, 0.88, 0.055]} />
        <meshBasicMaterial color="#150F25" />
      </mesh>

      {/* ── Xbot student: raised so upper body clears desk ── */}
      <primitive
        ref={groupRef}
        object={cloned}
        scale={1.1}
        position={[0, -0.78, 0.9]}
        rotation={[0, Math.PI, 0]}
        dispose={null}
      />

      {/* ── Status dot ── */}
      <mesh position={[-0.82, 0.12, 0.2]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={1.5} />
      </mesh>

      {/* ── Golden ring when directed ── */}
      <pointLight ref={glowRef} color={style.shirt} intensity={0} distance={5} position={[0, 2, 1]} />
      {isDirected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.77, 0.7]}>
          <ringGeometry args={[0.55, 0.68, 48]} />
          <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={2.5} transparent opacity={0.9} />
        </mesh>
      )}

      {/* ── Name label ── */}
      <Suspense fallback={null}>
        <Text position={[0, 1.1, 0.9]} fontSize={0.24} color="white" anchorX="center"
          outlineWidth={0.03} outlineColor="#09081A">
          {student.name}
        </Text>
        <Text position={[0, 0.82, 0.9]} fontSize={0.14} color={statusColor} anchorX="center"
          outlineWidth={0.018} outlineColor="#09081A">
          {`${student.mastery}% • Lv.${student.level}`}
        </Text>
      </Suspense>

      {/* ── Response bubble ── */}
      {showResp && (
        <group position={[1.1, 1.9, 0.9]}>
          <mesh position={[0, 0, -0.014]}>
            <planeGeometry args={[2.7, 0.82]} />
            <meshBasicMaterial color={style.shirt} transparent opacity={0.95} />
          </mesh>
          <mesh>
            <planeGeometry args={[2.5, 0.7]} />
            <meshBasicMaterial color="white" transparent opacity={0.97} />
          </mesh>
          <mesh position={[-1.35, -0.48, 0]} rotation={[0, 0, -Math.PI / 5]}>
            <coneGeometry args={[0.1, 0.25, 4]} />
            <meshBasicMaterial color="white" />
          </mesh>
          <Suspense fallback={null}>
            <Text position={[0, 0, 0.01]} fontSize={0.17} color="#1E1040"
              anchorX="center" anchorY="middle" maxWidth={2.3} textAlign="center">
              {STUDENT_RESPONSES[idx % STUDENT_RESPONSES.length]}
            </Text>
          </Suspense>
        </group>
      )}
    </group>
  );
}

// ─── SpeechBubble3D ────────────────────────────────────────────────────────────

function SpeechBubble3D({ text, teacherPos }: { text: string; teacherPos: React.RefObject<THREE.Vector3> }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(({ camera, clock }) => {
    if (!groupRef.current) return;
    const src = teacherPos.current ?? new THREE.Vector3(0, 0, -4.5);
    groupRef.current.position.set(src.x + 0.5, src.y + 4.5, src.z + 0.4);
    groupRef.current.position.y += Math.sin(clock.elapsedTime * 1.4) * 0.05;
    groupRef.current.lookAt(camera.position);
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[3.4, 1.6]} />
        <meshBasicMaterial color="#5B21B6" transparent opacity={0.97} />
      </mesh>
      <mesh>
        <planeGeometry args={[3.2, 1.45]} />
        <meshBasicMaterial color="white" transparent opacity={0.97} />
      </mesh>
      <mesh position={[0, -0.88, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.16, 0.38, 4]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <Suspense fallback={null}>
        <Text position={[0, 0.03, 0.01]} fontSize={0.23} color="#1E1040"
          anchorX="center" anchorY="middle" maxWidth={2.9} textAlign="center">
          {text}
        </Text>
      </Suspense>
    </group>
  );
}

// ─── ClassroomTeacher ──────────────────────────────────────────────────────────

function ClassroomTeacher({ phaseIdx, phases, students }: {
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
        sm.emissive = new THREE.Color('#2D1080');
        sm.emissiveIntensity = 0.25;
        sm.metalness = 0.45;
        sm.roughness  = 0.38;
        sm.needsUpdate = true;
      });
    });
    return c;
  }, [scene]);

  const groupRef     = useRef<THREE.Group>(null!);
  const { actions }  = useAnimations(animations, groupRef);
  const prevAnim     = useRef('');
  const targetPos    = useRef(new THREE.Vector3(0, 0, -4.5));
  const targetRotY   = useRef(Math.PI);
  const teacherPosRef = useRef(new THREE.Vector3(0, 0, -4.5));

  const phase = phases[phaseIdx];

  useEffect(() => {
    const directed = phase.directed ? students.find(s => s.id === phase.directed) : null;
    if (directed) {
      targetPos.current.set(directed.pos[0] * 0.45, 0, directed.pos[2] * 0.35 - 2.2);
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
      if (tgt) tgt.reset().setEffectiveTimeScale(anim === 'agree' ? 1.8 : 1).fadeIn(0.3).play();
    }
  }, [phaseIdx, phase, students, actions]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    void delta;
    groupRef.current.position.lerp(
      new THREE.Vector3(targetPos.current.x, -1.35, targetPos.current.z),
      0.035,
    );
    teacherPosRef.current.copy(groupRef.current.position);
    let dy = targetRotY.current - groupRef.current.rotation.y;
    while (dy >  Math.PI) dy -= 2 * Math.PI;
    while (dy < -Math.PI) dy += 2 * Math.PI;
    groupRef.current.rotation.y += dy * 0.065;
  });

  return (
    <>
      <primitive ref={groupRef} object={cloned} scale={1.55} position={[0, -1.35, -4.5]} dispose={null} />
      <SpeechBubble3D text={phase.bubble} teacherPos={teacherPosRef} />
    </>
  );
}

// ─── ClassroomScene ────────────────────────────────────────────────────────────

function ClassroomScene({ phaseIdx, phases, students, directedId }: {
  phaseIdx: number;
  phases: typeof PHASES;
  students: Student[];
  directedId: string | null;
}) {
  return (
    <>
      <color attach="background" args={['#09081A']} />
      <fog attach="fog" args={['#09081A', 28, 55]} />

      <OrbitControls
        target={[0, 0.5, -1]}
        enablePan={false}
        enableZoom
        minDistance={5}
        maxDistance={25}
        mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }}
      />

      {/* ── Ambient + fill (lower so walls stay dark) ── */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 10, 5]} intensity={1.4} color="#FFFFFF" castShadow />
      <directionalLight position={[-6, 4, -3]} intensity={0.7} color="#C4B5FD" />
      <directionalLight position={[6, 4, -3]} intensity={0.7} color="#A5B4FC" />

      {/* Ceiling strip lights */}
      <pointLight position={[-5.5, 4.2, -2]} intensity={1.4} color="#FFF8F0" distance={10} />
      <pointLight position={[0,    4.2, -2]} intensity={1.6} color="#FFF8F0" distance={12} />
      <pointLight position={[5.5,  4.2, -2]} intensity={1.4} color="#FFF8F0" distance={10} />
      <pointLight position={[-5.5, 4.2,  3]} intensity={1.2} color="#FFF8F0" distance={10} />
      <pointLight position={[5.5,  4.2,  3]} intensity={1.2} color="#FFF8F0" distance={10} />

      {/* Teacher spotlight */}
      <pointLight position={[0, 6, -5]} intensity={3.5} color="#7C3AED" distance={12} />

      {/* Per-desk soft lights */}
      {students.map(s => (
        <pointLight key={s.id}
          position={[s.pos[0], 2.0, s.pos[2]]}
          intensity={0.5} color="#5B8DEA" distance={4.5} />
      ))}

      {/* ── Floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.36, 0]} receiveShadow>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color="#13112A" roughness={0.65} metalness={0.2} />
      </mesh>
      <gridHelper args={[24, 24, '#3A2D70', '#221A50']} position={[0, -1.35, 0]} />

      {/* Floor glow strips near front */}
      {[-4, 0, 4].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, -1.34, -5]}>
          <planeGeometry args={[0.06, 5]} />
          <meshBasicMaterial color="#7C3AED" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* ── Ceiling strips only (no surface mesh) ── */}
      {[-5.5, 0, 5.5].map((x, i) => (
        <mesh key={i} position={[x, 5.4, -1.5]}>
          <boxGeometry args={[0.8, 0.06, 0.15]} />
          <meshBasicMaterial color="#332A50" />
        </mesh>
      ))}


      {/* ── Front wall (basic — always dark) ── */}
      <mesh position={[0, 2.0, -9.5]}>
        <planeGeometry args={[24, 9]} />
        <meshBasicMaterial color="#110E22" />
      </mesh>

      {/* ── Back wall ── */}
      <mesh position={[0, 2.0, 8]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[24, 9]} />
        <meshBasicMaterial color="#0F0D20" />
      </mesh>

      {/* ── Left wall ── */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-12, 2.0, -0.75]}>
        <planeGeometry args={[20, 9]} />
        <meshBasicMaterial color="#0E0C1E" />
      </mesh>

      {/* Left wall windows */}
      {([-3.5, 2.5] as number[]).map((z, i) => (
        <group key={i} position={[-11.95, 2.8, z]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[3.2, 2.8]} />
            <meshStandardMaterial color="#1A3A6A" emissive="#0A2040" emissiveIntensity={0.6} transparent opacity={0.9} />
          </mesh>
          {/* Window frame */}
          {[[-1.5,0],[1.5,0],[0,-1.3],[0,1.3]].map(([wz, wy], j) => (
            <mesh key={j} rotation={[0, Math.PI / 2, 0]} position={[0, wy * 0.5, wz * 0.12]}>
              <planeGeometry args={[j < 2 ? 0.06 : 3.2, j < 2 ? 2.8 : 0.06]} />
              <meshBasicMaterial color="#2A4A8A" />
            </mesh>
          ))}
          <pointLight position={[0.6, 0, 0]} intensity={0.5} color="#4A7FC1" distance={6} />
        </group>
      ))}

      {/* ── Right wall ── */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[12, 2.0, -0.75]}>
        <planeGeometry args={[20, 9]} />
        <meshBasicMaterial color="#0E0C1E" />
      </mesh>

      {/* ── Blackboard ── */}
      <group position={[0, 2.8, -8.8]}>
        {/* Outer frame */}
        <mesh position={[0, 0, -0.04]}>
          <planeGeometry args={[11.4, 4.4]} />
          <meshBasicMaterial color="#2A1A10" />
        </mesh>
        {/* Board surface */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[11, 4.0]} />
          <meshBasicMaterial color="#0E2A1A" />
        </mesh>
        {/* Board active surface */}
        <mesh>
          <planeGeometry args={[10.8, 3.8]} />
          <meshBasicMaterial color="#173222" />
        </mesh>
        {/* Overhead light strip (thin, dim) */}
        <mesh position={[0, 2.4, 0.2]}>
          <boxGeometry args={[10, 0.04, 0.1]} />
          <meshBasicMaterial color="#504030" />
        </mesh>
        <pointLight position={[0, 3.5, 1.2]} intensity={3.0} color="#FFFAF0" distance={10} />
        {/* Chalk lines decorative */}
        {[-1.6, 1.3].map((y, i) => (
          <mesh key={i} position={[0, y, 0.005]} rotation={[0, 0, 0]}>
            <planeGeometry args={[10.2, 0.012]} />
            <meshBasicMaterial color="#3D6040" transparent opacity={0.7} />
          </mesh>
        ))}
        {/* Chalk text */}
        <Suspense fallback={null}>
          <Text position={[0, 1.0, 0.02]} fontSize={0.42} color="#C8F5D0"
            anchorX="center" outlineWidth={0.01} outlineColor="#0A1A10">
            {'درس الحلقات (Loops)'}
          </Text>
          <Text position={[-1.5, 0.22, 0.02]} fontSize={0.26} color="#9BE3B0" anchorX="center">
            {'for i in range(n):'}
          </Text>
          <Text position={[2.5, 0.22, 0.02]} fontSize={0.26} color="#9BE3B0" anchorX="center">
            {'while condition:'}
          </Text>
          <Text position={[-1.5, -0.28, 0.02]} fontSize={0.22} color="#78C896" anchorX="center">
            {'    print(i)'}
          </Text>
          <Text position={[2.5, -0.28, 0.02]} fontSize={0.22} color="#78C896" anchorX="center">
            {'    # keep looping'}
          </Text>
          <Text position={[0, -0.95, 0.02]} fontSize={0.2} color="#5DAE78" anchorX="center">
            {'break  →  خروج فوري    continue  →  تخطي التكرار'}
          </Text>
        </Suspense>
        {/* Chalk tray */}
        <mesh position={[0, -2.12, 0.12]}>
          <boxGeometry args={[11, 0.09, 0.22]} />
          <meshStandardMaterial color="#241810" roughness={1} />
        </mesh>
        {/* Chalk pieces */}
        {[-2, 0, 2].map((cx, i) => (
          <mesh key={i} position={[cx, -2.1, 0.18]} rotation={[0, i * 0.5, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
            <meshStandardMaterial color={['#FFFFFF', '#FFF5E0', '#FFDFD0'][i]} roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ── Teacher desk ── */}
      <group position={[0, -1.36, -3.0]}>
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[2.2, 0.06, 1.0]} />
          <meshStandardMaterial color="#1E1A38" roughness={0.6} metalness={0.35} />
        </mesh>
        {/* Desk edge glow */}
        <mesh position={[0, 0.41, 0]}>
          <boxGeometry args={[2.22, 0.022, 1.02]} />
          <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={0.5} roughness={0.3} metalness={0.7} />
        </mesh>
        {([ [-1.0, -0.45], [1.0, -0.45], [-1.0, 0.45], [1.0, 0.45] ] as [number, number][]).map(([dx, dz], i) => (
          <mesh key={i} position={[dx, 0.17, dz]}>
            <cylinderGeometry args={[0.04, 0.04, 0.7, 6]} />
            <meshStandardMaterial color="#1A1530" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        {/* Laptop */}
        <mesh position={[0.4, 0.44, -0.15]} rotation={[-0.28, 0, 0]}>
          <boxGeometry args={[0.55, 0.38, 0.018]} />
          <meshStandardMaterial color="#6366F1" emissive="#6366F1" emissiveIntensity={0.6} roughness={0.2} metalness={0.6} />
        </mesh>
        {/* Laptop base */}
        <mesh position={[0.4, 0.412, 0.08]}>
          <boxGeometry args={[0.55, 0.012, 0.35]} />
          <meshStandardMaterial color="#111122" roughness={0.3} metalness={0.8} />
        </mesh>
        <pointLight position={[0, 1.5, 0]} intensity={0.8} color="#7C3AED" distance={3.5} />
      </group>

      {/* ── Students — each in own Suspense so GLTF load doesn't block scene ── */}
      {students.map((s, idx) => (
        <Suspense key={s.id} fallback={null}>
          <StudentAvatar student={s} isDirected={s.id === directedId} idx={idx} />
        </Suspense>
      ))}

      {/* ── Xbot teacher (inner Suspense catches GLTF suspension) ── */}
      <Suspense fallback={null}>
        <ClassroomTeacher phaseIdx={phaseIdx} phases={phases} students={students} />
      </Suspense>

      {/* ── Stars (inner Suspense prevents blocking scene) ── */}
      <Suspense fallback={null}>
        <Stars radius={45} depth={25} count={300} factor={2.5} fade speed={0.15} />
      </Suspense>
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ClassroomClient({ locale }: { locale: string }) {
  const isRtl = locale === 'ar';
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setPhaseIdx(p => (p + 1) % PHASES.length);
      setElapsed(0);
    }, 5000);
    const e = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => { clearInterval(t); clearInterval(e); };
  }, []);

  const phase: Phase = PHASES[phaseIdx];
  const directedId = phase.directed;
  const directedStudent = directedId ? STUDENTS.find(s => s.id === directedId) : null;

  const actionLabel: Record<string, string> = {
    explaining:      'Xbot يشرح للجميع',
    questioning:     'Xbot يسأل طالباً',
    praising:        'Xbot يشجع الطالب',
    'peer-teaching': 'تعليم الأقران',
  };

  const actionIcon: Record<string, React.ReactNode> = {
    explaining:      <BookOpen size={14} />,
    questioning:     <MessageSquare size={14} />,
    praising:        <Award size={14} />,
    'peer-teaching': <Users size={14} />,
  };

  const statusItems = [
    { icon: <Users size={14} className="text-purple-400" />, label: '6 طلاب متصلون' },
    { icon: <Target size={14} className="text-amber-400" />, label: '78% متوسط الإتقان' },
    { icon: <Zap size={14} className="text-blue-400" />, label: 'درس: الحلقات' },
    { icon: <TrendingUp size={14} className="text-green-400" />, label: 'الجلسة 3/5' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0 }} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── 3D Canvas — NO outer Suspense; each child manages its own ── */}
      <Canvas
        camera={{ position: [0, 3.5, 12], fov: 72 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false }}
        shadows
        onCreated={({ gl, camera }) => {
          gl.setClearColor(0x09081A, 1);
          gl.shadowMap.enabled = true;
          camera.lookAt(0, 0.5, -1);
        }}
      >
        <ClassroomScene
          phaseIdx={phaseIdx}
          phases={PHASES}
          students={STUDENTS}
          directedId={directedId}
        />
      </Canvas>

      {/* ── Top stats bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
        background: 'linear-gradient(to bottom, rgba(9,8,26,0.95) 0%, transparent 100%)',
        padding: '12px 20px',
      }}>
        <div className="flex items-center gap-3 flex-wrap">
          {statusItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-white/75
              bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Side panel: student list ── */}
      <div style={{
        position: 'fixed', top: 64, right: isRtl ? 'auto' : 16, left: isRtl ? 16 : 'auto',
        zIndex: 20, width: 200,
      }}>
        <div className="bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
            <Brain size={13} className="text-purple-400" />
            <span className="text-xs font-semibold text-white/80">مستوى الطلاب</span>
          </div>
          {STUDENTS.map((s, i) => {
            const style = STUDENT_STYLES[i];
            const statusColor =
              s.status === 'active'     ? '#10B981' :
              s.status === 'thinking'   ? '#F59E0B' :
              s.status === 'struggling' ? '#EF4444' : '#6B7280';
            return (
              <motion.div
                key={s.id}
                animate={{ backgroundColor: s.id === directedId ? 'rgba(124,58,237,0.25)' : 'rgba(0,0,0,0)' }}
                className="px-3 py-2 flex items-center gap-2 border-b border-white/5 last:border-0">
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
                <span className="text-xs text-white/80 flex-1">{s.name}</span>
                <div className="flex items-center gap-1">
                  <div className="h-1 rounded-full overflow-hidden" style={{ width: 36, background: '#ffffff15' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${s.mastery}%`, background: style.shirt }} />
                  </div>
                  <span className="text-[10px] text-white/40">{s.mastery}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
        background: 'linear-gradient(to top, rgba(9,8,26,0.95) 0%, transparent 100%)',
        padding: '16px 24px',
      }}>
        <div className="flex items-center justify-between">
          {/* Action badge */}
          <motion.div
            key={phase.action}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm font-semibold text-white
              bg-purple-600/30 px-4 py-2.5 rounded-xl border border-purple-500/40 backdrop-blur-sm">
            {actionIcon[phase.action]}
            <span>{actionLabel[phase.action]}</span>
            {directedStudent && (
              <span className="text-purple-300 font-normal">— {directedStudent.name}</span>
            )}
          </motion.div>

          {/* Phase indicator dots */}
          <div className="flex items-center gap-2">
            {PHASES.map((_, i) => (
              <motion.div key={i}
                animate={{
                  width: i === phaseIdx ? 24 : 8,
                  opacity: i === phaseIdx ? 1 : 0.35,
                }}
                className={`h-2 rounded-full transition-colors ${
                  i === phaseIdx ? 'bg-amber-400' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Countdown */}
          <div className="text-xs text-white/50 min-w-[80px] text-end">
            {phaseIdx + 1}/{PHASES.length} مراحل
          </div>
        </div>

        {/* Teacher bubble text reflected in HUD */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phaseIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-2 text-center text-sm text-white/70 max-w-md mx-auto">
            {phase.bubble.replace(/\n/g, ' ')}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
