'use client';
import { useEffect, useRef } from 'react';
import { Play, RefreshCw, Square, HelpCircle, Package, Zap, ClipboardList } from 'lucide-react';

interface BlockEditorProps {
  locale: string;
  ageGroup?: 'spark' | 'explorer' | 'builder';
  onCodeChange?: (code: string) => void;
}

interface BlockDef {
  icon: React.ReactNode;
  labelAr: string;
  labelEn: string;
}

const SPARK_BLOCKS: BlockDef[] = [
  { icon: <Play size={12} />, labelAr: 'ابدأ', labelEn: 'Start' },
  { icon: <RefreshCw size={12} />, labelAr: 'كرر', labelEn: 'Repeat' },
  { icon: <Square size={12} />, labelAr: 'اوقف', labelEn: 'Stop' },
];

const EXPLORER_BLOCKS: BlockDef[] = [
  { icon: <Play size={12} />, labelAr: 'ابدأ', labelEn: 'Start' },
  { icon: <RefreshCw size={12} />, labelAr: 'كرر X مرات', labelEn: 'Repeat X times' },
  { icon: <HelpCircle size={12} />, labelAr: 'إذا', labelEn: 'If' },
  { icon: <Package size={12} />, labelAr: 'متغير', labelEn: 'Variable' },
  { icon: <Square size={12} />, labelAr: 'اوقف', labelEn: 'Stop' },
];

const BUILDER_BLOCKS: BlockDef[] = [
  { icon: <Play size={12} />, labelAr: 'ابدأ', labelEn: 'Start' },
  { icon: <RefreshCw size={12} />, labelAr: 'حلقة while', labelEn: 'While loop' },
  { icon: <HelpCircle size={12} />, labelAr: 'إذا/وإلا', labelEn: 'If/Else' },
  { icon: <Package size={12} />, labelAr: 'متغير', labelEn: 'Variable' },
  { icon: <Zap size={12} />, labelAr: 'دالة', labelEn: 'Function' },
  { icon: <ClipboardList size={12} />, labelAr: 'قائمة', labelEn: 'List' },
  { icon: <Square size={12} />, labelAr: 'اوقف', labelEn: 'Stop' },
];

export default function BlockEditor({ locale, ageGroup = 'explorer', onCodeChange }: BlockEditorProps) {
  const isRtl = locale === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);

  // Placeholder — Blockly will be loaded here in Phase 2
  // When Blockly is integrated: import * as Blockly from 'blockly/ar'
  // and call Blockly.inject(containerRef.current, workspaceOptions)

  // onCodeChange is reserved for Blockly integration
  void onCodeChange;

  const placeholderBlocks =
    ageGroup === 'spark' ? SPARK_BLOCKS :
    ageGroup === 'explorer' ? EXPLORER_BLOCKS :
    BUILDER_BLOCKS;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="flex gap-3 h-64 rounded-2xl overflow-hidden border-2 border-gray-200">
      {/* Block palette */}
      <div className="w-32 bg-gray-50 border-e border-gray-200 p-2 overflow-y-auto">
        <p className="text-xs text-gray-400 mb-2">{isRtl ? 'البلوكات' : 'Blocks'}</p>
        <div className="space-y-1">
          {placeholderBlocks.map((block, idx) => (
            <div
              key={idx}
              draggable
              className="flex items-center gap-1 px-2 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium cursor-grab select-none hover:bg-blue-200"
            >
              {block.icon}
              <span>{isRtl ? block.labelAr : block.labelEn}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 bg-white p-3 flex items-center justify-center">
        <p className="text-sm text-gray-400 text-center">
          {isRtl ? 'محرر البلوكات قيد البناء\nاسحب البلوكات هنا' : 'Block editor coming soon\nDrag blocks here'}
        </p>
      </div>
    </div>
  );
}
