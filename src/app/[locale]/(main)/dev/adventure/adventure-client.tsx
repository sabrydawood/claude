'use client';
import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import {
  type DungeonDef, type Monster, type GameStage,
  IslandScene, DungeonScene,
  BattleArenaScene, CameraController,
} from './adventure-3d';

// ── Dungeon definitions ───────────────────────────────────────────────────────

const DUNGEONS: DungeonDef[] = [
  {
    id: 'd1',
    name: 'كهف المبادئ',
    topic: 'البرمجة الأساسية',
    color: '#10B981',
    gatePos: [6, -5],
    monsters: [
      { id:'d1m1', type:'slime', name:'Slime الأول', color:'#10B981', maxHp:1, pos:[0,0,-5],
        question:{ text:'ما أول رقم يطبعه range(3)؟', options:['0','1','3'], correct:0 } },
      { id:'d1m2', type:'slime', name:'Slime الثاني', color:'#10B981', maxHp:1, pos:[0,0,-10],
        question:{ text:'ما نوع: x = "سلام"', options:['نص (string)','رقم (int)','قائمة (list)'], correct:0 } },
      { id:'d1boss', type:'boss', name:'Boss المبادئ', color:'#059669', maxHp:2, pos:[0,0,-16],
        question:{ text:'ما ناتج: print(2 + 3)', options:['5','23','6'], correct:0 } },
    ],
  },
  {
    id: 'd2',
    name: 'كهف الحلقات',
    topic: 'Loops',
    color: '#818CF8',
    gatePos: [-7, -4],
    monsters: [
      { id:'d2m1', type:'ghost', name:'Ghost الحلقة', color:'#818CF8', maxHp:1, pos:[0,0,-5],
        question:{ text:'كم مرة تتكرر: for i in range(5)', options:['3 مرات','5 مرات','7 مرات'], correct:1 } },
      { id:'d2m2', type:'rock', name:'Rock الحلقة', color:'#818CF8', maxHp:1, pos:[0,0,-10],
        question:{ text:'ناتج: for i in range(3): print(i*2)', options:['0 2 4','0 1 2','2 4 6'], correct:0 } },
      { id:'d2boss', type:'boss', name:'Boss الحلقات', color:'#6366F1', maxHp:3, pos:[0,0,-17],
        question:{ text:'لطباعة 1 2 3 4 5:\nfor i in range(__, __)', options:['range(1,6)','range(0,5)','range(1,5)'], correct:0 } },
    ],
  },
  {
    id: 'd3',
    name: 'كهف الدوال',
    topic: 'Functions',
    color: '#F59E0B',
    gatePos: [2, 8],
    monsters: [
      { id:'d3m1', type:'ghost', name:'Ghost الدالة', color:'#F59E0B', maxHp:1, pos:[0,0,-5],
        question:{ text:'كلمة تعريف الدالة في Python؟', options:['def','function','fun'], correct:0 } },
      { id:'d3m2', type:'rock', name:'Rock الإرجاع', color:'#F59E0B', maxHp:1, pos:[0,0,-10],
        question:{ text:'ما كلمة الإرجاع في Python؟', options:['return','output','give'], correct:0 } },
      { id:'d3boss', type:'boss', name:'Boss الدوال', color:'#D97706', maxHp:3, pos:[0,0,-17],
        question:{ text:'ناتج:\ndef add(a,b): return a+b\nprint(add(2,3))', options:['5','23','error'], correct:0 } },
    ],
  },
  {
    id: 'd4',
    name: 'بوابة التنين',
    topic: 'Final Boss',
    color: '#EF4444',
    gatePos: [-4, 7],
    monsters: [
      { id:'d4m1', type:'rock', name:'حارس التنين', color:'#EF4444', maxHp:1, pos:[0,0,-6],
        question:{ text:'if 5 > 3:\n  print("صح")\nما الناتج؟', options:['"صح"','لا شيء','خطأ'], correct:0 } },
      { id:'d4boss', type:'boss', name:'التنين الأكبر', color:'#EF4444', maxHp:3, pos:[0,0,-16],
        question:{ text:'ما الناتج:\nx=[1,2,3]\nprint(len(x))', options:['3','6','[1,2,3]'], correct:0 } },
    ],
  },
];

// ── BattleScreen (HTML overlay) ───────────────────────────────────────────────

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
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }} className="text-center">
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
        <div className="max-w-lg mx-auto">
          <div className="mb-4 px-4 py-3 rounded-2xl text-center"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <p className="text-white font-bold text-base leading-relaxed whitespace-pre-line">
              {monster.question.text}
            </p>
          </div>
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

// ── Main AdventureClient ──────────────────────────────────────────────────────

export default function AdventureClient({ locale }: { locale: string }) {
  const isRtl = locale === 'ar';

  const [stage, setStage]               = useState<GameStage>('island');
  const [currentDungeon, setDungeon]    = useState<DungeonDef | null>(null);
  const [completedIds, setCompleted]    = useState<Set<string>>(new Set());
  const [defeatedInDungeon, setDefeated]= useState<Set<string>>(new Set());
  const [playerHp, setPlayerHp]         = useState(3);
  const [currentMonster, setMonster]    = useState<Monster | null>(null);
  const [monsterHp, setMonsterHp]       = useState(1);
  const [xbotAttacking, setXbotAtk]    = useState(false);
  const [monsterAttacking, setMonAtk]  = useState(false);
  const [showVictory, setVictory]       = useState(false);
  const [victoryDungeon, setVicDungeon] = useState<DungeonDef | null>(null);
  const [nearGateId, setNearGateId]     = useState<string | null>(null);

  // Shared refs for Canvas
  const islandPlayerPos  = useRef(new THREE.Vector3(0, 0, 0));
  const islandKeys       = useRef<Set<string>>(new Set());
  const dungeonKeys      = useRef<Set<string>>(new Set());
  const encounterCooldown = useRef(false);

  const MOVE_KEYS_LIST = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','W','a','A','s','S','d','D'];

  // Island keyboard
  useEffect(() => {
    if (stage !== 'island') return;
    const down = (e: KeyboardEvent) => { if (MOVE_KEYS_LIST.includes(e.key)) e.preventDefault(); islandKeys.current.add(e.key); };
    const up   = (e: KeyboardEvent) => islandKeys.current.delete(e.key);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Dungeon keyboard
  useEffect(() => {
    if (stage !== 'dungeon') return;
    const down = (e: KeyboardEvent) => { if (MOVE_KEYS_LIST.includes(e.key)) e.preventDefault(); dungeonKeys.current.add(e.key); };
    const up   = (e: KeyboardEvent) => dungeonKeys.current.delete(e.key);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function handleEnterDungeon(d: DungeonDef) {
    setDungeon(d);
    setDefeated(new Set());
    setPlayerHp(3);
    encounterCooldown.current = false;
    setStage('dungeon');
  }

  function handleEncounter(m: Monster) {
    setMonster(m); setMonsterHp(m.maxHp); setStage('battle');
  }

  function handleBattleAnswer(correct: boolean) {
    if (!currentMonster) return;
    if (correct) {
      setXbotAtk(true);
      setTimeout(() => setXbotAtk(false), 700);
      setTimeout(() => {
        const newHp = monsterHp - 1;
        if (newHp <= 0) {
          const next = new Set(defeatedInDungeon).add(currentMonster.id);
          setDefeated(next);
          setStage('dungeon');
          setMonster(null);
          setTimeout(() => { encounterCooldown.current = false; }, 1500);
          if (currentDungeon && next.size >= currentDungeon.monsters.length) {
            setCompleted(prev => new Set(prev).add(currentDungeon.id));
            setVicDungeon(currentDungeon);
            setVictory(true);
          }
        } else { setMonsterHp(newHp); }
      }, 500);
    } else {
      setMonAtk(true);
      setTimeout(() => setMonAtk(false), 700);
      setTimeout(() => {
        const hp = Math.max(0, playerHp - 1);
        setPlayerHp(hp);
        if (hp <= 0) {
          setTimeout(() => { setPlayerHp(3); setDefeated(new Set()); setMonster(null); setStage('dungeon'); encounterCooldown.current = false; }, 1500);
        }
      }, 500);
    }
  }

  function handleReturnToIsland() {
    setVictory(false);
    setDungeon(null);
    setStage('island');
  }

  const monstersInDungeon = currentDungeon?.monsters ?? [];

  return (
    <div style={{ position: 'fixed', inset: 0 }} dir={isRtl ? 'rtl' : 'ltr'}>
      <Canvas camera={{ position: [0, 10, 8], fov: 55 }} style={{ width: '100%', height: '100%' }} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          {stage === 'island' && (
            <IslandScene
              dungeons={DUNGEONS}
              completedIds={completedIds}
              nearGateId={nearGateId}
              playerPosRef={islandPlayerPos}
              keysRef={islandKeys}
              onEnterDungeon={handleEnterDungeon}
              onNearGateChange={setNearGateId}
            />
          )}
          {stage === 'dungeon' && currentDungeon && (
            <>
              <DungeonScene
                monsters={monstersInDungeon}
                defeated={defeatedInDungeon}
                onMonsterEncounter={handleEncounter}
                onExit={() => setStage('island')}
                encounterCooldown={encounterCooldown}
                keysRef={dungeonKeys}
              />
              <CameraController stage="dungeon" />
            </>
          )}
          {stage === 'battle' && currentMonster && (
            <>
              <BattleArenaScene
                monster={currentMonster}
                monsterHp={monsterHp}
                xbotAttacking={xbotAttacking}
                monsterAttacking={monsterAttacking}
              />
              <CameraController stage="battle" />
            </>
          )}
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div style={{ position:'fixed', top:16, right:16, zIndex:20 }} className="bg-black/50 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/10 flex items-center gap-3">
        <span className="text-white font-bold text-sm">أحمد</span>
        <div className="flex gap-1">{Array.from({length:3},(_,i)=><span key={i} className={`text-base ${i<playerHp?'text-red-500':'text-slate-600'}`}>{i<playerHp?'❤':'♡'}</span>)}</div>
        {stage === 'dungeon' && currentDungeon && (
          <span className="text-xs text-white/40">{currentDungeon.name}</span>
        )}
        <span className="text-xs text-amber-400">{completedIds.size}/{DUNGEONS.length} مكتملة</span>
      </div>

      {/* Controls hint */}
      {(stage === 'island' || stage === 'dungeon') && (
        <div style={{ position:'fixed', bottom:16, left:'50%', transform:'translateX(-50%)', zIndex:20 }} className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
          <p className="text-white/50 text-xs">
            {stage === 'island' ? 'WASD / ↑↓←→ للتحرك — اقترب من الأبواب للدخول' : 'WASD / ↑↓←→ — اقترب من الوحوش — ارجع للخلف للخروج'}
          </p>
        </div>
      )}

      {/* Battle screen */}
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
        {showVictory && victoryDungeon && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale:0, rotate:-10 }} animate={{ scale:1, rotate:0 }} transition={{ type:'spring', stiffness:200 }}
              className="bg-slate-900/95 rounded-3xl p-10 border border-amber-500/30 text-center max-w-sm mx-4"
              style={{ boxShadow:'0 0 60px #F59E0B44' }}>
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-black text-amber-400 mb-1">أحسنت يا بطل!</h2>
              <p className="text-white/70 mb-2">أكملت: {victoryDungeon.name}</p>
              {DUNGEONS.findIndex(d => d.id === victoryDungeon.id) < DUNGEONS.length - 1 && (
                <p className="text-purple-400 text-sm mb-4">الباب التالي مفتوح الآن!</p>
              )}
              <button onClick={handleReturnToIsland}
                className="px-6 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-400 transition-colors">
                العودة للجزيرة
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
