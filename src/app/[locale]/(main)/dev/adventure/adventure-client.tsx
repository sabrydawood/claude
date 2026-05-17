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
  useEffect(() => {
    const idle = actions['idle'];
    if (idle) idle.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(0.1).play();
  }, [actions]);
  // scale=1.5 → feet at ~Y=-1.2, positioned in front of portal facing it (rotation π = faces camera)
  return <primitive ref={groupRef} object={cloned} scale={1.5} position={[0, -1.2, -2.5]} rotation={[0, Math.PI, 0]} dispose={null} />;
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
        <mesh position={[-0.9,0.5,0]}><boxGeometry args={[0.5,4,0.5]} /><meshStandardMaterial color="#4A4A4A" roughness={0.9} /></mesh>
        <mesh position={[0.9,0.5,0]}><boxGeometry args={[0.5,4,0.5]} /><meshStandardMaterial color="#4A4A4A" roughness={0.9} /></mesh>
        <mesh position={[0,2.5,0]}><boxGeometry args={[2.6,0.6,0.5]} /><meshStandardMaterial color="#3A3A3A" roughness={0.9} /></mesh>
        <mesh position={[0,0.7,0]}><planeGeometry args={[1.8,3.4]} /><meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={1.5} transparent opacity={0.85} /></mesh>
        <pointLight position={[0,1,0.3]} intensity={4} color="#7C3AED" distance={6} />
        <mesh position={[0,3.4,0]}><boxGeometry args={[2.2,0.6,0.15]} /><meshStandardMaterial color="#5D3A1A" roughness={1} /></mesh>
      </group>
      <pointLight position={[0,2,-4.5]} intensity={3} color="#7C3AED" distance={6} />
      <Suspense fallback={null}><XbotOnIsland /></Suspense>
      <OrbitControls target={[0,1,-4]} maxPolarAngle={Math.PI/2.1} minDistance={5} maxDistance={18} autoRotate autoRotateSpeed={0.3} enablePan={false} />
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
    if (groupRef.current) {
      groupRef.current.position.set(pos.x, pos.y-1.75, pos.z);
      // Face forward into dungeon (toward -Z). Xbot.glb default faces +Z, so Math.PI to flip.
      const movingBack = keysRef.current.has('ArrowDown') || keysRef.current.has('s') || keysRef.current.has('S');
      groupRef.current.rotation.y = movingBack ? 0 : Math.PI;
    }
    camera.position.lerp(new THREE.Vector3(pos.x, pos.y+3, pos.z+6), 0.1);
    camera.lookAt(pos.x, pos.y, pos.z-2);
    if (!encounterCooldownRef.current) {
      for (const m of monsters) {
        if (defeated.has(m.id)) continue;
        if (pos.distanceTo(new THREE.Vector3(...m.pos)) < 2) { encounterCooldownRef.current=true; onEncounter(m); return; }
      }
    }
  });
  return <primitive ref={groupRef} object={cloned} scale={1.3} position={[0,-1.3,2]} rotation={[0,Math.PI,0]} dispose={null} />;
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
      <color attach="background" args={['#0F0C22']} />
      <fog attach="fog" args={['#0F0C22', 20, 40]} />
      <ambientLight intensity={0.7} color="#B8C4FF" />
      <directionalLight position={[0, 5, 0]} intensity={0.4} color="#C4B5FD" />
      <pointLight position={[0, 2.5, 2]}   intensity={1.0} color="#A78BFA" distance={12} />
      <pointLight position={[0, 2.5, -4]}  intensity={0.8} color="#818CF8" distance={10} />
      <pointLight position={[0, 2.5, -8]}  intensity={0.8} color="#818CF8" distance={10} />
      <pointLight position={[0, 2.5, -12]} intensity={0.8} color="#C084FC" distance={10} />
      <pointLight position={[0, 2.5, -16]} intensity={0.8} color="#C084FC" distance={10} />
      <pointLight position={[0, 2.5, -20]} intensity={2.0} color="#EF4444" distance={16} />
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1,-10]}><planeGeometry args={[5,28]} /><meshStandardMaterial color="#1E1A38" roughness={1} /></mesh>
      <mesh rotation={[Math.PI/2,0,0]}  position={[0,3,-10]}><planeGeometry args={[5,28]}  /><meshStandardMaterial color="#18152E" roughness={1} /></mesh>
      <mesh rotation={[0,Math.PI/2,0]}  position={[-2.5,1,-10]}><planeGeometry args={[28,4]} /><meshStandardMaterial color="#1C1940" roughness={1} /></mesh>
      <mesh rotation={[0,-Math.PI/2,0]} position={[2.5,1,-10]}><planeGeometry args={[28,4]}  /><meshStandardMaterial color="#1C1940" roughness={1} /></mesh>
      {[-8,-14,-20].map((z,i) => (
        <group key={i}>
          <pointLight position={[-2.2,1.8,z]} intensity={1.2} color="#F59E0B" distance={6} />
          <pointLight position={[2.2,1.8,z]}  intensity={1.2} color="#F59E0B" distance={6} />
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

// ─── Camera Controller ────────────────────────────────────────────────────────────

function CameraController({ stage }: { stage: GameStage }) {
  const target = stage === 'battle'
    ? new THREE.Vector3(0, 3.5, 8)
    : new THREE.Vector3(0, 5, 10);
  useFrame(({ camera }) => {
    camera.position.lerp(target, 0.05);
    if (stage === 'battle') camera.lookAt(0, 0.5, 0);
  });
  return null;
}

// ─── Battle Arena ─────────────────────────────────────────────────────────────────

const HIT_DIRS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const elevation = (i % 3) * 0.4 + 0.3;
  return new THREE.Vector3(Math.cos(angle) * 2.5, elevation * 2, Math.sin(angle) * 2.5);
});

function HitParticles({ active, color, position }: { active: boolean; color: string; position: [number,number,number] }) {
  const groupRef  = useRef<THREE.Group>(null!);
  const lightRef  = useRef<THREE.PointLight>(null!);
  const ringRef   = useRef<THREE.Mesh>(null!);
  const meshRefs  = useRef<THREE.Mesh[]>([]);
  const elapsed   = useRef(0);
  const wasActive = useRef(false);
  useFrame((_, delta) => {
    if (!active && !wasActive.current) return;
    if (active && !wasActive.current) { wasActive.current = true; elapsed.current = 0; meshRefs.current.forEach(m => { if (m) { m.visible = true; m.scale.setScalar(1); } }); }
    elapsed.current += delta;
    const progress = Math.min(elapsed.current / 0.55, 1);
    meshRefs.current.forEach((mesh, i) => { if (!mesh) return; const dir = HIT_DIRS[i]; mesh.position.set(dir.x*progress, dir.y*progress - 4*progress*progress, dir.z*progress); const s = Math.max(0, 1 - progress*1.5); mesh.scale.setScalar(s); mesh.visible = s > 0; });
    if (ringRef.current) { const mat = ringRef.current.material as THREE.MeshBasicMaterial; ringRef.current.scale.setScalar(1 + progress * 4); mat.opacity = Math.max(0, 0.9 - progress * 2); ringRef.current.visible = mat.opacity > 0; }
    if (lightRef.current) lightRef.current.intensity = Math.max(0, (1 - progress * 3) * 10);
    if (!active) wasActive.current = false;
  });
  return (
    <group ref={groupRef} position={position}>
      <pointLight ref={lightRef} color={color} intensity={0} distance={6} />
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.2, 0.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0} />
      </mesh>
      {HIT_DIRS.map((_, i) => (
        <mesh key={i} ref={el => { if (el) meshRefs.current[i] = el; }} visible={false}>
          <sphereGeometry args={[0.09, 6, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
        </mesh>
      ))}
    </group>
  );
}

function BattleArenaXbot({ attacking }: { attacking: boolean }) {
  const { scene, animations } = useGLTF('/models/Xbot.glb');
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Group;
    c.traverse(child => { if ((child as THREE.Mesh).isMesh) { const mats = Array.isArray((child as THREE.Mesh).material) ? (child as THREE.Mesh).material as THREE.Material[] : [(child as THREE.Mesh).material as THREE.Material]; mats.forEach(m => { const sm = m as THREE.MeshStandardMaterial; if (sm.color) sm.color.set('#7C3AED'); sm.metalness=0.4; sm.roughness=0.4; sm.needsUpdate=true; }); } });
    return c;
  }, [scene]);
  const groupRef = useRef<THREE.Group>(cloned);
  const { actions } = useAnimations(animations, groupRef);
  const prevAttacking = useRef(false);
  useEffect(() => { actions['idle']?.reset().play(); }, [actions]);
  useEffect(() => {
    if (attacking && !prevAttacking.current) {
      Object.values(actions).forEach(a => a?.fadeOut(0.08));
      const atk = actions['agree'] ?? actions['walk'];
      if (atk) atk.reset().setEffectiveTimeScale(2.5).setEffectiveWeight(1).fadeIn(0.08).play();
    } else if (!attacking && prevAttacking.current) {
      Object.values(actions).forEach(a => a?.fadeOut(0.2));
      actions['idle']?.reset().setEffectiveTimeScale(1).fadeIn(0.2).play();
    }
    prevAttacking.current = attacking;
  }, [attacking, actions]);
  useFrame(() => {
    if (!groupRef.current) return;
    const targetX = attacking ? -0.5 : -2.2;
    groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.2;
  });
  return <primitive ref={groupRef} object={cloned} scale={1.3} position={[-2.2,-1.3,0]} rotation={[0,Math.PI/2,0]} dispose={null} />;
}

function BattleArenaScene({ monster, monsterHp, xbotAttacking, monsterAttacking }: {
  monster: Monster; monsterHp: number; xbotAttacking: boolean; monsterAttacking: boolean;
}) {
  const monsterGroupRef = useRef<THREE.Group>(null!);
  const shakeRef = useRef(0);
  useFrame((_, delta) => {
    if (!monsterGroupRef.current) return;
    monsterGroupRef.current.position.x += ((monsterAttacking ? 0 : 2.5) - monsterGroupRef.current.position.x) * 0.18;
    if (xbotAttacking) shakeRef.current += delta; else shakeRef.current = 0;
    if (shakeRef.current > 0 && shakeRef.current < 0.45) {
      const t = shakeRef.current / 0.45;
      monsterGroupRef.current.rotation.z = Math.sin(t * Math.PI * 8) * 0.25 * (1 - t);
    } else { monsterGroupRef.current.rotation.z = 0; }
  });
  const isBoss = monster.type === 'boss';
  return (
    <>
      <color attach="background" args={[isBoss ? '#1A0505' : '#0A0520']} />
      <fog attach="fog" args={[isBoss ? '#1A0505' : '#0A0520', 12, 30]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[0,8,4]} intensity={0.8} color="#C4B5FD" />
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.35,0]}><circleGeometry args={[5,64]} /><meshStandardMaterial color={isBoss?'#1C0A0A':'#0F0A30'} roughness={0.8} /></mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.33,0]}><ringGeometry args={[4.7,5.0,64]} /><meshStandardMaterial color={isBoss?'#EF4444':'#7C3AED'} emissive={isBoss?'#EF4444':'#7C3AED'} emissiveIntensity={0.8} /></mesh>
      <pointLight position={[-3,3,0]} intensity={2} color="#7C3AED" distance={8} />
      <pointLight position={[3,3,0]} intensity={2} color={monster.color} distance={8} />
      <pointLight position={[0,5,0]} intensity={1} color={isBoss?'#EF4444':'#C4B5FD'} distance={14} />
      <Stars radius={40} depth={20} count={400} factor={2} fade speed={0.3} />
      <mesh position={[-4,0,0]}><cylinderGeometry args={[0.1,0.1,3,8]} /><meshStandardMaterial color="#2D1B69" /></mesh>
      <pointLight position={[-4,2,0]} intensity={1} color="#7C3AED" distance={4} />
      <mesh position={[4,0,0]}><cylinderGeometry args={[0.1,0.1,3,8]} /><meshStandardMaterial color={isBoss?'#7F1D1D':'#374151'} /></mesh>
      <pointLight position={[4,2,0]} intensity={1} color={monster.color} distance={4} />
      <Suspense fallback={null}><BattleArenaXbot attacking={xbotAttacking} /></Suspense>
      <group ref={monsterGroupRef} position={[2.5,0,0]} rotation={[0,-Math.PI/2,0]}>
        {monster.type==='slime' && <SlimeMonster color={monster.color} defeated={false} />}
        {monster.type==='ghost' && <GhostMonster color={monster.color} defeated={false} />}
        {monster.type==='rock'  && <RockMonster  color={monster.color} defeated={false} />}
        {monster.type==='boss'  && <BossMonster  hp={monsterHp} maxHp={monster.maxHp} defeated={false} />}
      </group>
      <HitParticles active={xbotAttacking} color={monster.color} position={[2.2,0.5,0]} />
      <HitParticles active={monsterAttacking} color="#EF4444" position={[-2.2,0.5,0]} />
      <Text position={[0,0.5,0]} fontSize={0.5} color="rgba(255,255,255,0.15)" anchorX="center">VS</Text>
    </>
  );
}

// ─── Battle Screen (HTML overlay) ────────────────────────────────────────────────

function BattleScreen({ monster, monsterHp, playerHp, onAnswer }: {
  monster: Monster; monsterHp: number; playerHp: number; onAnswer: (correct: boolean) => void;
}) {
  const [answered, setAnswered] = useState<number | null>(null);

  function handleAnswer(idx: number) {
    if (answered !== null) return;
    setAnswered(idx);
    const correct = idx === monster.question.correct;
    setTimeout(() => { onAnswer(correct); setAnswered(null); }, 800);
  }

  const isBoss = monster.type === 'boss';

  return (
    <>
      {/* Top HUD bar for battle */}
      <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, background:'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        {/* Player HP */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-white/50 font-bold">أحمد</span>
          <div className="flex gap-1.5">
            {Array.from({ length: 3 }, (_, i) => (
              <motion.div key={i}
                animate={i === playerHp ? { scale: [1.5, 1] } : {}}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                style={{ background: i < playerHp ? '#EF4444' : '#1F2937', boxShadow: i < playerHp ? '0 0 8px #EF4444' : 'none' }}>
                {i < playerHp ? '♥' : '♡'}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Battle title */}
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="text-center">
          <p className={`font-black text-xl tracking-widest ${isBoss ? 'text-red-500' : 'text-amber-400'}`}
            style={{ textShadow: `0 0 20px ${isBoss ? '#EF4444' : '#F59E0B'}` }}>
            {isBoss ? 'BOSS BATTLE' : 'BATTLE'}
          </p>
          <p className="text-xs text-white/40">{monster.name}</p>
        </motion.div>

        {/* Monster HP */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-bold" style={{ color: monster.color }}>{monster.name}</span>
          {monster.type === 'boss' ? (
            <div className="flex gap-1">
              {Array.from({ length: monster.maxHp }, (_, i) => (
                <motion.div key={i}
                  animate={i === monsterHp ? { scale: [1.5, 1] } : {}}
                  className="w-5 h-5 rounded-full"
                  style={{ background: i < monsterHp ? '#EF4444' : '#1F2937', boxShadow: i < monsterHp ? '0 0 6px #EF4444' : 'none' }} />
              ))}
            </div>
          ) : (
            <div className="w-24 h-3 bg-slate-800 rounded-full overflow-hidden border border-white/10">
              <motion.div
                animate={{ width: `${(monsterHp / monster.maxHp) * 100}%` }}
                transition={{ duration: 0.4 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${monster.color}, ${monster.color}88)` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Question panel - bottom */}
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:50, background:'linear-gradient(to top, rgba(5,3,20,0.97) 65%, transparent)', padding:'16px 16px 28px' }}>
        {/* Question text */}
        <div className="max-w-lg mx-auto">
          <div className="mb-4 px-4 py-3 rounded-2xl text-center"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <p className="text-white font-bold text-base leading-relaxed whitespace-pre-line">
              {monster.question.text}
            </p>
          </div>
          {/* Options */}
          <div className="grid grid-cols-1 gap-2">
            {monster.question.options.map((opt, i) => {
              let bg = 'rgba(255,255,255,0.06)';
              let border = 'rgba(255,255,255,0.12)';
              let color = 'rgba(255,255,255,0.9)';
              if (answered !== null) {
                if (i === monster.question.correct) { bg = 'rgba(16,185,129,0.2)'; border = '#10B981'; color = '#6EE7B7'; }
                else if (i === answered) { bg = 'rgba(239,68,68,0.2)'; border = '#EF4444'; color = '#FCA5A5'; }
                else { color = 'rgba(255,255,255,0.2)'; }
              }
              return (
                <motion.button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={answered !== null}
                  whileHover={answered === null ? { scale: 1.02, x: -4 } : {}}
                  whileTap={answered === null ? { scale: 0.98 } : {}}
                  className="px-5 py-3 rounded-xl text-sm font-bold text-right transition-colors"
                  style={{ background: bg, border: `1px solid ${border}`, color }}>
                  {opt}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
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
  const [xbotAttacking, setXbotAttacking]     = useState(false);
  const [monsterAttacking, setMonsterAttacking] = useState(false);

  // suppress unused type import warning
  void (null as unknown as RobotMood);

  function handleEncounter(m:Monster) { setMonster(m); setMonsterHp(m.maxHp); setStage('battle'); }

  function handleBattleAnswer(correct: boolean) {
    if (!currentMonster) return;
    if (correct) {
      setXbotAttacking(true);
      setTimeout(() => setXbotAttacking(false), 700);
      setTimeout(() => {
        const newHp = monsterHp - 1;
        if (newHp <= 0) {
          const newDefeated = new Set(defeated).add(currentMonster.id);
          setDefeated(newDefeated); setStage('dungeon'); setMonster(null);
          setTimeout(() => { encounterCooldown.current = false; }, 1500);
          if (newDefeated.size === MONSTERS.length) setVictory(true);
        } else { setMonsterHp(newHp); }
      }, 500);
    } else {
      setMonsterAttacking(true);
      setTimeout(() => setMonsterAttacking(false), 700);
      setTimeout(() => {
        const newHp = Math.max(0, playerHp - 1);
        setPlayerHp(newHp);
        if (newHp <= 0) {
          setTimeout(() => { setPlayerHp(3); setDefeated(new Set()); setMonster(null); setStage('dungeon'); encounterCooldown.current = false; }, 1500);
        }
      }, 500);
    }
  }

  return (
    <div style={{ position:'fixed', inset:0 }} dir={isRtl?'rtl':'ltr'}>
      <Canvas camera={{ position:[0,5,10], fov:55 }} style={{ width:'100%', height:'100%' }} gl={{ antialias:true }}>
        <Suspense fallback={null}>
          {stage==='island' && <IslandScene onEnterDungeon={() => setStage('dungeon')} />}
          {stage==='battle' && currentMonster && (
            <BattleArenaScene
              monster={currentMonster}
              monsterHp={monsterHp}
              xbotAttacking={xbotAttacking}
              monsterAttacking={monsterAttacking}
            />
          )}
          {stage==='dungeon' && <DungeonScene monsters={MONSTERS} defeated={defeated} onMonsterEncounter={handleEncounter} onExit={() => setStage('island')} encounterCooldown={encounterCooldown} />}
          {stage !== 'dungeon' && <CameraController stage={stage} />}
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

      {/* Battle UI overlays (3D scene is in Canvas) */}
      {stage === 'battle' && currentMonster && (
        <BattleScreen
          key={currentMonster.id}
          monster={currentMonster}
          monsterHp={monsterHp}
          playerHp={playerHp}
          onAnswer={handleBattleAnswer}
        />
      )}

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
