'use client';
import { useEffect, useRef } from 'react';

interface BlockEditorProps {
  locale: string;
  ageGroup?: 'spark' | 'explorer' | 'builder';
  onCodeChange?: (code: string) => void;
}

export default function BlockEditor({ locale, ageGroup = 'explorer', onCodeChange }: BlockEditorProps) {
  const isRtl = locale === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);

  // Placeholder — Blockly will be loaded here in Phase 2
  // When Blockly is integrated: import * as Blockly from 'blockly/ar'
  // and call Blockly.inject(containerRef.current, workspaceOptions)

  const placeholderBlocks = ageGroup === 'spark'
    ? ['▶ ابدأ', '🔄 كرر', '🛑 اوقف']
    : ageGroup === 'explorer'
    ? ['▶ ابدأ', '🔄 كرر X مرات', '❓ إذا', '📦 متغير', '🛑 اوقف']
    : ['▶ ابدأ', '🔄 حلقة while', '❓ إذا/وإلا', '📦 متغير', '⚡ دالة', '📋 قائمة', '🛑 اوقف'];

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="flex gap-3 h-64 rounded-2xl overflow-hidden border-2 border-gray-200">
      {/* Block palette */}
      <div className="w-32 bg-gray-50 border-e border-gray-200 p-2 overflow-y-auto">
        <p className="text-xs text-gray-400 mb-2">{isRtl ? 'البلوكات' : 'Blocks'}</p>
        <div className="space-y-1">
          {placeholderBlocks.map(block => (
            <div
              key={block}
              draggable
              className="px-2 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium cursor-grab select-none hover:bg-blue-200"
            >
              {block}
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 bg-white p-3 flex items-center justify-center">
        <p className="text-sm text-gray-400 text-center">
          {isRtl ? '🔜 محرر البلوكات قيد البناء\nاسحب البلوكات هنا' : '🔜 Block editor coming soon\nDrag blocks here'}
        </p>
      </div>
    </div>
  );
}
