'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';

// ─── Context-aware messages ───────────────────────────────────────────────────
const ROUTE_MESSAGES: Record<string, { ar: string; en: string }> = {
  login:       { ar: 'أهلاً! سجّل دخولك وكمل مغامرتك 🚀', en: 'Hi! Log in to continue your adventure 🚀' },
  register:    { ar: 'أهلاً! انضم مجاناً وابدأ رحلة الذكاء الاصطناعي ✨', en: 'Join for free and start your AI journey! ✨' },
  dashboard:   { ar: 'جاهز تكسب XP النهارده؟ يلا نذاكر! 💪', en: 'Ready to earn XP today? Let\'s go! 💪' },
  onboarding:  { ar: 'يلا نشوف إيه اللي يناسبك تماماً 🎯', en: "Let's find what suits you perfectly! 🎯" },
  leaderboard: { ar: 'شوف مكانك! تقدر تتصدر اللوحة 🏆', en: 'Check your rank! You can reach #1 🏆' },
  sandbox:     { ar: 'جرّب تتكلم مع Claude مباشرة! 🤖', en: 'Try chatting with Claude directly! 🤖' },
  lessons:     { ar: 'ركّز! هتكسب XP لما تخلص الكويز 🎯', en: "Focus! You'll earn XP after the quiz! 🎯" },
  agents:      { ar: 'اختار الدرس اللي يناسبك وابدأ! 📚', en: 'Pick a lesson and start learning! 📚' },
  profile:     { ar: 'شوف إنجازاتك وشاركها مع أصحابك! 🌟', en: 'Check your achievements and share them! 🌟' },
  default:     { ar: 'مرحباً! أنا ذكي، مرشدك الشخصي 🌟', en: "Hi! I'm Zaki, your personal guide! 🌟" },
};

function getRouteKey(pathname: string): string {
  if (pathname.includes('/login'))       return 'login';
  if (pathname.includes('/register'))    return 'register';
  if (pathname.includes('/dashboard'))   return 'dashboard';
  if (pathname.includes('/onboarding'))  return 'onboarding';
  if (pathname.includes('/leaderboard')) return 'leaderboard';
  if (pathname.includes('/sandbox'))     return 'sandbox';
  if (pathname.includes('/lessons'))     return 'lessons';
  if (pathname.includes('/agents'))      return 'agents';
  if (pathname.includes('/profile'))     return 'profile';
  return 'default';
}

// ─── Robot SVG ─────────────────────────────────────────────────────────────
type Mood = 'idle' | 'happy' | 'thinking';

function RobotSVG({ mood }: { mood: Mood }) {
  return (
    <svg viewBox="0 0 80 108" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
      <defs>
        <radialGradient id="zk-head" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
        <radialGradient id="zk-body" cx="45%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#5B21B6" />
        </radialGradient>
        <radialGradient id="zk-eye" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </radialGradient>
        <filter id="zk-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="zk-shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* Floor shadow */}
      <ellipse cx="40" cy="104" rx="22" ry="4" fill="rgba(109,40,217,0.2)" />

      {/* Antenna */}
      <rect x="37" y="4" width="6" height="12" rx="3" fill="#7C3AED" />
      <circle cx="40" cy="4" r="5" fill="#FCD34D" filter="url(#zk-glow)" />

      {/* Left arm */}
      <motion.g
        style={{ originX: '8px', originY: '58px' }}
        animate={mood === 'happy' ? { rotate: [-25, 5, -25] } : { rotate: 0 }}
        transition={mood === 'happy' ? { repeat: Infinity, duration: 0.55, ease: 'easeInOut' } : { duration: 0.3 }}
      >
        <rect x="2" y="58" width="12" height="22" rx="6" fill="url(#zk-body)" />
        <rect x="2" y="58" width="12" height="22" rx="6" fill="url(#zk-shine)" />
      </motion.g>

      {/* Right arm */}
      <motion.g
        style={{ originX: '72px', originY: '58px' }}
        animate={mood === 'happy' ? { rotate: [25, -5, 25] } : { rotate: 0 }}
        transition={mood === 'happy' ? { repeat: Infinity, duration: 0.55, ease: 'easeInOut' } : { duration: 0.3 }}
      >
        <rect x="66" y="58" width="12" height="22" rx="6" fill="url(#zk-body)" />
        <rect x="66" y="58" width="12" height="22" rx="6" fill="url(#zk-shine)" />
      </motion.g>

      {/* Body */}
      <rect x="14" y="54" width="52" height="38" rx="12" fill="url(#zk-body)" />
      <rect x="14" y="54" width="52" height="38" rx="12" fill="url(#zk-shine)" />

      {/* Chest panel */}
      <rect x="24" y="62" width="32" height="22" rx="6" fill="rgba(0,0,0,0.2)" />
      {/* Chest lights */}
      <circle cx="33" cy="70" r="4" fill="#FCD34D" filter="url(#zk-glow)" />
      <circle cx="47" cy="70" r="4" fill="#34D399" filter="url(#zk-glow)" />
      {/* Chest speaker bar */}
      <rect x="28" y="77" width="24" height="4" rx="2" fill="rgba(255,255,255,0.2)" />

      {/* Neck */}
      <rect x="29" y="47" width="22" height="9" rx="4" fill="#7C3AED" />

      {/* Head */}
      <rect x="10" y="14" width="60" height="35" rx="16" fill="url(#zk-head)" />
      <rect x="10" y="14" width="60" height="35" rx="16" fill="url(#zk-shine)" />

      {/* Ear bolts */}
      <circle cx="10" cy="30" r="5" fill="#5B21B6" />
      <circle cx="70" cy="30" r="5" fill="#5B21B6" />

      {/* Eyes */}
      {mood === 'happy' ? (
        <>
          {/* Happy arcs */}
          <path d="M20 32 Q27 25 34 32" stroke="#FCD34D" strokeWidth="3.5" strokeLinecap="round" fill="none" filter="url(#zk-glow)" />
          <path d="M46 32 Q53 25 60 32" stroke="#FCD34D" strokeWidth="3.5" strokeLinecap="round" fill="none" filter="url(#zk-glow)" />
        </>
      ) : mood === 'thinking' ? (
        <>
          {/* One eye half-closed */}
          <ellipse cx="27" cy="31" rx="8" ry="8" fill="url(#zk-eye)" />
          <circle cx="29.5" cy="28.5" r="3" fill="white" opacity="0.85" />
          <circle cx="27" cy="31" r="2" fill="#1E40AF" />
          {/* Half-closed eye */}
          <ellipse cx="53" cy="31" rx="8" ry="5" fill="url(#zk-eye)" />
          <circle cx="55.5" cy="29" r="2.5" fill="white" opacity="0.85" />
          <circle cx="53" cy="31" r="1.5" fill="#1E40AF" />
          {/* Eyelid */}
          <rect x="45" y="24" width="16" height="8" rx="4" fill="url(#zk-head)" />
        </>
      ) : (
        <>
          {/* Normal eyes */}
          <ellipse cx="27" cy="31" rx="8" ry="8" fill="url(#zk-eye)" />
          <circle cx="29.5" cy="28.5" r="3" fill="white" opacity="0.85" />
          <circle cx="27" cy="31" r="2" fill="#1E40AF" />
          <ellipse cx="53" cy="31" rx="8" ry="8" fill="url(#zk-eye)" />
          <circle cx="55.5" cy="28.5" r="3" fill="white" opacity="0.85" />
          <circle cx="53" cy="31" r="2" fill="#1E40AF" />
        </>
      )}

      {/* Mouth */}
      {mood === 'happy' ? (
        <path d="M29 43 Q40 50 51 43" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      ) : mood === 'thinking' ? (
        <path d="M31 44 Q40 42 49 44" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M30 43 Q40 48 50 43" stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}

      {/* Legs */}
      <rect x="21" y="90" width="16" height="16" rx="8" fill="#5B21B6" />
      <rect x="43" y="90" width="16" height="16" rx="8" fill="#5B21B6" />
      {/* Shoes */}
      <rect x="18" y="99" width="22" height="8" rx="4" fill="#4C1D95" />
      <rect x="40" y="99" width="22" height="8" rx="4" fill="#4C1D95" />
    </svg>
  );
}

// ─── Main Mascot Component ────────────────────────────────────────────────────

/**
 * "ذكي" (Zaki) — the floating robot guide.
 * Future: swap the static message with a streaming Claude API call
 * when the user clicks the robot, passing the current route as context.
 */
export function Mascot() {
  const pathname = usePathname();
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [mood, setMood] = useState<Mood>('idle');

  const routeKey = getRouteKey(pathname);
  const message = ROUTE_MESSAGES[routeKey]?.[isAr ? 'ar' : 'en'] ?? ROUTE_MESSAGES.default[isAr ? 'ar' : 'en'];

  // On route change: wave + show bubble briefly
  useEffect(() => {
    setMood('happy');
    setBubbleOpen(true);
    const t1 = setTimeout(() => setMood('idle'), 1800);
    const t2 = setTimeout(() => setBubbleOpen(false), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [pathname]);

  const handleRobotClick = () => {
    if (!bubbleOpen) {
      setMood('happy');
      setBubbleOpen(true);
      setTimeout(() => setMood('idle'), 1000);
      // Future hook point: trigger Claude API streaming response here
    } else {
      setBubbleOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 end-6 z-40 flex flex-col items-end gap-3" dir="ltr">
      {/* Speech bubble */}
      <AnimatePresence>
        {bubbleOpen && (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, scale: 0.75, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: 12 }}
            transition={{ type: 'spring', damping: 18, stiffness: 300 }}
            className="relative max-w-[210px] rounded-2xl rounded-br-none px-4 py-3 shadow-xl text-sm font-semibold leading-snug"
            style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--zkawi-purple)',
              color: 'var(--text)',
              direction: isAr ? 'rtl' : 'ltr',
            }}
          >
            {/* Close */}
            <button
              onClick={() => setBubbleOpen(false)}
              className="absolute -top-2 -end-2 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'var(--border)', color: 'var(--text-muted)' }}
            >
              <X size={10} />
            </button>

            {message}

            {/* Tail */}
            <div
              className="absolute -bottom-[9px] end-0 w-4 h-4 rotate-45"
              style={{
                background: 'var(--surface)',
                borderRight: '1.5px solid var(--zkawi-purple)',
                borderBottom: '1.5px solid var(--zkawi-purple)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Robot body */}
      <div className="relative">
        {/* Pulsing glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'rgba(124,58,237,0.2)', filter: 'blur(8px)', zIndex: -1 }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        />

        {/* The robot */}
        <motion.button
          onClick={handleRobotClick}
          className="relative w-14 h-[4.5rem] cursor-pointer select-none outline-none"
          aria-label={isAr ? 'المساعد الشخصي ذكي' : 'Personal guide Zaki'}
          animate={{ y: [0, -7, 0], rotateZ: [0, -1.5, 1.5, 0] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
          whileHover={{ scale: 1.12, rotateZ: 0 }}
          whileTap={{ scale: 0.92 }}
        >
          {/* Pseudo-3D floor shadow */}
          <motion.div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: 36, height: 7, background: 'rgba(109,40,217,0.35)', filter: 'blur(5px)' }}
            animate={{ scaleX: [1, 0.75, 1], opacity: [0.7, 0.3, 0.7] }}
            transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
          />
          <RobotSVG mood={mood} />
        </motion.button>

        {/* Notification dot when bubble is closed */}
        <AnimatePresence>
          {!bubbleOpen && (
            <motion.div
              key="notif"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -end-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'var(--zkawi-purple)' }}
            >
              <MessageCircle size={10} color="white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
