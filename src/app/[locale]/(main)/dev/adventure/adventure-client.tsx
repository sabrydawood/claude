'use client';
import { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import type { RobotMood } from '@/components/mascot-gltf';

type GameStage = 'island' | 'dungeon' | 'battle' | 'victory';
const MOVE_KEYS = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','W','a','A','s','S','d','D'];

interface Question { text: string; options: string[]; correct: number; }
interface Monster { id: string; type: 'slime' | 'ghost' | 'rock' | 'boss'; name: string; color: string; maxHp: number; pos: [number,number,number]; question: Question; }

const MONSTERS: Monster[] = [
  { id:'m1', type:'slime', name:'Slime الحلقة',   color:'#10B981', maxHp:1, pos:[0,0,-4],
    question:{ text:'ما أول رقم يطبعه range(3)؟', options:['0','1','3'], correct:0 } },
  { id:'m2', type:'ghost', name:'Ghost المتغير',   color:'#818CF8', maxHp:1, pos:[0,0,-9],
    question:{ text:'كم مرة تتكرر: for i in range(5)', options:['3 مرات','5 مرات','7 مرات'], correct:1 } },
  { id:'m3', type:'rock',  name:'Rock الشرط',      color:'#9CA3AF', maxHp:1, pos:[0,0,-14],
    question:{ text:'ناتج: for i in range(3): print(i*2)', options:['0 2 4','0 1 2','2 4 6'], correct:0 } },
  { id:'boss', type:'boss', name:'🐉 Dragon Boss', color:'#EF4444', maxHp:3, pos:[0,0,-20],
    question:{ text:'لطباعة 1 2 3 4 5 أكمل: for i in range(__, __):\nprint(i)', options:['range(1, 6)','range(0, 5)','range(1, 5)'], correct:0 } },
];

// ─── 3D Monster Components ──────────────────────────────────────────────────────

function SlimeMonster({ color, defeated }: { color:string; defeated:boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = Math.abs(Math.sin(clock.elapsedTime * 2)) * 0.3; });
  if (defeated) return null;
  return (
    <group>
      <mesh ref={ref}><sphereGeometry args={[0.6,16,16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} /></mesh>
      {[-0.2,0.2].map((x,i) => <mesh key={i} position={[x,0.2,0.5]}><sphereGeometry args={[0.1,8,8]} /><meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} /></mesh>)}
    </group>
  );
}

function GhostMonster({ color, defeated }: { color:string; defeated:boolean }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * 1.5) * 0.2 + 0.5; });
  if (defeated) return null;
  return (
    <group ref={ref}>
      <mesh><sphereGeometry args={[0.5,16,16]} /><meshStandardMaterial color={color} transparent opacity={0.7} emissive={color} emissiveIntensity={0.4} /></mesh>
      {[-0.15,0.15].map((x,i) => <mesh key={i} position={[x,0.1,0.45]}><sphereGeometry args={[0.08,8,8]} /><meshStandardMaterial color="#1E1B4B" /></mesh>)}
      <mesh position={[0,-0.5,0]} rotation={[Math.PI,0,0]}><coneGeometry args={[0.5,0.6,8]} /><meshStandardMaterial color={color} transparent opacity={0.5} /></mesh>
    </group>
  );
}

function RockMonster({ color, defeated }: { color:string; defeated:boolean }) {
  if (defeated) return null;
  return (
    <group>
      <mesh position={[0,0.5,0]}><boxGeometry args={[0.8,1,0.6]} /><meshStandardMaterial color={color} roughness={0.9} metalness={0.1} /></mesh>
      <mesh position={[0,1.2,0]}><boxGeometry args={[0.6,0.6,0.5]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>
      {[-0.15,0.15].map((x,i) => <mesh key={i} position={[x,1.2,0.28]}><sphereGeometry args={[0.08,8,8]} /><meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1} /></mesh>)}
      {[-0.7,0.7].map((x,i) => <mesh key={i} position={[x,0.5,0]}><boxGeometry args={[0.3,0.8,0.3]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>)}
    </group>
  );
}

function BossMonster({ hp, maxHp, defeated }: { hp:number; maxHp:number; defeated:boolean }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => { if (ref.current) { ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.3; ref.current.position.y = Math.sin(clock.elapsedTime) * 0.1; } });
  if (defeated) return null;
  const scale = 0.5 + (hp / maxHp) * 0.5;
  return (
    <group ref={ref} scale={scale}>
      <mesh position={[0,0.8,0]}><boxGeometry args={[1.2,1.6,0.8]} /><meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.2} roughness={0.3} metalness={0.5} /></mesh>
      <mesh position={[0,2.0,0.3]}><boxGeometry args={[1,0.8,1]} /><meshStandardMaterial color="#DC2626" roughness={0.3} metalness={0.5} /></mesh>
      {[-0.25,0.25].map((x,i) => <mesh key={i} position={[x,2.1,0.85]}><sphereGeometry args={[0.12,8,8]} /><meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={2} /></mesh>)}
      {[-1,1].map((side,i) => <mesh key={i} position={[side*1.2,1.2,-0.2]} rotation={[0,0,side*Math.PI/6]}><boxGeometry args={[1.2,0.1,1.2]} /><meshStandardMaterial color="#991B1B" transparent opacity={0.8} /></mesh>)}
      <mesh position={[0,0.2,-0.9]} rotation={[Math.PI/4,0,0]}><coneGeometry args={[0.3,1.5,6]} /><meshStandardMaterial color="#B91C1C" /></mesh>
    </group>
  );
}

// ─── Island Scene ────────────────────────────────────────────────────────────────

function XbotOnIsland() {
  const { scene, animations } = useGLTF('/models/Xbot.glb');
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Group;
    c.traverse(child => { if ((child as THREE.Mesh).isMesh) { const mats = Array.isArray((child as THREE.Mesh).material) ? (child as THREE.Mesh).material as THREE.Material[] : [(child as THREE.Mesh).material as THREE.Material]; mats.forEach(m => { const sm = m as THREE.MeshStandardMaterial; if (sm.color) sm.color.set('#7C3AED'); sm.metalness=0.3; sm.roughness=0.5; sm.needsUpdate=true; }); } });
    return c;
  }, [scene]);
  const groupRef = useRef<THREE.Group>(cloned);
  const { actions } = useAnimations(animations, groupRef);
  useEffect(() => { actions['idle']?.reset().play(); }, [actions]);
  return <primitive ref={groupRef} object={cloned} scale={2.2} position={[0,-1.75,-3.5]} rotation={[0,0,0]} dispose={null} />;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function IslandScene({ onEnterDungeon: _onEnterDungeon }: { onEnterDungeon: () => void }) {
  return (
    <>
      <color attach="background" args={['#0C1445']} />
      <fog attach="fog" args={['#0C1445',25,50]} />
      <Stars radius={80} depth={40} count={600} factor={3} fade speed={0.2} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5,10,5]} intensity={1.2} color="#FFF9E6" />
      <pointLight position={[0,5,0]} intensity={0.6} color="#7C3AED" />
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.5,0]}><planeGeometry args={[60,60]} /><meshStandardMaterial color="#1E3A5F" roughness={0.1} metalness={0.3} /></mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.5,0]}><circleGeometry args={[8,64]} /><meshStandardMaterial color="#2D5A27" roughness={0.9} /></mesh>
      <mesh position={[0,-0.2,0]}><sphereGeometry args={[5,32,16,0,Math.PI*2,0,Math.PI/2.5]} /><meshStandardMaterial color="#3A7A33" roughness={0.9} /></mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.49,0]}><ringGeometry args={[6.5,8.5,64]} /><meshStandardMaterial color="#C8A96E" roughness={1} /></mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.45,-2]}><planeGeometry args={[1.5,8]} /><meshStandardMaterial color="#8B7355" roughness={1} /></mesh>
      {[[-3,0,2],[3,0,1],[-2,0,-1],[3,0,-3],[-4,0,-2]].map(([x,y,z],i) => (
        <group key={i} position={[x as number, (y as number)-0.5, z as number]}>
          <mesh position={[0,0.5,0]}><cylinderGeometry args={[0.12,0.2,1,8]} /><meshStandardMaterial color="#5D3A1A" roughness={1} /></mesh>
          <mesh position={[0,1.5,0]}><coneGeometry args={[0.7,1.4,8]} /><meshStandardMaterial color="#1B5E20" roughness={0.9} /></mesh>
        </group>
      ))}
      <group position={[0,0,-5.5]}>
        <mesh position={[-0.8,0.5,0]}><boxGeometry args={[0.4,3,0.4]} /><meshStandardMaterial color="#4A4A4A" roughness={0.9} /></mesh>
        <mesh position={[0.8,0.5,0]}><boxGeometry args={[0.4,3,0.4]} /><meshStandardMaterial color="#4A4A4A" roughness={0.9} /></mesh>
        <mesh position={[0,2.1,0]}><boxGeometry args={[2.2,0.5,0.4]} /><meshStandardMaterial color="#3A3A3A" roughness={0.9} /></mesh>
        <mesh position={[0,0.5,0]}><planeGeometry args={[1.4,2.6]} /><meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={0.8} transparent opacity={0.85} /></mesh>
        <pointLight position={[0,1,0.3]} intensity={2} color="#7C3AED" distance={4} />
        <mesh position={[0,3,0]}><boxGeometry args={[1.8,0.5,0.1]} /><meshStandardMaterial color="#5D3A1A" roughness={1} /></mesh>
      </group>
      <Suspense fallback={null}><XbotOnIsland /></Suspense>
      <OrbitControls target={[0,0,-2]} maxPolarAngle={Math.PI/2.3} minDistance={8} maxDistance={22} autoRotate autoRotateSpeed={0.4} enablePan={false} />
    </>
  );
}

// ─── Dungeon Scene ────────────────────────────────────────────────────────────────

function PlayerController({ playerPosRef, keysRef, monsters, defeated, onEncounter, encounterCooldownRef, onExit }: {
  playerPosRef: React.MutableRefObject<THREE.Vector3>; keysRef: React.MutableRefObject<Set<string>>;
  monsters: Monster[]; defeated: Set<string>; onEncounter: (m:Monster) => void;
  encounterCooldownRef: React.MutableRefObject<boolean>; onExit: () => void;
}) {
  const { scene, animations } = useGLTF('/models/Xbot.glb');
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Group;
    c.traverse(child => { if ((child as THREE.Mesh).isMesh) { const mats = Array.isArray((child as THREE.Mesh).material) ? (child as THREE.Mesh).material as THREE.Material[] : [(child as THREE.Mesh).material as THREE.Material]; mats.forEach(m => { const sm = m as THREE.MeshStandardMaterial; if (sm.color) sm.color.set('#7C3AED'); sm.metalness=0.3; sm.roughness=0.5; sm.needsUpdate=true; }); } });
    return c;
  }, [scene]);
  const groupRef = useRef<THREE.Group>(cloned);
  const { actions } = useAnimations(animations, groupRef);
  const isWalkingRef = useRef(false);
  useEffect(() => { actions['idle']?.reset().play(); }, [actions]);
  useFrame(({ camera }, delta) => {
    const speed = 5; let moved = false; const pos = playerPosRef.current;
    if (keysRef.current.has('ArrowUp')   || keysRef.current.has('w') || keysRef.current.has('W')) { pos.z = Math.max(pos.z - speed*delta, -22); moved=true; }
    if (keysRef.current.has('ArrowDown') || keysRef.current.has('s') || keysRef.current.has('S')) { pos.z = Math.min(pos.z + speed*delta,   3); moved=true; }
    if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a') || keysRef.current.has('A')) { pos.x = Math.max(pos.x - speed*delta*0.5, -1.5); moved=true; }
    if (keysRef.current.has('ArrowRight')|| keysRef.current.has('d') || keysRef.current.has('D')) { pos.x = Math.min(pos.x + speed*delta*0.5,  1.5); moved=true; }
    if (pos.z > 2.5) { onExit(); return; }
    if (moved !== isWalkingRef.current) {
      isWalkingRef.current = moved;
      Object.values(actions).forEach(a => a?.fadeOut(0.2));
      (moved ? actions['walk'] : actions['idle'])?.reset().fadeIn(0.2).play();
    }
    if (groupRef.current) { groupRef.current.position.set(pos.x, pos.y-1.75, pos.z); if (moved) groupRef.current.rotation.y = 0; }
    camera.position.lerp(new THREE.Vector3(pos.x, pos.y+3, pos.z+6), 0.1);
    camera.lookAt(pos.x, pos.y, pos.z-2);
    if (!encounterCooldownRef.current) {
      for (const m of monsters) {
        if (defeated.has(m.id)) continue;
        if (pos.distanceTo(new THREE.Vector3(...m.pos)) < 2) { encounterCooldownRef.current=true; onEncounter(m); return; }
      }
    }
  });
  return <primitive ref={groupRef} object={cloned} scale={2.2} position={[0,-1.75,2]} dispose={null} />;
}

function DungeonScene({ monsters, defeated, onMonsterEncounter, onExit, encounterCooldown }: {
  monsters: Monster[]; defeated: Set<string>; onMonsterEncounter: (m:Monster) => void; onExit: () => void;
  encounterCooldown: React.MutableRefObject<boolean>;
}) {
  const playerPosRef = useRef(new THREE.Vector3(0,0,2));
  const keysRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const down = (e:KeyboardEvent) => { if (MOVE_KEYS.includes(e.key)) e.preventDefault(); keysRef.current.add(e.key); };
    const up   = (e:KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);
  return (
    <>
      <color attach="background" args={['#0A0A0A']} />
      <fog attach="fog" args={['#0A0A0A',10,28]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[0,3,2]}   intensity={1.2} color="#A78BFA" distance={8} />
      <pointLight position={[0,3,-8]}  intensity={0.8} color="#F59E0B" distance={8} />
      <pointLight position={[0,3,-14]} intensity={0.8} color="#EF4444" distance={8} />
      <pointLight position={[0,3,-20]} intensity={2}   color="#EF4444" distance={12} />
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1,-10]}><planeGeometry args={[5,28]} /><meshStandardMaterial color="#1C1C2E" roughness={1} /></mesh>
      <mesh rotation={[Math.PI/2,0,0]}  position={[0,3,-10]}><planeGeometry args={[5,28]}  /><meshStandardMaterial color="#111118" roughness={1} /></mesh>
      <mesh rotation={[0,Math.PI/2,0]}  position={[-2.5,1,-10]}><planeGeometry args={[28,4]} /><meshStandardMaterial color="#16162A" roughness={1} /></mesh>
      <mesh rotation={[0,-Math.PI/2,0]} position={[2.5,1,-10]}><planeGeometry args={[28,4]}  /><meshStandardMaterial color="#16162A" roughness={1} /></mesh>
      {[-8,-14,-20].map((z,i) => (
        <group key={i}>
          <pointLight position={[-2.2,1.8,z]} intensity={1.5} color="#F59E0B" distance={4} />
          <pointLight position={[2.2,1.8,z]}  intensity={1.5} color="#F59E0B" distance={4} />
          <mesh position={[-2.2,1.5,z]}><boxGeometry args={[0.1,0.4,0.1]} /><meshStandardMaterial color="#5D3A1A" /></mesh>
          <mesh position={[2.2,1.5,z]}><boxGeometry args={[0.1,0.4,0.1]} /><meshStandardMaterial color="#5D3A1A" /></mesh>
        </group>
      ))}
      {monsters.map(monster => (
        <group key={monster.id} position={monster.pos}>
          {monster.type==='slime' && <SlimeMonster color={monster.color} defeated={defeated.has(monster.id)} />}
          {monster.type==='ghost' && <GhostMonster color={monster.color} defeated={defeated.has(monster.id)} />}
          {monster.type==='rock'  && <RockMonster  color={monster.color} defeated={defeated.has(monster.id)} />}
          {monster.type==='boss'  && <BossMonster  hp={3} maxHp={3} defeated={defeated.has(monster.id)} />}
          {!defeated.has(monster.id) && <Text position={[0,2.5,0]} fontSize={0.3} color={monster.color} anchorX="center">{monster.name}</Text>}
        </group>
      ))}
      <PlayerController playerPosRef={playerPosRef} keysRef={keysRef} monsters={monsters} defeated={defeated} onEncounter={onMonsterEncounter} encounterCooldownRef={encounterCooldown} onExit={onExit} />
    </>
  );
}

// ─── Battle Screen (HTML overlay) ────────────────────────────────────────────────

function BattleScreen({ monster, monsterHp, playerHp, onAnswer }: {
  monster: Monster; monsterHp: number; playerHp: number; onAnswer: (correct:boolean) => void;
}) {
  const [answered, setAnswered] = useState<number|null>(null);
  const [shake, setShake] = useState(false);
  function handleAnswer(idx:number) {
    if (answered !== null) return;
    setAnswered(idx);
    const correct = idx === monster.question.correct;
    if (!correct) { setShake(true); setTimeout(() => setShake(false), 500); }
    setTimeout(() => { onAnswer(correct); setAnswered(null); }, 900);
  }
  const monsterVisual = (
    <div className="flex items-end justify-center h-40">
      {monster.type==='slime' && <motion.div animate={{ y:[0,-10,0] }} transition={{ repeat:Infinity, duration:0.8 }} className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl" style={{ background:monster.color, boxShadow:`0 0 30px ${monster.color}` }}><div className="flex gap-2"><div className="w-3 h-3 bg-white rounded-full" /><div className="w-3 h-3 bg-white rounded-full" /></div></motion.div>}
      {monster.type==='ghost' && <motion.div animate={{ y:[0,-8,0], opacity:[0.7,1,0.7] }} transition={{ repeat:Infinity, duration:1.2 }} className="w-20 h-24 rounded-t-full flex items-center justify-center" style={{ background:`${monster.color}CC`, boxShadow:`0 0 25px ${monster.color}` }}><div className="flex gap-2 mb-2"><div className="w-3 h-3 bg-slate-900 rounded-full" /><div className="w-3 h-3 bg-slate-900 rounded-full" /></div></motion.div>}
      {monster.type==='rock'  && <div className="w-20 h-24 rounded-md flex flex-col items-center justify-center gap-1" style={{ background:monster.color, boxShadow:`0 0 15px ${monster.color}66` }}><div className="w-16 h-8 rounded-sm" style={{ background:'#6B7280' }} /><div className="flex gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-red-500" /></div></div>}
      {monster.type==='boss'  && <motion.div animate={{ scale:[1,1.05,1], rotate:[-2,2,-2] }} transition={{ repeat:Infinity, duration:0.8 }} style={{ filter:`drop-shadow(0 0 20px #EF4444)` }} className="w-32 h-36 relative"><div className="w-28 h-28 rounded-lg mx-auto" style={{ background:'linear-gradient(135deg, #DC2626, #991B1B)', boxShadow:'0 0 30px #EF4444' }}><div className="flex justify-center gap-4 pt-4"><div className="w-5 h-5 rounded-full bg-yellow-300" style={{ boxShadow:'0 0 10px #FDE047' }} /><div className="w-5 h-5 rounded-full bg-yellow-300" style={{ boxShadow:'0 0 10px #FDE047' }} /></div></div></motion.div>}
    </div>
  );
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 z-50 flex flex-col" style={{ background:'linear-gradient(180deg, #0F0A30 0%, #1A0A3A 50%, #0F0A30 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length:30 }, (_,i) => (
          <motion.div key={i} className="absolute rounded-full bg-white" style={{ width:i%4===0?3:1.5, height:i%4===0?3:1.5, top:`${(i*37+13)%97}%`, left:`${(i*53+7)%97}%` }} animate={{ opacity:[0.2,0.8,0.2] }} transition={{ delay:i*0.15, duration:2+i%3, repeat:Infinity }} />
        ))}
      </div>
      <div className="text-center pt-6 pb-2 relative z-10">
        <motion.h1 initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:400 }} className="text-3xl font-black tracking-widest" style={{ color:monster.type==='boss'?'#EF4444':'#F59E0B', textShadow:'0 0 20px currentColor' }}>
          {monster.type==='boss'?'⚔️ BOSS BATTLE!':'⚔️ BATTLE!'}
        </motion.h1>
      </div>
      <div className="flex-1 flex items-center justify-around px-8 relative z-10">
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs text-white/50 font-bold">أحمد</div>
          <div className="flex gap-1.5">{Array.from({ length:3 }, (_,i) => <motion.div key={i} animate={i>=playerHp?{ scale:[1,1.3,1] }:{}} className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${i<playerHp?'bg-red-500 shadow-[0_0_10px_#EF4444]':'bg-slate-700'}`}>{i<playerHp?'❤':'🖤'}</motion.div>)}</div>
          <div className="w-20 h-28 rounded-xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-4xl">🤖</div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl font-black text-white/20">VS</div>
          {answered !== null && <motion.div initial={{ scale:0 }} animate={{ scale:1 }} className={`text-lg font-black ${answered===monster.question.correct?'text-emerald-400':'text-red-400'}`}>{answered===monster.question.correct?'💥 Hit!':'💔 Miss!'}</motion.div>}
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs font-bold" style={{ color:monster.color }}>{monster.name}</div>
          {monster.type==='boss'
            ? <div className="flex gap-1.5">{Array.from({ length:monster.maxHp }, (_,i) => <div key={i} className={`w-5 h-5 rounded-full ${i<monsterHp?'bg-red-500':'bg-slate-700'}`} />)}</div>
            : <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden"><motion.div animate={{ width:monsterHp>0?'100%':'0%' }} className="h-full bg-red-500 rounded-full" transition={{ duration:0.5 }} /></div>
          }
          <motion.div animate={shake?{ x:[-6,6,-6,6,0] }:{}} transition={{ duration:0.4 }}>{monsterVisual}</motion.div>
        </div>
      </div>
      <motion.div initial={{ y:100 }} animate={{ y:0 }} transition={{ delay:0.3, type:'spring' }} className="mx-4 mb-4 rounded-2xl border border-white/10 overflow-hidden relative z-10" style={{ background:'rgba(15,10,48,0.95)', backdropFilter:'blur(16px)' }}>
        <div className="px-5 py-4">
          <p className="text-white font-bold text-base text-center leading-relaxed mb-4 whitespace-pre-line">{monster.question.text}</p>
          <div className="grid grid-cols-1 gap-2">
            {monster.question.options.map((opt,i) => {
              let cls = 'bg-white/5 border-white/15 text-white/90 hover:bg-white/10';
              if (answered !== null) { if (i===monster.question.correct) cls='bg-emerald-600/30 border-emerald-500 text-emerald-300'; else if (i===answered) cls='bg-red-600/30 border-red-500 text-red-300'; else cls='bg-white/5 border-white/10 text-white/30'; }
              return <button key={i} onClick={() => handleAnswer(i)} disabled={answered!==null} className={`px-4 py-3 rounded-xl border text-sm font-semibold text-right transition-all ${cls}`}>{opt}</button>;
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Export ────────────────────────────────────────────────────────────────

export default function AdventureClient({ locale }: { locale: string }) {
  const isRtl = locale === 'ar';
  const [stage, setStage]             = useState<GameStage>('island');
  const [defeated, setDefeated]       = useState<Set<string>>(new Set());
  const [playerHp, setPlayerHp]       = useState(3);
  const [currentMonster, setMonster]  = useState<Monster|null>(null);
  const [monsterHp, setMonsterHp]     = useState(1);
  const encounterCooldown             = useRef(false);
  const [showVictory, setVictory]     = useState(false);

  // suppress unused type import warning
  void (null as unknown as RobotMood);

  function handleEncounter(m:Monster) { setMonster(m); setMonsterHp(m.maxHp); setStage('battle'); }

  function handleBattleAnswer(correct:boolean) {
    if (!currentMonster) return;
    if (correct) {
      const newHp = monsterHp - 1;
      if (newHp <= 0) {
        const newDefeated = new Set(defeated).add(currentMonster.id);
        setDefeated(newDefeated); setStage('dungeon'); setMonster(null);
        setTimeout(() => { encounterCooldown.current = false; }, 1500);
        if (newDefeated.size === MONSTERS.length) setVictory(true);
      } else { setMonsterHp(newHp); }
    } else {
      const newHp = Math.max(0, playerHp-1);
      setPlayerHp(newHp);
      if (newHp <= 0) {
        setTimeout(() => { setPlayerHp(3); setDefeated(new Set()); setMonster(null); setStage('dungeon'); encounterCooldown.current=false; }, 1500);
      }
    }
  }

  return (
    <div style={{ position:'fixed', inset:0 }} dir={isRtl?'rtl':'ltr'}>
      <Canvas camera={{ position:[0,8,14], fov:50 }} style={{ width:'100%', height:'100%' }} gl={{ antialias:true }}>
        <Suspense fallback={null}>
          {(stage==='island' || stage==='battle') && <IslandScene onEnterDungeon={() => setStage('dungeon')} />}
          {stage==='dungeon' && <DungeonScene monsters={MONSTERS} defeated={defeated} onMonsterEncounter={handleEncounter} onExit={() => setStage('island')} encounterCooldown={encounterCooldown} />}
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div style={{ position:'fixed', top:16, right:16, zIndex:20 }} className="bg-black/50 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/10 flex items-center gap-3">
        <span className="text-white font-bold text-sm">أحمد</span>
        <div className="flex gap-1">{Array.from({ length:3 }, (_,i) => <span key={i} className={`text-base ${i<playerHp?'text-red-500':'text-slate-600'}`}>{i<playerHp?'❤':'♡'}</span>)}</div>
        <span className="text-xs text-white/40">{defeated.size}/4 وحوش</span>
      </div>

      {/* Island enter button */}
      {stage==='island' && (
        <motion.div initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} style={{ position:'fixed', bottom:32, left:'50%', transform:'translateX(-50%)', zIndex:20 }} className="flex flex-col items-center gap-3">
          <div className="bg-black/60 backdrop-blur-md px-5 py-2 rounded-xl border border-white/10 text-center"><p className="text-white/60 text-sm">جزيرة الحلقات — اضغط للدخول</p></div>
          <button onClick={() => setStage('dungeon')} className="px-8 py-4 rounded-xl text-white font-black text-lg transition-all hover:scale-105 active:scale-95" style={{ background:'linear-gradient(135deg, #7C3AED, #4F46E5)', boxShadow:'0 0 30px #7C3AED88' }}>ادخل المغارة</button>
        </motion.div>
      )}

      {/* Dungeon hint */}
      {stage==='dungeon' && (
        <div style={{ position:'fixed', bottom:16, left:'50%', transform:'translateX(-50%)', zIndex:20 }} className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
          <p className="text-white/50 text-xs">WASD / ↑↓←→ للتحرك • اقترب من الوحوش للمعركة • ارجع للخلف للخروج</p>
        </div>
      )}

      {/* Battle screen */}
      <AnimatePresence>
        {stage==='battle' && currentMonster && (
          <BattleScreen key={currentMonster.id} monster={currentMonster} monsterHp={monsterHp} playerHp={playerHp} onAnswer={handleBattleAnswer} />
        )}
      </AnimatePresence>

      {/* Victory overlay */}
      <AnimatePresence>
        {showVictory && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale:0, rotate:-10 }} animate={{ scale:1, rotate:0 }} transition={{ type:'spring', stiffness:200 }} className="bg-slate-900/95 rounded-3xl p-10 border border-amber-500/30 text-center max-w-sm mx-4" style={{ boxShadow:'0 0 60px #F59E0B44' }}>
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-black text-amber-400 mb-2">أحسنت يا بطل!</h2>
              <p className="text-white/70 mb-6">هزمت كل الوحوش وأنقذت الجزيرة!</p>
              <button onClick={() => { setVictory(false); setStage('island'); setDefeated(new Set()); setPlayerHp(3); }} className="px-6 py-3 rounded-xl bg-amber-500 text-white font-bold text-base hover:bg-amber-400 transition-colors">العب مرة ثانية</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
