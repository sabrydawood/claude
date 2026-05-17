'use client';
import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Text, useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import type { RefObject } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Question { text: string; options: string[]; correct: number; }
export interface Monster  { id: string; type: 'slime'|'ghost'|'rock'|'boss'; name: string; color: string; maxHp: number; pos: [number,number,number]; question: Question; }
export interface DungeonDef { id: string; name: string; color: string; topic: string; gatePos: [number,number]; monsters: Monster[]; }
export type GameStage = 'island' | 'dungeon' | 'battle';

// ── Monster Components ────────────────────────────────────────────────────────

export function SlimeMonster({ color, defeated }: { color:string; defeated:boolean }) {
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

export function GhostMonster({ color, defeated }: { color:string; defeated:boolean }) {
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

export function RockMonster({ color, defeated }: { color:string; defeated:boolean }) {
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

export function BossMonster({ hp, maxHp, defeated }: { hp:number; maxHp:number; defeated:boolean }) {
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

// ── HitParticles ──────────────────────────────────────────────────────────────

export const HIT_DIRS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const elevation = (i % 3) * 0.4 + 0.3;
  return new THREE.Vector3(Math.cos(angle) * 2.5, elevation * 2, Math.sin(angle) * 2.5);
});

export function HitParticles({ active, color, position }: { active: boolean; color: string; position: [number,number,number] }) {
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

// ── Shared helper ─────────────────────────────────────────────────────────────

function applyPurpleTint(scene: THREE.Group) {
  scene.traverse(child => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mats = Array.isArray((child as THREE.Mesh).material)
      ? (child as THREE.Mesh).material as THREE.Material[]
      : [(child as THREE.Mesh).material as THREE.Material];
    mats.forEach(m => {
      const sm = m as THREE.MeshStandardMaterial;
      if (sm.color) sm.color.set('#7C3AED');
      sm.metalness = 0.4; sm.roughness = 0.4; sm.needsUpdate = true;
    });
  });
}

// ── IslandGate ────────────────────────────────────────────────────────────────

export function IslandGate({
  dungeon, unlocked, completed, isNear,
}: {
  dungeon: DungeonDef;
  unlocked: boolean;
  completed: boolean;
  isNear: boolean;
}) {
  const pulseRef = useRef<THREE.PointLight>(null!);
  const lockRef  = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (pulseRef.current && unlocked && !completed) {
      pulseRef.current.intensity = 2 + Math.sin(clock.elapsedTime * 2) * 1;
    }
    if (lockRef.current) {
      lockRef.current.rotation.y = clock.elapsedTime * 0.5;
    }
  });

  const color    = completed ? '#10B981' : unlocked ? dungeon.color : '#4B5563';
  const emissive = completed ? '#10B981' : unlocked ? dungeon.color : '#374151';

  return (
    <group>
      {/* Left pillar */}
      <mesh position={[-0.6, 1.5, 0]}>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Right pillar */}
      <mesh position={[0.6, 1.5, 0]}>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Arch */}
      <mesh position={[0, 3.1, 0]}>
        <boxGeometry args={[1.6, 0.4, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Portal fill */}
      <mesh position={[0, 1.5, 0]}>
        <planeGeometry args={[1.1, 2.8]} />
        <meshStandardMaterial
          color={emissive} emissive={emissive}
          emissiveIntensity={unlocked ? 1.2 : 0.1}
          transparent opacity={unlocked ? 0.85 : 0.2}
        />
      </mesh>
      {/* Glow light */}
      {unlocked && !completed && (
        <pointLight ref={pulseRef} color={dungeon.color} intensity={2} distance={5} />
      )}
      {/* Completed glow */}
      {completed && (
        <pointLight color="#10B981" intensity={3} distance={5} />
      )}
      {/* Lock visual — only if locked */}
      {!unlocked && (
        <group ref={lockRef} position={[0, 4, 0]}>
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.4, 0.35, 0.15]} />
            <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <torusGeometry args={[0.14, 0.04, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#EF4444" />
          </mesh>
          <pointLight color="#EF4444" intensity={1.5} distance={3} />
        </group>
      )}
      {/* Dungeon name */}
      <Text position={[0, 3.8, 0]} fontSize={0.28} color={unlocked ? 'white' : '#6B7280'} anchorX="center">
        {dungeon.name}
      </Text>
      {/* Proximity hints */}
      {isNear && unlocked && !completed && (
        <Text position={[0, -0.3, 0]} fontSize={0.22} color="#FDE047" anchorX="center">
          اقترب للدخول
        </Text>
      )}
      {isNear && !unlocked && (
        <Text position={[0, -0.3, 0]} fontSize={0.2} color="#EF4444" anchorX="center">
          أكمل الدنجن السابق أولاً
        </Text>
      )}
      {isNear && completed && (
        <Text position={[0, -0.3, 0]} fontSize={0.2} color="#10B981" anchorX="center">
          ✓ مكتمل
        </Text>
      )}
    </group>
  );
}

// ── IslandPlayerController ────────────────────────────────────────────────────

export function IslandPlayerController({
  playerPosRef, keysRef, islandRadius, dungeons, completedIds,
  onEnterDungeon, onNearGateChange, returnCooldownRef,
}: {
  playerPosRef: RefObject<THREE.Vector3>;
  keysRef: RefObject<Set<string>>;
  islandRadius: number;
  dungeons: DungeonDef[];
  completedIds: Set<string>;
  onEnterDungeon: (dungeon: DungeonDef) => void;
  onNearGateChange: (id: string | null) => void;
  returnCooldownRef: React.MutableRefObject<boolean>;
}) {
  const { scene, animations } = useGLTF('/models/Xbot.glb');
  const cloned = useMemo(() => { const c = SkeletonUtils.clone(scene) as THREE.Group; applyPurpleTint(c); return c; }, [scene]);
  const groupRef = useRef<THREE.Group>(cloned);
  const { actions } = useAnimations(animations, groupRef);
  const isWalking = useRef(false);
  const enterCooldown = useRef(false);
  const lastNearId = useRef<string | null>(null);
  const cameraAngle = useRef(0);
  const isDragging = useRef(false);
  const lastMouseX = useRef(0);

  useEffect(() => { actions['idle']?.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(0.1).play(); }, [actions]);

  // Right-click drag = orbit camera
  useEffect(() => {
    const onDown  = (e: MouseEvent) => { if (e.button === 2) { isDragging.current = true; lastMouseX.current = e.clientX; } };
    const onMove  = (e: MouseEvent) => { if (isDragging.current) { cameraAngle.current -= (e.clientX - lastMouseX.current) * 0.008; lastMouseX.current = e.clientX; } };
    const onUp    = (e: MouseEvent) => { if (e.button === 2) isDragging.current = false; };
    const onCtx   = (e: Event) => e.preventDefault();
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('contextmenu', onCtx);
    return () => { window.removeEventListener('mousedown', onDown); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); window.removeEventListener('contextmenu', onCtx); };
  }, []);

  useFrame(({ camera }, delta) => {
    const speed = 5;
    const pos = playerPosRef.current!;
    let moved = false;
    const keys = keysRef.current!;

    // Camera-relative movement directions
    const fwdX = -Math.sin(cameraAngle.current);
    const fwdZ = -Math.cos(cameraAngle.current);
    const rgtX =  Math.cos(cameraAngle.current);
    const rgtZ = -Math.sin(cameraAngle.current);

    let moveX = 0, moveZ = 0;
    if (keys.has('ArrowUp')    || keys.has('w') || keys.has('W')) { moveX += fwdX; moveZ += fwdZ; moved = true; }
    if (keys.has('ArrowDown')  || keys.has('s') || keys.has('S')) { moveX -= fwdX; moveZ -= fwdZ; moved = true; }
    if (keys.has('ArrowLeft')  || keys.has('a') || keys.has('A')) { moveX -= rgtX; moveZ -= rgtZ; moved = true; }
    if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) { moveX += rgtX; moveZ += rgtZ; moved = true; }

    if (moved) {
      const len = Math.sqrt(moveX * moveX + moveZ * moveZ) || 1;
      pos.x += (moveX / len) * speed * delta;
      pos.z += (moveZ / len) * speed * delta;
    }

    // Clamp to island
    const dist = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
    if (dist > islandRadius - 1.5) {
      const angle = Math.atan2(pos.z, pos.x);
      pos.x = Math.cos(angle) * (islandRadius - 1.5);
      pos.z = Math.sin(angle) * (islandRadius - 1.5);
    }

    // Walk/idle animation switch
    if (moved !== isWalking.current) {
      isWalking.current = moved;
      Object.values(actions).forEach(a => a?.fadeOut(0.2));
      (moved ? actions['walk'] : actions['idle'])?.reset().setEffectiveTimeScale(1).fadeIn(0.2).play();
    }

    // Face the direction of actual movement (camera-relative)
    if (moved && groupRef.current) {
      const len = Math.sqrt(moveX * moveX + moveZ * moveZ) || 1;
      groupRef.current.rotation.y = Math.atan2(moveX / len, moveZ / len);
    }

    // Update mesh position
    if (groupRef.current) groupRef.current.position.set(pos.x, pos.y - 0.5, pos.z);

    // Orbit camera — right-click rotates horizontally around player
    const camDist = 14, camHeight = 11;
    const cx = pos.x + Math.sin(cameraAngle.current) * camDist;
    const cz = pos.z + Math.cos(cameraAngle.current) * camDist;
    camera.position.lerp(new THREE.Vector3(cx, pos.y + camHeight, cz), 0.08);
    camera.lookAt(pos.x, pos.y, pos.z);

    // Gate proximity — only trigger entry if not in return cooldown
    let newNearId: string | null = null;
    for (const d of dungeons) {
      const gx = d.gatePos[0], gz = d.gatePos[1];
      const dd = Math.sqrt((pos.x - gx) ** 2 + (pos.z - gz) ** 2);
      if (dd < 2.5) {
        newNearId = d.id;
        const idx = dungeons.indexOf(d);
        const prevCompleted = idx === 0 || completedIds.has(dungeons[idx - 1].id);
        if (prevCompleted && !completedIds.has(d.id) && !enterCooldown.current && !returnCooldownRef.current) {
          enterCooldown.current = true;
          onEnterDungeon(d);
          setTimeout(() => { enterCooldown.current = false; }, 2000);
        }
        break;
      }
    }

    if (newNearId !== lastNearId.current) {
      lastNearId.current = newNearId;
      onNearGateChange(newNearId);
    }
  });

  return <primitive ref={groupRef} object={cloned} scale={1.5} position={[0, -0.5, 0]} dispose={null} />;
}

// ── IslandScene ───────────────────────────────────────────────────────────────

export function IslandScene({
  dungeons, completedIds, nearGateId,
  playerPosRef, keysRef, onEnterDungeon, onNearGateChange, returnCooldownRef,
}: {
  dungeons: DungeonDef[];
  completedIds: Set<string>;
  nearGateId: string | null;
  playerPosRef: RefObject<THREE.Vector3>;
  keysRef: RefObject<Set<string>>;
  onEnterDungeon: (d: DungeonDef) => void;
  onNearGateChange: (id: string | null) => void;
  returnCooldownRef: React.MutableRefObject<boolean>;
}) {
  const radius = Math.max(20, dungeons.length * 6 + 12);

  return (
    <>
      <color attach="background" args={['#0C1445']} />
      <fog attach="fog" args={['#0C1445', 30, 60]} />
      <Stars radius={80} depth={40} count={600} factor={3} fade speed={0.2} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 12, 5]} intensity={1.3} color="#FFF9E6" />
      <pointLight position={[0, 8, 0]} intensity={0.8} color="#7C3AED" />

      {/* Ocean */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1E3A5F" roughness={0.1} metalness={0.3} />
      </mesh>
      {/* Island ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <circleGeometry args={[radius, 72]} />
        <meshStandardMaterial color="#2D5A27" roughness={0.9} />
      </mesh>
      {/* Sand ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <ringGeometry args={[radius - 1.5, radius + 2, 72]} />
        <meshStandardMaterial color="#C8A96E" roughness={1} />
      </mesh>

      {/* Trees — deterministic positions */}
      {Array.from({ length: Math.min(dungeons.length * 4 + 6, 20) }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2 + i * 0.7;
        const r = (radius - 2.5) * (0.5 + (i % 3) * 0.2);
        const tx = Math.cos(angle) * r, tz = Math.sin(angle) * r;
        return (
          <group key={i} position={[tx, -0.5, tz]}>
            <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.12, 0.2, 1, 7]} /><meshStandardMaterial color="#5D3A1A" roughness={1} /></mesh>
            <mesh position={[0, 1.5, 0]}><coneGeometry args={[0.6, 1.3, 7]} /><meshStandardMaterial color="#1B5E20" roughness={0.9} /></mesh>
          </group>
        );
      })}

      {/* Dungeon gates */}
      {dungeons.map((d, idx) => {
        const unlocked = idx === 0 || completedIds.has(dungeons[idx - 1].id);
        const completed = completedIds.has(d.id);
        const near = nearGateId === d.id;
        return (
          <group key={d.id} position={[d.gatePos[0], 0, d.gatePos[1]]}>
            <IslandGate dungeon={d} unlocked={unlocked} completed={completed} isNear={near} />
          </group>
        );
      })}

      {/* Player */}
      <IslandPlayerController
        playerPosRef={playerPosRef}
        keysRef={keysRef}
        islandRadius={radius}
        dungeons={dungeons}
        completedIds={completedIds}
        onEnterDungeon={onEnterDungeon}
        onNearGateChange={onNearGateChange}
        returnCooldownRef={returnCooldownRef}
      />
    </>
  );
}

// ── DungeonScene ──────────────────────────────────────────────────────────────

function DungeonPlayerController({ playerPosRef, keysRef, monsters, defeated, onEncounter, encounterCooldownRef, onExit }: {
  playerPosRef: RefObject<THREE.Vector3>; keysRef: RefObject<Set<string>>;
  monsters: Monster[]; defeated: Set<string>; onEncounter: (m:Monster) => void;
  encounterCooldownRef: RefObject<boolean>; onExit: () => void;
}) {
  const { scene, animations } = useGLTF('/models/Xbot.glb');
  const cloned = useMemo(() => { const c = SkeletonUtils.clone(scene) as THREE.Group; applyPurpleTint(c); return c; }, [scene]);
  const groupRef = useRef<THREE.Group>(cloned);
  const { actions } = useAnimations(animations, groupRef);
  const isWalkingRef = useRef(false);
  const isExitingRef = useRef(false); // prevent repeated onExit calls per frame
  useEffect(() => { actions['idle']?.reset().play(); }, [actions]);
  useFrame(({ camera }, delta) => {
    const speed = 5; let moved = false; const pos = playerPosRef.current!;
    const keys = keysRef.current!;
    if (keys.has('ArrowUp')   || keys.has('w') || keys.has('W')) { pos.z = Math.max(pos.z - speed*delta, -22); moved=true; }
    if (keys.has('ArrowDown') || keys.has('s') || keys.has('S')) { pos.z = Math.min(pos.z + speed*delta,   3); moved=true; }
    if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) { pos.x = Math.max(pos.x - speed*delta*0.5, -1.5); moved=true; }
    if (keys.has('ArrowRight')|| keys.has('d') || keys.has('D')) { pos.x = Math.min(pos.x + speed*delta*0.5,  1.5); moved=true; }
    if (pos.z > 2.5 && !isExitingRef.current) { isExitingRef.current = true; onExit(); return; }
    if (moved !== isWalkingRef.current) {
      isWalkingRef.current = moved;
      Object.values(actions).forEach(a => a?.fadeOut(0.2));
      (moved ? actions['walk'] : actions['idle'])?.reset().fadeIn(0.2).play();
    }
    if (groupRef.current) {
      groupRef.current.position.set(pos.x, pos.y - 0.5, pos.z);
      const movingBack = keys.has('ArrowDown') || keys.has('s') || keys.has('S');
      groupRef.current.rotation.y = movingBack ? 0 : Math.PI;
    }
    camera.position.lerp(new THREE.Vector3(pos.x, pos.y+3, pos.z+6), 0.1);
    camera.lookAt(pos.x, pos.y, pos.z-2);
    if (!encounterCooldownRef.current) {
      for (const m of monsters) {
        if (defeated.has(m.id)) continue;
        if (pos.distanceTo(new THREE.Vector3(...m.pos)) < 2) { encounterCooldownRef.current = true; onEncounter(m); return; }
      }
    }
  });
  return <primitive ref={groupRef} object={cloned} scale={1} position={[0,-0.5,2]} rotation={[0,Math.PI,0]} dispose={null} />;
}

export function DungeonScene({ monsters, defeated, onMonsterEncounter, onExit, encounterCooldown, keysRef }: {
  monsters: Monster[]; defeated: Set<string>; onMonsterEncounter: (m:Monster) => void; onExit: () => void;
  encounterCooldown: RefObject<boolean>;
  keysRef: RefObject<Set<string>>;
}) {
  const playerPosRef = useRef(new THREE.Vector3(0, 0, 2));
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
          {monster.type==='boss'  && <BossMonster  hp={defeated.has(monster.id) ? 0 : monster.maxHp} maxHp={monster.maxHp} defeated={defeated.has(monster.id)} />}
          {!defeated.has(monster.id) && <Text position={[0,2.5,0]} fontSize={0.3} color={monster.color} anchorX="center">{monster.name}</Text>}
        </group>
      ))}
      <DungeonPlayerController playerPosRef={playerPosRef} keysRef={keysRef} monsters={monsters} defeated={defeated} onEncounter={onMonsterEncounter} encounterCooldownRef={encounterCooldown} onExit={onExit} />
    </>
  );
}

// ── CameraController ──────────────────────────────────────────────────────────

export function CameraController({ stage }: { stage: GameStage }) {
  const target = stage === 'battle'
    ? new THREE.Vector3(0, 3.5, 8)
    : new THREE.Vector3(0, 5, 10);
  useFrame(({ camera }) => {
    camera.position.lerp(target, 0.05);
    if (stage === 'battle') camera.lookAt(0, 0.5, 0);
  });
  return null;
}

// ── BattleArenaXbot ───────────────────────────────────────────────────────────

export function BattleArenaXbot({ attacking }: { attacking: boolean }) {
  const { scene, animations } = useGLTF('/models/Xbot.glb');
  const cloned = useMemo(() => { const c = SkeletonUtils.clone(scene) as THREE.Group; applyPurpleTint(c); return c; }, [scene]);
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
  return <primitive ref={groupRef} object={cloned} scale={1} position={[-2.2,-0.5,0]} rotation={[0,Math.PI/2,0]} dispose={null} />;
}

// ── BattleArenaScene ──────────────────────────────────────────────────────────

export function BattleArenaScene({ monster, monsterHp, xbotAttacking, monsterAttacking }: {
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
      <BattleArenaXbot attacking={xbotAttacking} />
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
