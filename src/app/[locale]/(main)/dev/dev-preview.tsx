'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Line, Html, useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import { Suspense, useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';

// ─── Concept Graph Data (preview data — not real DB) ──────────────────────────

type ConceptStatus = 'mastered' | 'in-progress' | 'available' | 'locked';

interface ConceptNode {
  id: string;
  label: string;
  pos: [number, number, number];
  status: ConceptStatus;
  mastery: number;
  type: string;
}

const STATUS_COLOR: Record<ConceptStatus, string> = {
  mastered:    '#10B981',
  'in-progress': '#F59E0B',
  available:   '#7C3AED',
  locked:      '#374151',
};

const CONCEPTS: ConceptNode[] = [
  // Programming track (left side)
  { id: 'prog',      label: 'البرمجة الأساسية', pos: [-7, 0, 0],  status: 'mastered',     mastery: 92, type: 'conceptual' },
  { id: 'vars',      label: 'المتغيرات',         pos: [-5, 0, -3], status: 'mastered',     mastery: 88, type: 'procedural' },
  { id: 'loops',     label: 'الحلقات',           pos: [-5, 0, 3],  status: 'in-progress',  mastery: 61, type: 'procedural' },
  { id: 'funcs',     label: 'الدوال',            pos: [-2, 0, 0],  status: 'available',    mastery: 0,  type: 'procedural' },
  // AI track (center → right)
  { id: 'ai',        label: 'أساسيات AI',        pos: [1,  0, 0],  status: 'available',    mastery: 0,  type: 'conceptual' },
  { id: 'ml',        label: 'التعلم الآلي',       pos: [4,  0, -3], status: 'locked',       mastery: 0,  type: 'conceptual' },
  { id: 'neural',    label: 'الشبكات العصبية',   pos: [4,  0, 3],  status: 'locked',       mastery: 0,  type: 'conceptual' },
  { id: 'deep',      label: 'التعلم العميق',      pos: [7,  0, 0],  status: 'locked',       mastery: 0,  type: 'conceptual' },
  // Data track
  { id: 'data',      label: 'البيانات',           pos: [1,  0, -5], status: 'locked',       mastery: 0,  type: 'factual' },
  { id: 'algo',      label: 'الخوارزميات',        pos: [-2, 0, -5], status: 'available',    mastery: 0,  type: 'procedural' },
];

const EDGES: [string, string][] = [
  ['prog', 'vars'], ['prog', 'loops'], ['vars', 'funcs'], ['loops', 'funcs'],
  ['funcs', 'ai'], ['ai', 'ml'], ['ai', 'neural'], ['ml', 'deep'], ['neural', 'deep'],
  ['funcs', 'algo'], ['algo', 'data'], ['data', 'ml'],
];

// ─── 3D Components ────────────────────────────────────────────────────────────

function ConceptSphere({ concept, onClick, isSelected }: {
  concept: ConceptNode;
  onClick: (c: ConceptNode) => void;
  isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const color = STATUS_COLOR[concept.status];
  const isActive = concept.status !== 'locked';

  useFrame(({ clock }) => {
    if (!meshRef.current || !isActive) return;
    const t = clock.elapsedTime;
    meshRef.current.scale.setScalar(1 + Math.sin(t * 1.5 + concept.pos[0]) * 0.04);
  });

  return (
    <group position={concept.pos}>
      {/* Core sphere */}
      <mesh ref={meshRef} onClick={() => isActive && onClick(concept)}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.6 : 0.05}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* Outer glow ring for selected */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.7, 0.06, 8, 32]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
      )}

      {/* Halo */}
      {isActive && (
        <mesh>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshStandardMaterial color={color} transparent opacity={0.06} side={THREE.BackSide} />
        </mesh>
      )}

      {/* Label — always visible */}
      <Text position={[0, 0.85, 0]} fontSize={0.22} color="rgba(255,255,255,0.9)" anchorX="center">
        {concept.label}
      </Text>

      {/* Mastery % */}
      {concept.mastery > 0 && (
        <Text position={[0, -0.75, 0]} fontSize={0.18} color={color} anchorX="center">
          {concept.mastery}%
        </Text>
      )}
    </group>
  );
}

function ConceptEdge({ from, to }: { from: string; to: string }) {
  const a = CONCEPTS.find(c => c.id === from);
  const b = CONCEPTS.find(c => c.id === to);
  if (!a || !b) return null;

  const bothActive = a.status !== 'locked' || b.status !== 'locked';
  return (
    <Line
      points={[new THREE.Vector3(...a.pos), new THREE.Vector3(...b.pos)]}
      color={bothActive ? '#5B21B6' : '#1F2937'}
      lineWidth={bothActive ? 1.5 : 0.8}
      transparent
      opacity={bothActive ? 0.6 : 0.25}
    />
  );
}

function XbotCharacter({ position }: { position: [number, number, number] }) {
  const { scene, animations } = useGLTF('/models/Xbot.glb');
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Group;
    c.rotation.y = 0;
    return c;
  }, [scene]);
  const clonedRef = useRef<THREE.Group>(cloned);
  const { actions } = useAnimations(animations, clonedRef);

  useEffect(() => {
    const color = new THREE.Color('#7C3AED');
    cloned.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const mats = Array.isArray((child as THREE.Mesh).material)
          ? (child as THREE.Mesh).material as THREE.Material[]
          : [(child as THREE.Mesh).material as THREE.Material];
        mats.forEach(m => {
          const sm = m as THREE.MeshStandardMaterial;
          if (sm.color) sm.color.set(color);
          sm.metalness = 0.3; sm.roughness = 0.5; sm.needsUpdate = true;
        });
      }
    });
  }, [cloned]);

  useEffect(() => {
    const idle = actions['idle'];
    if (idle) idle.reset().play();
  }, [actions]);

  return <primitive ref={clonedRef} object={cloned} scale={2.2} position={[position[0], -1.75 + position[1], position[2]]} dispose={null} />;
}

function WorldGround() {
  return (
    <group>
      {/* Main disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <circleGeometry args={[16, 64]} />
        <meshStandardMaterial color="#0A0520" transparent opacity={0.9} />
      </mesh>
      {/* Grid lines overlay */}
      <gridHelper args={[30, 30, '#2D1B69', '#1A0F3C']} position={[0, -0.04, 0]} />
    </group>
  );
}

function WorldScene({ onSelectConcept, selectedId }: {
  onSelectConcept: (c: ConceptNode | null) => void;
  selectedId: string | null;
}) {
  return (
    <>
      <color attach="background" args={['#020617']} />
      <fog attach="fog" args={['#020617', 20, 40]} />
      <Stars radius={60} depth={30} count={800} factor={3} fade speed={0.3} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} color="#C4B5FD" />
      <pointLight position={[0, 8, 0]} intensity={0.8} color="#7C3AED" distance={20} />

      <WorldGround />

      {EDGES.map(([a, b]) => <ConceptEdge key={`${a}-${b}`} from={a} to={b} />)}

      {CONCEPTS.map(c => (
        <ConceptSphere
          key={c.id}
          concept={c}
          isSelected={c.id === selectedId}
          onClick={onSelectConcept}
        />
      ))}

      {/* Xbot at the in-progress node */}
      <Suspense fallback={null}>
        <XbotCharacter position={[-5, 0, 3]} />
      </Suspense>

      <OrbitControls
        target={[0, 0, 0]}
        enablePan={false}
        minDistance={5}
        maxDistance={28}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </>
  );
}

// ─── Phase 1 Feature Cards ─────────────────────────────────────────────────────

const PHASE1_FEATURES = [
  {
    id: 'graph',
    icon: '🕸️',
    title: 'Knowledge Graph',
    status: 'planned',
    tables: ['Concepts', 'ConceptRelations', 'ConceptChunks'],
    desc: 'المعرفة كشبكة مترابطة — كل مفهوم يعرف من أين جاء وأين يذهب',
    api: ['GET /api/v1/graph/concept/:id', 'GET /api/v1/graph/path', 'GET /api/v1/graph/student'],
  },
  {
    id: 'cache',
    icon: '⚡',
    title: 'Semantic Cache',
    status: 'planned',
    tables: ['SemanticCache'],
    desc: 'Cache دائم للأسئلة — أول من يسأل يدفع، الباقون مجاناً',
    api: ['Mascot Controller → Cache Check → AI fallback'],
  },
  {
    id: 'mastery',
    icon: '🎯',
    title: 'Student Mastery',
    status: 'planned',
    tables: ['StudentMastery', 'LearningSignals', 'StudentInsights'],
    desc: 'مستوى إتقان حقيقي لكل مفهوم — مش مجرد "أكمل الدرس ✓"',
    api: ['GET /api/v1/mastery', 'POST /api/v1/mastery/:conceptId'],
  },
];

function FeatureCard({ f }: { f: typeof PHASE1_FEATURES[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl border cursor-pointer transition-all"
      style={{
        background: open ? 'rgba(124,58,237,0.12)' : 'rgba(15,10,30,0.8)',
        border: open ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(75,85,99,0.3)',
        padding: '20px',
      }}
      onClick={() => setOpen(v => !v)}
    >
      <div className="flex items-center gap-3">
        <span style={{ fontSize: 28 }}>{f.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 style={{ color: '#E9D5FF', fontWeight: 700, fontSize: 16 }}>{f.title}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(124,58,237,0.3)', color: '#C4B5FD' }}>
              Planned
            </span>
          </div>
          <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4 }}>{f.desc}</p>
        </div>
        <span style={{ color: '#6B7280', fontSize: 18 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <p style={{ color: '#7C3AED', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>DB TABLES</p>
            <div className="flex flex-wrap gap-2">
              {f.tables.map(t => (
                <span key={t} className="text-xs px-2 py-1 rounded font-mono"
                  style={{ background: 'rgba(31,14,69,0.8)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p style={{ color: '#7C3AED', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>API ENDPOINTS</p>
            <div className="flex flex-col gap-1">
              {f.api.map(a => (
                <code key={a} className="text-xs block"
                  style={{ color: '#6EE7B7', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: 6 }}>
                  {a}
                </code>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ALI Flow Diagram ─────────────────────────────────────────────────────────

function FlowStep({ step, active }: { step: { label: string; detail: string; color: string }; active: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
      style={{
        background: active ? `${step.color}20` : 'rgba(15,10,30,0.6)',
        border: `1px solid ${active ? step.color : 'rgba(75,85,99,0.2)'}`,
        transform: active ? 'scale(1.02)' : 'scale(1)',
      }}>
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: active ? step.color : '#374151' }} />
      <div>
        <div style={{ color: active ? '#fff' : '#6B7280', fontWeight: 600, fontSize: 13 }}>{step.label}</div>
        <div style={{ color: active ? step.color : '#4B5563', fontSize: 11 }}>{step.detail}</div>
      </div>
    </div>
  );
}

// ─── Concept Detail Panel ─────────────────────────────────────────────────────

function ConceptPanel({ concept, onClose }: { concept: ConceptNode; onClose: () => void }) {
  const color = STATUS_COLOR[concept.status];
  const prereqs = EDGES.filter(([, to]) => to === concept.id).map(([from]) => CONCEPTS.find(c => c.id === from)?.label).filter(Boolean);
  const unlocks = EDGES.filter(([from]) => from === concept.id).map(([, to]) => CONCEPTS.find(c => c.id === to)?.label).filter(Boolean);

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: 'rgba(10,5,30,0.95)', border: `1px solid ${color}40`, backdropFilter: 'blur(20px)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: color }} />
          <span style={{ color, fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>{concept.status}</span>
        </div>
        <button onClick={onClose} style={{ color: '#6B7280', fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      <h2 style={{ color: '#F3F4F6', fontWeight: 800, fontSize: 20 }}>{concept.label}</h2>

      {concept.mastery > 0 && (
        <div>
          <div className="flex justify-between mb-1">
            <span style={{ color: '#9CA3AF', fontSize: 12 }}>مستوى الإتقان</span>
            <span style={{ color, fontSize: 12, fontWeight: 700 }}>{concept.mastery}%</span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 6, background: '#1F2937' }}>
            <div className="h-full rounded-full" style={{ width: `${concept.mastery}%`, background: color }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg p-2" style={{ background: 'rgba(31,14,69,0.6)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <p style={{ color: '#7C3AED', fontWeight: 700, marginBottom: 4 }}>Prerequisites</p>
          {prereqs.length ? prereqs.map(p => <p key={p} style={{ color: '#C4B5FD' }}>← {p}</p>) : <p style={{ color: '#4B5563' }}>لا شيء</p>}
        </div>
        <div className="rounded-lg p-2" style={{ background: 'rgba(31,14,69,0.6)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <p style={{ color: '#7C3AED', fontWeight: 700, marginBottom: 4 }}>Unlocks</p>
          {unlocks.length ? unlocks.map(u => <p key={u} style={{ color: '#C4B5FD' }}>→ {u}</p>) : <p style={{ color: '#4B5563' }}>لا شيء</p>}
        </div>
      </div>

      <div className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
        <span style={{ color: '#9CA3AF' }}>نوع المفهوم: </span>
        <span style={{ color: '#A78BFA' }}>{concept.type}</span>
      </div>
    </div>
  );
}

// ─── Main Dev Preview ─────────────────────────────────────────────────────────

type Tab = 'worldmap' | 'phase1' | 'flow';

const ALI_FLOW = [
  { label: 'طلب المستخدم', detail: 'سؤال الطفل يصل للـ API', color: '#60A5FA' },
  { label: 'Semantic Cache Check', detail: 'البحث عن إجابة مطابقة محفوظة', color: '#10B981' },
  { label: 'Cache Hit → Return Free', detail: 'لا تكلفة AI — إجابة فورية', color: '#10B981' },
  { label: 'Cache Miss → RAG', detail: 'جلب أقرب 3 مقاطع من Knowledge Graph', color: '#F59E0B' },
  { label: 'Student Profile Inject', detail: 'إضافة StudentInsights (مش تاريخ كامل)', color: '#F59E0B' },
  { label: 'AI Provider Call', detail: 'context أصغر = تكلفة أقل', color: '#7C3AED' },
  { label: 'Save to Cache + Update Mastery', detail: 'يُحفظ للمرة القادمة + تحديث الـ score', color: '#7C3AED' },
];

export default function DevPreview() {
  const [tab, setTab] = useState<Tab>('worldmap');
  const [selectedConcept, setSelectedConcept] = useState<ConceptNode | null>(null);
  const [flowStep, setFlowStep] = useState(0);

  useEffect(() => {
    if (tab !== 'flow') return;
    const id = setInterval(() => setFlowStep(s => (s + 1) % ALI_FLOW.length), 900);
    return () => clearInterval(id);
  }, [tab]);

  const TABS: { id: Tab; label: string }[] = [
    { id: 'worldmap', label: '🗺️ World Map' },
    { id: 'phase1',  label: '⚙️ Phase 1 Features' },
    { id: 'flow',    label: '🔄 ALI Flow' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#F3F4F6', fontFamily: 'var(--font-inter), sans-serif' }}>
      {/* Dev Banner */}
      <div className="flex items-center justify-center gap-3 py-2 text-xs font-bold"
        style={{ background: 'rgba(124,58,237,0.3)', borderBottom: '1px solid rgba(124,58,237,0.4)', color: '#C4B5FD' }}>
        🚧 DEV PREVIEW — هذه الصفحة تُعرض قبل التطبيق الفعلي — غير موجودة في الإنتاج
      </div>

      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: 22, color: '#E9D5FF' }}>ذكاوي — Dev Preview</h1>
          <p style={{ color: '#6B7280', fontSize: 13 }}>معاينة World Map + Phase 1 ALI قبل التطبيق</p>
        </div>
        <div className="flex gap-2">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tab === t.id ? 'rgba(124,58,237,0.4)' : 'rgba(31,41,55,0.5)',
                border: `1px solid ${tab === t.id ? 'rgba(124,58,237,0.6)' : 'rgba(75,85,99,0.3)'}`,
                color: tab === t.id ? '#E9D5FF' : '#9CA3AF',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: World Map ── */}
      {tab === 'worldmap' && (
        <div className="flex" style={{ height: 'calc(100vh - 100px)' }}>
          {/* 3D Canvas */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Canvas camera={{ position: [0, 14, 22], fov: 45 }} style={{ background: 'transparent' }}>
              <Suspense fallback={null}>
                <WorldScene onSelectConcept={setSelectedConcept} selectedId={selectedConcept?.id ?? null} />
              </Suspense>
            </Canvas>

            {/* Legend */}
            <div className="absolute bottom-5 left-5 flex flex-col gap-2 text-xs"
              style={{ background: 'rgba(2,6,23,0.85)', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
              {Object.entries(STATUS_COLOR).map(([s, c]) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                  <span style={{ color: '#9CA3AF' }}>
                    {s === 'mastered' ? 'مُتقن' : s === 'in-progress' ? 'جارٍ' : s === 'available' ? 'متاح' : 'مقفول'}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-1 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#7C3AED' }} />
                <span style={{ color: '#C4B5FD' }}>Xbot = مكان الطالب الآن</span>
              </div>
            </div>

            {/* Hint */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-xs px-4 py-2 rounded-full"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#C4B5FD' }}>
              اضغط على مفهوم متاح لرؤية تفاصيله • اسحب للتدوير
            </div>
          </div>

          {/* Side panel */}
          <div style={{ width: 300, padding: 20, borderLeft: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto' }}>
            {selectedConcept ? (
              <ConceptPanel concept={selectedConcept} onClose={() => setSelectedConcept(null)} />
            ) : (
              <div className="flex flex-col gap-4">
                <h2 style={{ color: '#E9D5FF', fontWeight: 700, fontSize: 16 }}>خريطة التعلم</h2>
                <p style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.6 }}>
                  هذه هي الرؤية الجديدة للـ UI — خريطة عالم تفاعلية بدل قائمة الدروس التقليدية.
                </p>
                <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <p style={{ color: '#A78BFA', fontWeight: 700, fontSize: 13 }}>إحصائيات المعاينة</p>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#9CA3AF' }}>المفاهيم</span>
                    <span style={{ color: '#E9D5FF' }}>{CONCEPTS.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#9CA3AF' }}>مُتقن</span>
                    <span style={{ color: '#10B981' }}>{CONCEPTS.filter(c => c.status === 'mastered').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#9CA3AF' }}>جارٍ</span>
                    <span style={{ color: '#F59E0B' }}>{CONCEPTS.filter(c => c.status === 'in-progress').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#9CA3AF' }}>متاح</span>
                    <span style={{ color: '#7C3AED' }}>{CONCEPTS.filter(c => c.status === 'available').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#9CA3AF' }}>مقفول</span>
                    <span style={{ color: '#6B7280' }}>{CONCEPTS.filter(c => c.status === 'locked').length}</span>
                  </div>
                </div>
                <p style={{ color: '#4B5563', fontSize: 12, lineHeight: 1.6 }}>
                  في الإنتاج: المفاهيم تأتي من قاعدة البيانات (جدول Concepts) والعلاقات من ConceptRelations.
                  مستوى الإتقان يأتي من StudentMastery.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Phase 1 Features ── */}
      {tab === 'phase1' && (
        <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px' }}>
          <h2 style={{ color: '#E9D5FF', fontWeight: 800, fontSize: 24, marginBottom: 8 }}>Phase 1 — ما سيُبنى</h2>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 32 }}>
            هذه الميزات سيقوم بتنفيذها Sub-Agents بالتوازي. اضغط على كل بطاقة لترى التفاصيل.
          </p>

          {/* DB Schema Preview */}
          <div className="rounded-2xl p-5 mb-6"
            style={{ background: 'rgba(15,10,30,0.8)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <h3 style={{ color: '#A78BFA', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
              🗄️ الجداول الجديدة في قاعدة البيانات
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              {[
                { name: 'Concepts', cols: 'Id, NameAr, NameEn, Difficulty, Type', agent: 'Schema' },
                { name: 'ConceptRelations', cols: 'FromConceptId, ToConceptId, RelationType', agent: 'Schema' },
                { name: 'ConceptChunks', cols: 'ConceptId, Content, Locale, Embedding(text)', agent: 'Schema' },
                { name: 'StudentMastery', cols: 'UserId, ConceptId, Score(0-100), Attempts', agent: 'Schema' },
                { name: 'LearningSignals', cols: 'UserId, ConceptId, SignalType, Value', agent: 'Schema' },
                { name: 'StudentInsights', cols: 'UserId, Insights(JSON), UpdatedAt', agent: 'Schema' },
                { name: 'SemanticCache', cols: 'QuestionHash, Question, Answer, HitCount', agent: 'Schema' },
              ].map(t => (
                <div key={t.name} className="rounded-lg p-3"
                  style={{ background: 'rgba(31,14,69,0.6)', border: '1px solid rgba(124,58,237,0.15)' }}>
                  <p style={{ color: '#C4B5FD', fontWeight: 700, marginBottom: 4 }}>{t.name}</p>
                  <p style={{ color: '#6B7280', lineHeight: 1.5 }}>{t.cols}</p>
                  <p style={{ color: '#7C3AED', marginTop: 4, fontSize: 10 }}>Agent: {t.agent}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {PHASE1_FEATURES.map(f => <FeatureCard key={f.id} f={f} />)}
          </div>
        </div>
      )}

      {/* ── Tab: ALI Flow ── */}
      {tab === 'flow' && (
        <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 24px' }}>
          <h2 style={{ color: '#E9D5FF', fontWeight: 800, fontSize: 24, marginBottom: 8 }}>ALI Request Flow</h2>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 32 }}>
            كيف سيسير الطلب بعد Phase 1 — من سؤال الطفل لحد الإجابة.
            الخطوة الخضراء = مجانية (cache hit).
          </p>

          <div className="flex flex-col gap-3">
            {ALI_FLOW.map((step, i) => (
              <div key={i}>
                <FlowStep step={step} active={i <= flowStep} />
                {i < ALI_FLOW.length - 1 && (
                  <div className="flex justify-center my-1">
                    <div className="w-px h-4" style={{ background: i < flowStep ? step.color : '#1F2937' }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-5 mt-8"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <p style={{ color: '#10B981', fontWeight: 700, marginBottom: 8 }}>💰 التوفير المتوقع</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'Cache Hit Rate', value: '40%+', note: 'في أول شهر' },
                { label: 'تخفيض التكلفة', value: '60%', note: 'بعد warmup' },
                { label: 'سرعة الاستجابة', value: '×10', note: 'للـ cached' },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ color: '#10B981', fontWeight: 900, fontSize: 24 }}>{s.value}</p>
                  <p style={{ color: '#6EE7B7', fontSize: 12 }}>{s.label}</p>
                  <p style={{ color: '#4B5563', fontSize: 11 }}>{s.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
