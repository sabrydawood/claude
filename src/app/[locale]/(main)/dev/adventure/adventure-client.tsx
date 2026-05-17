'use client';

import { Suspense, useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Line, useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Target, Lightbulb, CheckCircle2, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { RobotMood } from '@/components/mascot-gltf';

const XbotExpressive = dynamic(
  () => import('@/components/mascot-gltf').then(m => ({ default: m.XbotExpressive })),
  { ssr: false, loading: () => <div style={{ width: 160, height: 220 }} /> }
);

type Stage = 'map' | 'entry' | 'lesson' | 'challenge' | 'victory' | 'map-complete';
type IslandStatus = 'done' | 'current' | 'unlocked' | 'locked';
interface IslandNode { id: string; pos: [number, number, number]; color: string; status: IslandStatus; label: string; }

const ISLAND_NODES: IslandNode[] = [
  { id: '1', pos: [-7, 0.5, 0],  color: '#10B981', status: 'done',    label: 'البرمجة' },
  { id: '2', pos: [-4, 1.5, -3], color: '#10B981', status: 'done',    label: 'المتغيرات' },
  { id: '3', pos: [-1, 0, 2],    color: '#F59E0B', status: 'current', label: 'الحلقات' },
  { id: '4', pos: [3,  1.5, -2], color: '#7C3AED', status: 'locked',  label: 'الدوال' },
  { id: '5', pos: [6,  0, 1],    color: '#374151', status: 'locked',  label: 'القوائم' },
  { id: '6', pos: [9,  2, -1],   color: '#1F2937', status: 'locked',  label: 'المشاريع' },
];
const EDGES: [string, string][] = [['1','2'],['2','3'],['3','4'],['4','5'],['5','6']];
const MATCH_PAIRS = [
  { id: '1', question: 'حلقة for',   answer: 'تتكرر عدداً محدداً' },
  { id: '2', question: 'حلقة while', answer: 'تتكرر حتى يتغير الشرط' },
  { id: '3', question: 'break',      answer: 'تخرج من الحلقة فوراً' },
];
const REWARD_STARS = Array.from({ length: 12 }, (_, i) => {
  const r = 60 + (i % 3) * 15; const rad = (i / 12) * 2 * Math.PI;
  return { x: 80 + Math.cos(rad) * r, y: 80 + Math.sin(rad) * r, large: i % 3 === 0, delay: i * 0.05 };
});

// ─── 3D Components ─────────────────────────────────────────────────────────────

function IslandSphere({ island, onIslandClick }: { island: IslandNode; onIslandClick: (id: string) => void }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const isActive  = island.status !== 'locked';
  const isPulsing = island.status === 'current' || island.status === 'unlocked';
  const color     = isActive ? island.color : '#374151';
  const emInt     = island.status === 'done' ? 0.5 : isPulsing ? 0.7 : 0.05;
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const base = isPulsing ? 1 + Math.sin(clock.elapsedTime * 2) * 0.06 : 1;
    meshRef.current.scale.setScalar(base + (hovered ? 0.08 : 0));
  });
  return (
    <group position={island.pos}>
      <mesh ref={meshRef}
        onClick={() => { if (isPulsing || island.status === 'current') onIslandClick(island.id); }}
        onPointerOver={() => { if (isActive) { setHovered(true); document.body.style.cursor = 'pointer'; } }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emInt} roughness={0.2} metalness={0.7} />
      </mesh>
      {isActive && <mesh><sphereGeometry args={[0.8, 16, 16]} /><meshStandardMaterial color={color} transparent opacity={0.06} side={THREE.BackSide} /></mesh>}
      <Text position={[0, 1.0, 0]} fontSize={0.22} color="rgba(255,255,255,0.85)" anchorX="center">{island.label}</Text>
    </group>
  );
}

function XbotCharacter({ stage }: { stage: Stage }) {
  const { scene, animations } = useGLTF('/models/Xbot.glb');
  const cloned   = useMemo(() => SkeletonUtils.clone(scene) as THREE.Group, [scene]);
  const groupRef = useRef<THREE.Group>(cloned);
  const { actions } = useAnimations(animations, groupRef);
  useEffect(() => {
    const c = new THREE.Color('#7C3AED');
    cloned.traverse(child => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mats = Array.isArray((child as THREE.Mesh).material) ? (child as THREE.Mesh).material as THREE.Material[] : [(child as THREE.Mesh).material as THREE.Material];
      mats.forEach(m => { const sm = m as THREE.MeshStandardMaterial; if (sm.color) sm.color.set(c); sm.metalness = 0.3; sm.roughness = 0.5; sm.needsUpdate = true; });
    });
  }, [cloned]);
  useEffect(() => {
    const name = stage === 'victory' ? 'agree' : 'idle';
    Object.values(actions).forEach(a => a?.fadeOut(0.3));
    (actions[name] ?? actions['idle'])?.reset().fadeIn(0.3).play();
  }, [stage, actions]);
  const targetPos = useMemo<THREE.Vector3>(() => new THREE.Vector3(...(stage === 'map-complete' ? [3, -0.25, -2] : [-1, -1.75, 2]) as [number,number,number]), [stage]);
  useFrame(() => { groupRef.current?.position.lerp(targetPos, 0.03); });
  return <primitive ref={groupRef} object={cloned} scale={2.2} position={[-1, -1.75, 2]} dispose={null} />;
}

function VictoryParticles({ active }: { active: boolean }) {
  const PARTICLES = useMemo(() => Array.from({ length: 20 }, (_, i) => {
    const a = (i / 20) * Math.PI * 2, r = 3 + (i % 3);
    return { x: Math.cos(a) * r, y: 1 + (i % 4) * 0.5, z: Math.sin(a) * r };
  }), []);
  const refs  = useRef<(THREE.Mesh | null)[]>([]);
  const start = useRef(0);
  useEffect(() => { if (active) start.current = Date.now(); }, [active]);
  useFrame(() => {
    if (!active) return;
    const t = (Date.now() - start.current) / 1000;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const p = PARTICLES[i], prog = Math.min(t * 2, 1);
      mesh.position.set(-1 + p.x * prog, p.y * prog, 2 + p.z * prog);
      mesh.scale.setScalar(1 - prog * 0.8);
    });
  });
  if (!active) return null;
  return (
    <>{PARTICLES.map((_, i) => (
      <mesh key={i} ref={el => { refs.current[i] = el; }} position={[-1, 0, 2]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={i%3===0?'#F59E0B':i%3===1?'#7C3AED':'#10B981'} emissive={i%3===0?'#F59E0B':'#7C3AED'} emissiveIntensity={1} />
      </mesh>
    ))}</>
  );
}

function CameraRig({ stage }: { stage: Stage }) {
  const t = useMemo<[number,number,number]>(() => {
    if (stage === 'entry' || stage === 'victory') return [-1, 3, 8];
    if (stage === 'lesson' || stage === 'challenge') return [-1, 2, 7];
    if (stage === 'map-complete') return [1, 4, 16];
    return [0, 4, 16];
  }, [stage]);
  useFrame(({ camera }) => { camera.position.lerp(new THREE.Vector3(...t), 0.04); camera.lookAt(0, 0, 0); });
  return null;
}

function AdventureScene({ stage, onIslandClick, islandsData }: { stage: Stage; onIslandClick: (id: string) => void; islandsData: IslandNode[] }) {
  const mapStage = stage === 'map' || stage === 'map-complete';
  return (
    <>
      <color attach="background" args={['#020617']} />
      <fog attach="fog" args={['#020617', 20, 45]} />
      <Stars radius={60} depth={30} count={800} factor={3} fade speed={0.3} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} color="#C4B5FD" />
      <pointLight position={[0, 8, 0]} intensity={0.8} color="#7C3AED" distance={20} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}><circleGeometry args={[18, 64]} /><meshStandardMaterial color="#0A0520" transparent opacity={0.8} /></mesh>
      <gridHelper args={[32, 32, '#2D1B69', '#1A0F3C']} position={[0, -0.09, 0]} />
      {EDGES.map(([a, b]) => {
        const na = islandsData.find(n => n.id === a)!, nb = islandsData.find(n => n.id === b)!;
        const ok = na.status !== 'locked' && nb.status !== 'locked';
        return <Line key={`${a}-${b}`} points={[new THREE.Vector3(...na.pos), new THREE.Vector3(...nb.pos)]} color={ok ? '#5B21B6' : '#1F2937'} lineWidth={ok ? 1.5 : 0.6} transparent opacity={ok ? 0.7 : 0.2} />;
      })}
      {islandsData.map(island => <IslandSphere key={island.id} island={island} onIslandClick={onIslandClick} />)}
      <Suspense fallback={null}><XbotCharacter stage={stage} /></Suspense>
      <VictoryParticles active={stage === 'victory'} />
      <CameraRig stage={stage} />
      <OrbitControls enablePan={false} enableZoom={false} enableRotate={mapStage} maxPolarAngle={Math.PI / 2.2} autoRotate={mapStage} autoRotateSpeed={0.3} />
    </>
  );
}

// ─── HTML Overlay Components ────────────────────────────────────────────────────

function SpeechBubble({ text }: { text: string }) {
  return (
    <div className="relative bg-white rounded-2xl px-4 py-3 text-sm font-semibold leading-relaxed max-w-[220px] shadow-lg" style={{ color: '#1E293B' }}>
      {text.split('\n').map((line, i) => <div key={i}>{line}</div>)}
      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0"
        style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '10px solid white' }} />
    </div>
  );
}

function MiniMatch({ onComplete, setMood }: { onComplete: () => void; setMood: (m: RobotMood) => void }) {
  const [selQ, setSelQ] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongA, setWrongA] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answers  = useMemo(() => [MATCH_PAIRS[2], MATCH_PAIRS[0], MATCH_PAIRS[1]], []);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
  function pickQ(id: string) { if (!matched.has(id)) setSelQ(prev => prev === id ? null : id); }
  function pickA(id: string) {
    if (!selQ || matched.has(selQ)) return;
    if (selQ === id) {
      const next = new Set(matched).add(selQ); setMatched(next); setSelQ(null); setMood('happy');
      if (next.size === MATCH_PAIRS.length) timerRef.current = setTimeout(onComplete, 600);
    } else { setWrongA(id); setMood('thinking'); timerRef.current = setTimeout(() => { setWrongA(null); setSelQ(null); setMood('idle'); }, 600); }
  }
  const qCls = (p: typeof MATCH_PAIRS[0]) => matched.has(p.id) ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 cursor-not-allowed' : selQ === p.id ? 'bg-purple-600 border-purple-400 text-white' : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10';
  const aCls = (p: typeof MATCH_PAIRS[0]) => matched.has(p.id) ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 cursor-not-allowed' : wrongA === p.id ? 'bg-red-600/20 border-red-500 text-red-300' : selQ ? 'bg-white/5 border-white/15 text-white/80 hover:bg-amber-500/10 hover:border-amber-500/40 cursor-pointer' : 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed';
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-white/50 text-center">{matched.size}/3 مكتملة</p>
      <div className="grid grid-cols-2 gap-2" dir="rtl">
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] text-white/40 text-center font-bold">المفهوم</p>
          {MATCH_PAIRS.map(p => <button key={p.id} onClick={() => pickQ(p.id)} disabled={matched.has(p.id)} className={`px-3 py-2 rounded-xl border text-xs font-semibold text-center transition-all ${qCls(p)}`}>{p.question}</button>)}
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] text-white/40 text-center font-bold">التعريف</p>
          {answers.map(p => <button key={p.id} onClick={() => pickA(p.id)} disabled={matched.has(p.id) || !selQ} className={`px-3 py-2 rounded-xl border text-xs text-center transition-all ${aCls(p)}`}>{p.answer}</button>)}
        </div>
      </div>
    </div>
  );
}

function PlayerHUD({ xp }: { xp: number }) {
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 10 }} className="bg-black/50 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-3">
      <div className="text-right"><p className="text-white font-bold text-sm">أحمد</p><p className="text-white/50 text-xs">المستوى 4</p></div>
      <div className="w-20">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full" style={{ width: `${Math.round((xp/400)*100)}%` }} /></div>
        <p className="text-amber-400 text-xs mt-0.5">{xp}/400 XP</p>
      </div>
    </div>
  );
}

function MapOverlay({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div style={{ position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
      className="flex flex-col items-center gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
      <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center"><p className="text-white/60 text-sm">اضغط على الجزيرة أو</p></div>
      <button onClick={onEnter} className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-base flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-colors">
        <ChevronRight size={18} />ادخل جزيرة الحلقات
      </button>
    </motion.div>
  );
}

function EntryOverlay({ onStart, mood }: { onStart: () => void; mood: RobotMood }) {
  return (
    <motion.div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20 }}
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-12 pb-8 px-6">
      <div className="max-w-lg mx-auto flex flex-col items-center gap-4 text-center" dir="rtl">
        <p className="text-2xl font-black text-amber-400">جزيرة الحلقات</p>
        <SpeechBubble text={"مرحباً يا بطل\nمهمتك اليوم:\nأنقذ جزيرة الحلقات\nمن فوضى الكود!"} />
        <XbotExpressive mood={mood} width={160} height={220} />
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {['فهم الحلقة for', 'تعلم break', 'اجتاز التحدي'].map((obj, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 + 0.3 }}
              className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2.5 border border-white/10">
              <CheckCircle2 size={16} className="text-white/30 shrink-0" /><span className="text-white/70 text-sm">{obj}</span>
            </motion.div>
          ))}
        </div>
        <button onClick={onStart} className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black text-base shadow-lg hover:from-purple-500 hover:to-purple-400 transition-colors">
          ابدأ المهمة!
        </button>
      </div>
    </motion.div>
  );
}

function LessonOverlay({ onComplete, mood, onMoodChange }: { onComplete: () => void; mood: RobotMood; onMoodChange: (m: RobotMood) => void }) {
  const [lineIdx, setLineIdx]     = useState(0);
  const [quizAns, setQuizAns]     = useState<number | null>(null);
  const [quizDone, setQuizDone]   = useState(false);
  useEffect(() => { const t = setInterval(() => setLineIdx(v => v < 2 ? v+1 : v), 1200); return () => clearInterval(t); }, []);
  const CODE = [{ text: 'for i in range(10):', color: '#60A5FA' }, { text: '    print("سلام!")', color: '#A78BFA' }, { text: '# يطبع 10 مرات', color: '#10B981' }];
  const OPTS = ['5 مرات', '10 مرات', '1 مرة'];
  return (
    <motion.div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20, maxHeight: '70vh' }}
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="bg-slate-950/95 backdrop-blur-xl pt-8 pb-8 px-6 rounded-t-3xl border-t border-white/10 overflow-y-auto">
      <div className="max-w-lg mx-auto" dir="rtl">
        <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
          <div className="flex flex-col items-center gap-3">
            <SpeechBubble text={"الحلقة for تقول:\nكرّر هذا 10 مرات"} />
            <XbotExpressive mood={mood} width={120} height={170} />
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-purple-500/15 border border-purple-500/30 rounded-xl p-4">
              <p className="text-purple-300 font-bold text-sm mb-1.5 flex items-center gap-1.5"><Lightbulb size={15} />الحلقة for — المفهوم</p>
              <p className="text-white/75 text-xs leading-relaxed">الحلقة تكرر كوداً عدة مرات بدون كتابته مراراً.</p>
            </div>
            <div className="bg-slate-900 rounded-xl p-3 border border-white/[0.07] font-mono" dir="ltr">
              <div className="flex items-center gap-1.5 mb-2"><div className="w-2 h-2 rounded-full bg-[#FF5F57]" /><div className="w-2 h-2 rounded-full bg-[#FFBD2E]" /><div className="w-2 h-2 rounded-full bg-[#28CA41]" /><span className="text-white/30 text-[10px] ml-auto">Python</span></div>
              {CODE.map((line, i) => (
                <AnimatePresence key={i}>{i <= lineIdx && (
                  <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} style={{ color: line.color }} className="text-xs leading-loose">
                    {line.text}{i === lineIdx && <motion.span animate={{ opacity: [1,0] }} transition={{ repeat: Infinity, duration: 0.55 }} style={{ background: line.color }} className="inline-block w-0.5 h-[1em] ml-0.5 align-middle" />}
                  </motion.div>
                )}</AnimatePresence>
              ))}
            </div>
          </div>
        </div>
        <AnimatePresence>
          {lineIdx >= 2 && !quizDone && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-white font-bold text-sm">كم مرة سيطبع الكود كلمة "سلام!"؟</p>
              <div className="flex flex-col gap-2">
                {OPTS.map((opt, i) => {
                  const chosen = quizAns === i, correct = i === 1;
                  return <button key={i} onClick={() => { if (quizAns !== null) return; setQuizAns(i); onMoodChange(correct ? 'happy' : 'thinking'); }}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-semibold text-right transition-all ${chosen && correct ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : chosen && !correct ? 'bg-red-600/20 border-red-500 text-red-300' : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10'}`}>{opt}</button>;
                })}
              </div>
              {quizAns === 1 && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setQuizDone(true)} className="mt-1 px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm self-start">ممتاز! متابعة</motion.button>}
            </motion.div>
          )}
        </AnimatePresence>
        {quizDone && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onComplete} className="mt-4 w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-base shadow-[0_0_20px_#F59E0B44]">متابعة للتحدي</motion.button>}
      </div>
    </motion.div>
  );
}

function ChallengeOverlay({ onComplete, mood, onMoodChange }: { onComplete: () => void; mood: RobotMood; onMoodChange: (m: RobotMood) => void }) {
  const [step, setStep]           = useState(0);
  const [matchDone, setMatchDone] = useState(false);
  const [mcAns, setMcAns]         = useState<number | null>(null);
  const [fill, setFill]           = useState('');
  const [fillOk, setFillOk]       = useState<boolean | null>(null);
  const STEPS = ['١/٣','٢/٣','٣/٣'];
  return (
    <motion.div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20, maxHeight: '65vh' }}
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="bg-slate-950/95 backdrop-blur-xl pt-6 pb-8 px-6 rounded-t-3xl border-t border-white/10 overflow-y-auto">
      <div className="max-w-lg mx-auto" dir="rtl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-black text-base flex items-center gap-2"><Target size={16} className="text-amber-400" />تحدي جزيرة الحلقات</p>
          <span className="text-amber-400 font-bold text-sm">{STEPS[step]}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
          <motion.div animate={{ width: `${((step+1)/3)*100}%` }} className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" />
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
          <div className="flex flex-col gap-4">
            {step === 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                <p className="text-white font-bold text-sm">صل المفهوم بتعريفه</p>
                <MiniMatch onComplete={() => { setMatchDone(true); setTimeout(() => setStep(1), 500); }} setMood={onMoodChange} />
                {matchDone && <p className="text-emerald-400 text-xs font-bold text-center">ممتاز! الانتقال للتحدي التالي...</p>}
              </div>
            )}
            {step === 1 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                <p className="text-white font-bold text-sm">ما ناتج هذا الكود؟</p>
                <div className="bg-slate-900 rounded-xl p-3 font-mono text-xs border border-white/[0.07]" dir="ltr">
                  <span style={{ color: '#60A5FA' }}>for i in range(3):</span><br />
                  <span style={{ color: '#A78BFA' }}>{'    '}print(i)</span>
                </div>
                {['0 1 2','1 2 3','3 مرات'].map((opt, i) => {
                  const isCor = i === 0, isChos = mcAns === i, answered = mcAns !== null;
                  return <button key={i} disabled={answered && mcAns === 0} onClick={() => { setMcAns(i); onMoodChange(isCor ? 'happy' : 'thinking'); }}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-semibold text-right transition-all ${isChos && isCor ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : isChos && !isCor ? 'bg-red-600/20 border-red-500 text-red-300' : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10'}`}>{opt}</button>;
                })}
                {mcAns === 0 && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setStep(2)} className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm self-start">التحدي التالي</motion.button>}
                {mcAns !== null && mcAns !== 0 && <p className="text-red-400 text-xs">حاول مجدداً</p>}
              </div>
            )}
            {step === 2 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                <p className="text-white font-bold text-sm">أكمل الكود</p>
                <div className="bg-slate-900 rounded-xl p-3 font-mono text-xs border border-white/[0.07] flex items-center gap-1" dir="ltr">
                  <span style={{ color: '#60A5FA' }}>for i in range(</span>
                  <input value={fill} onChange={e => setFill(e.target.value)} placeholder="?" className="w-10 bg-purple-900/50 border border-purple-500/50 rounded px-1 py-0.5 text-purple-300 text-center outline-none" />
                  <span style={{ color: '#60A5FA' }}>): print(i)</span>
                </div>
                <button onClick={() => { const ok = fill.trim()==='5'; setFillOk(ok); onMoodChange(ok?'happy':'thinking'); if (ok) setTimeout(onComplete, 700); }}
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm self-start transition-colors">تحقق</button>
                {fillOk === true  && <p className="text-emerald-400 text-xs font-bold">ممتاز! الانتقال للنصر...</p>}
                {fillOk === false && <p className="text-red-400 text-xs">تلميح: اكتب 5</p>}
              </div>
            )}
          </div>
          <div className="shrink-0"><XbotExpressive mood={mood} width={100} height={140} /></div>
        </div>
      </div>
    </motion.div>
  );
}

function VictoryOverlay({ xp, onReturn }: { xp: number; onReturn: () => void }) {
  const [countdown, setCountdown] = useState(3);
  useEffect(() => { if (countdown<=0) return; const t = setTimeout(() => setCountdown(c=>c-1), 1000); return () => clearTimeout(t); }, [countdown]);
  return (
    <motion.div style={{ position: 'fixed', inset: 0, zIndex: 30 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 250 }}
        className="bg-slate-900/95 rounded-3xl p-8 border border-white/10 max-w-sm w-full mx-4 text-center" dir="rtl">
        <div className="relative w-40 h-40 mx-auto mb-4">
          {REWARD_STARS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0, x: 80, y: 80 }} animate={{ opacity: 1, scale: 1, x: s.x, y: s.y }} transition={{ delay: s.delay, type: 'spring', stiffness: 220 }} className="absolute top-0 left-0">
              <Star size={s.large ? 22 : 14} className={s.large ? 'text-amber-400 fill-amber-400' : 'text-purple-400 fill-purple-400'} />
            </motion.div>
          ))}
          <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_40px_#F59E0B] flex items-center justify-center">
            <Trophy size={36} className="text-white" />
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <p className="text-2xl font-black text-amber-400">أحسنت يا بطل!</p>
          <p className="text-white/70 text-sm mt-1">أنقذت جزيرة الحلقات!</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.65 }}
          className="mt-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2">
          <Star size={20} className="text-amber-400 fill-amber-400" /><span className="text-white font-bold text-sm">وسام خبير الحلقات</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-3 flex gap-3 justify-center">
          {[{label:'+85 XP',sub:'نقاط'},{label:'3/3',sub:'تحديات'},{label:'90%',sub:'دقة'}].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center">
              <p className="text-white font-black text-base">{s.label}</p><p className="text-white/50 text-xs">{s.sub}</p>
            </div>
          ))}
        </motion.div>
        <div className="mt-4 w-full max-w-xs mx-auto">
          <div className="flex justify-between text-xs text-white/50 mb-1"><span>المستوى 4</span><span>{xp} / 400 XP</span></div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: '50%' }} animate={{ width: '71%' }} transition={{ delay: 1, duration: 1.2, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-purple-600 to-amber-400 rounded-full" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4">
          <XbotExpressive mood="happy" width={100} height={140} />
          <div><p className="text-white/50 text-sm">جزيرة الدوال تفتح في...</p><p className="text-4xl font-black text-amber-400">{countdown}</p></div>
        </div>
        <AnimatePresence>
          {countdown <= 0 && (
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={onReturn}
              className="mt-4 w-full px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black text-base shadow-lg">
              العودة للخريطة
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function MapCompleteOverlay() {
  return (
    <motion.div style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="bg-purple-600/90 backdrop-blur-md px-5 py-2.5 rounded-xl border border-purple-400/50 text-white font-semibold text-sm flex items-center gap-2">
      <Star size={14} className="fill-amber-400 text-amber-400" />
      جزيرة الدوال مفتوحة الآن!
    </motion.div>
  );
}

// ─── Main Export ────────────────────────────────────────────────────────────────

export default function AdventureClient({ locale }: { locale: string }) {
  const [stage, setStage]           = useState<Stage>('map');
  const [xp, setXp]                 = useState(200);
  const [xbotMood, setXbotMood]     = useState<RobotMood>('idle');
  const [islandsData, setIslandsData] = useState<IslandNode[]>(ISLAND_NODES);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerMood = useCallback((mood: RobotMood) => {
    if (moodTimer.current) clearTimeout(moodTimer.current);
    setXbotMood(mood);
    moodTimer.current = setTimeout(() => setXbotMood('idle'), 1800);
  }, []);
  useEffect(() => () => { if (moodTimer.current) clearTimeout(moodTimer.current); }, []);

  function handleIslandClick(id: string) { if (id === '3') setStage('entry'); }
  function handleVictory() { setXp(285); setStage('victory'); }
  function handleMapComplete() {
    setIslandsData(prev => prev.map(isl =>
      isl.id === '3' ? { ...isl, status: 'done' as IslandStatus }
      : isl.id === '4' ? { ...isl, color: '#7C3AED', status: 'unlocked' as IslandStatus }
      : isl
    ));
    setStage('map-complete');
  }

  return (
    <div style={{ position: 'fixed', inset: 0 }} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Canvas camera={{ position: [0, 4, 16], fov: 45 }} style={{ width: '100%', height: '100%' }} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <AdventureScene stage={stage} onIslandClick={handleIslandClick} islandsData={islandsData} />
        </Suspense>
      </Canvas>
      <PlayerHUD xp={xp} />
      <AnimatePresence mode="wait">
        {stage === 'map'          && <MapOverlay       key="map" onEnter={() => setStage('entry')} />}
        {stage === 'entry'        && <EntryOverlay     key="entry" onStart={() => setStage('lesson')} mood={xbotMood} />}
        {stage === 'lesson'       && <LessonOverlay    key="lesson" onComplete={() => setStage('challenge')} mood={xbotMood} onMoodChange={triggerMood} />}
        {stage === 'challenge'    && <ChallengeOverlay key="challenge" onComplete={handleVictory} mood={xbotMood} onMoodChange={triggerMood} />}
        {stage === 'victory'      && <VictoryOverlay   key="victory" xp={xp} onReturn={handleMapComplete} />}
        {stage === 'map-complete' && <MapCompleteOverlay key="mc" />}
      </AnimatePresence>
    </div>
  );
}
