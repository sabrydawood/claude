'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PURPLE = '#7C3AED';
const GOLD = '#F59E0B';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  tag?: string;
}

const PAGES: NavItem[] = [
  { href: '/', label: 'Home', icon: '🏠', tag: 'home' },
  { href: '/ar/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/ar/dev', label: 'Dev Preview (3D Map)', icon: '🌐', tag: 'dev' },
  { href: '/ar/dev/child-journey', label: 'Child Journey Demo', icon: '🚀', tag: 'dev' },
  { href: '/ar/onboarding', label: 'Onboarding', icon: '👋' },
  { href: '/ar/agents', label: 'AI Agents', icon: '🤖' },
  { href: '/ar/tracks', label: 'Tracks', icon: '📚' },
  { href: '/ar/sandbox', label: 'Sandbox', icon: '🧪' },
  { href: '/ar/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { href: '/ar/parent', label: 'Parent Portal', icon: '👨‍👩‍👧' },
  { href: '/ar/admin', label: 'Admin', icon: '⚙️' },
];

export default function DevSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Keyboard shortcut: Ctrl+Shift+D
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setOpen(v => !v);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 9999,
          width: 44,
          height: 44,
          borderRadius: 12,
          background: open ? GOLD : PURPLE,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          boxShadow: `0 4px 20px ${open ? GOLD : PURPLE}88`,
          transition: 'background 0.2s',
        }}
        title="DEV Sidebar (Ctrl+Shift+D)"
      >
        {open ? '✕' : '🛠️'}
      </motion.button>

      {/* Sidebar panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9997,
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(2px)',
              }}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                width: 280,
                zIndex: 9998,
                background: 'linear-gradient(180deg, #0F0A30 0%, #020617 100%)',
                borderRight: '1px solid rgba(124,58,237,0.3)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '20px 20px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: PURPLE,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                  }}>
                    🤖
                  </div>
                  <div>
                    <div style={{ color: '#A78BFA', fontWeight: 800, fontSize: 16, lineHeight: 1 }}>ذكاوي</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 }}>Dev Navigation</div>
                  </div>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 99,
                    background: `${GOLD}22`,
                    color: GOLD,
                    border: `1px solid ${GOLD}44`,
                  }}>
                    DEV
                  </span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                  Ctrl+Shift+D to toggle
                </div>
              </div>

              {/* Section labels */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 80px' }}>
                {/* Dev pages */}
                <div style={{ marginBottom: 4 }}>
                  <div style={{ padding: '6px 8px', color: GOLD, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    🎮 Dev Demos
                  </div>
                  {PAGES.filter(p => p.tag === 'dev').map(p => (
                    <NavLink key={p.href} item={p} currentPath={pathname} />
                  ))}
                </div>

                {/* Main app pages */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ padding: '6px 8px', color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    📱 App Pages
                  </div>
                  {PAGES.filter(p => p.tag !== 'dev').map(p => (
                    <NavLink key={p.href} item={p} currentPath={pathname} />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: '12px 20px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(0,0,0,0.3)',
                fontSize: 11,
                color: 'rgba(255,255,255,0.3)',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span>NODE_ENV: development</span>
                <span style={{ color: PURPLE, fontWeight: 600 }}>ذكاوي v0.1</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ item, currentPath }: { item: NavItem; currentPath: string }) {
  const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
  return (
    <Link
      href={item.href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 10px',
        borderRadius: 10,
        textDecoration: 'none',
        color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
        background: isActive ? `${PURPLE}33` : 'transparent',
        border: isActive ? `1px solid ${PURPLE}55` : '1px solid transparent',
        marginBottom: 2,
        fontSize: 13.5,
        fontWeight: isActive ? 700 : 400,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
          (e.currentTarget as HTMLElement).style.color = 'white';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)';
        }
      }}
    >
      <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{item.icon}</span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {isActive && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA' }} />
      )}
    </Link>
  );
}
