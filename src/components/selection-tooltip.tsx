'use client';

/**
 * SelectionTooltip
 * Shows a small "Explain with Zaki ✨" button above any text the user highlights.
 * Clicking it opens the mascot dialogue and sends the selected text for analysis.
 * Only appears for selections of ≥ 5 characters outside UI elements.
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface TooltipPos {
  x: number;
  y: number;
  text: string;
}

export function SelectionTooltip() {
  const locale = useLocale();
  const [tooltip, setTooltip] = useState<TooltipPos | null>(null);

  const label = locale === 'ar' ? 'اشرح مع ذكي ✨' : 'Explain with Zaki ✨';

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { setTooltip(null); return; }

    const text = sel.toString().trim();
    if (text.length < 5) { setTooltip(null); return; }

    // Skip selections inside mascot UI, chat, buttons, inputs
    const anchor = sel.anchorNode?.parentElement;
    if (anchor?.closest('[data-mascot], [data-dialogue], button, a, input, textarea, select, [role="dialog"]')) {
      setTooltip(null);
      return;
    }

    // Position tooltip above the selection
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) { setTooltip(null); return; }

    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY - 42,
      text,
    });
  }, []);

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.toString().trim().length < 5) {
      setTooltip(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleMouseUp, handleSelectionChange]);

  const handleClick = () => {
    if (!tooltip) return;
    const { text } = tooltip;
    setTooltip(null);
    window.getSelection()?.removeAllRanges();

    // Open mascot dialogue and send the selected text
    window.dispatchEvent(new CustomEvent('zkawi:open_chat', {}));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('zkawi:auto_send', {
        detail: {
          message: locale === 'ar'
            ? `اشرح لي بأسلوب بسيط: "${text}"`
            : `Explain this simply: "${text}"`,
        },
      }));
    }, 250);
  };

  return (
    <AnimatePresence>
      {tooltip && (
        <motion.button
          key="selection-tooltip"
          initial={{ opacity: 0, scale: 0.85, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 4 }}
          transition={{ duration: 0.15 }}
          onClick={handleClick}
          className="fixed z-[9998] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl select-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(124,58,237,0.5)',
            pointerEvents: 'auto',
          }}
        >
          <Sparkles size={11} />
          {label}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
