'use client';

/**
 * DevSidebar — only visible in development (NODE_ENV=development).
 * A collapsible sidebar pinned to the right side of every page.
 * Add to root layout; renders nothing in production.
 */

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Users, Bot, LayoutDashboard,
  Palette, Code2, Cpu,
} from 'lucide-react';

interface DevLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  desc: string;
}

const DEV_LINKS: DevLink[] = [
  {
    href: '/dev/characters',
    label: 'Characters',
    icon: <Users size={14} />,
    desc: '6 NPC designs',
  },
  {
    href: '/dev/robot',
    label: 'Robot GLTF',
    icon: <Bot size={14} />,
    desc: 'RobotExpressive model',
  },
];

// Only render in development
const IS_DEV = process.env.NODE_ENV === 'development';

export function DevSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (!IS_DEV) return null;

  // Strip locale prefix from pathname for comparison
  const cleanPath = pathname.replace(/^\/(ar|en)/, '');

  return (
    <div
      className="fixed top-1/2 right-0 z-[9999] -translate-y-1/2 flex items-center"
      style={{ pointerEvents: 'none' }}
    >
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            style={{
              pointerEvents: 'auto',
              background: 'rgba(5, 2, 20, 0.97)',
              border: '1px solid rgba(124,58,237,0.4)',
              borderRight: 'none',
              borderRadius: '12px 0 0 12px',
              minWidth: 180,
              boxShadow: '-8px 0 40px rgba(80,30,200,0.3)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '10px 14px 8px',
                borderBottom: '1px solid rgba(124,58,237,0.2)',
              }}
            >
              <div className="flex items-center gap-2">
                <Cpu size={12} color="#7C3AED" />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: '0.15em',
                    color: '#7C3AED',
                    textTransform: 'uppercase',
                  }}
                >
                  Dev Tools
                </span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 9,
                    color: 'rgba(196,181,253,0.4)',
                    fontFamily: 'monospace',
                  }}
                >
                  NODE_ENV=dev
                </span>
              </div>
            </div>

            {/* Links */}
            <div style={{ padding: '8px 0' }}>
              {DEV_LINKS.map((link) => {
                const isActive = cleanPath.startsWith(link.href);
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 14px',
                      textDecoration: 'none',
                      background: isActive
                        ? 'rgba(124,58,237,0.18)'
                        : 'transparent',
                      borderLeft: isActive
                        ? '2px solid #7C3AED'
                        : '2px solid transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.08)';
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <span style={{ color: isActive ? '#A78BFA' : 'rgba(196,181,253,0.5)', flexShrink: 0 }}>
                      {link.icon}
                    </span>
                    <div>
                      <p style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: isActive ? '#C4B5FD' : 'rgba(255,255,255,0.75)',
                        margin: 0,
                        lineHeight: 1.2,
                      }}>
                        {link.label}
                      </p>
                      <p style={{
                        fontSize: 10,
                        color: 'rgba(196,181,253,0.4)',
                        margin: 0,
                        marginTop: 1,
                      }}>
                        {link.desc}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Current route */}
            <div
              style={{
                padding: '8px 14px',
                borderTop: '1px solid rgba(124,58,237,0.15)',
              }}
            >
              <p style={{ fontSize: 9, color: 'rgba(196,181,253,0.35)', margin: 0, fontFamily: 'monospace' }}>
                current
              </p>
              <p style={{ fontSize: 10, color: 'rgba(196,181,253,0.6)', margin: '2px 0 0', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {cleanPath || '/'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle tab */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scaleY: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: open ? 'rgba(124,58,237,0.9)' : 'rgba(30,10,70,0.95)',
          border: '1px solid rgba(124,58,237,0.5)',
          borderRight: 'none',
          borderRadius: '10px 0 0 10px',
          padding: '10px 8px',
          cursor: 'pointer',
          color: '#C4B5FD',
          boxShadow: '-4px 0 20px rgba(80,30,200,0.25)',
          flexDirection: 'column',
          writingMode: 'vertical-rl',
        }}
        aria-label="Toggle dev sidebar"
      >
        <span style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          transform: 'rotate(180deg)',
        }}>
          DEV
        </span>
        <span style={{ transform: 'rotate(180deg)', marginTop: 4, opacity: 0.7 }}>
          {open ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
        </span>
      </motion.button>
    </div>
  );
}
