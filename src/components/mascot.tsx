"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getDir, isRTL } from "@/lib/i18n/locale-utils";
import { X, MessageCircle } from "lucide-react";
import { MascotChat } from "@/components/mascot-chat";
import { streamClient } from "@/lib/api/stream-client";

type Mood = "idle" | "happy" | "thinking";

interface Waypoint {
  x: number; // % from left (viewport)
  y: number; // % from top (viewport)
  mood: Mood;
  message: string | null; // i18n key from 'mascot' namespace
  stayMs: number;
}

// NPC patrol patterns — x/y are viewport percentages
const PATROLS: Record<string, Waypoint[]> = {
  login: [
    { x: 74, y: 66, mood: "happy", stayMs: 4000, message: "patrol.login.0" },
    { x: 40, y: 66, mood: "idle", stayMs: 3500, message: "patrol.login.1" },
    { x: 74, y: 72, mood: "idle", stayMs: 5000, message: null },
  ],
  register: [
    { x: 74, y: 63, mood: "happy", stayMs: 4000, message: "patrol.register.0" },
    { x: 40, y: 63, mood: "idle", stayMs: 3500, message: "patrol.register.1" },
    { x: 74, y: 72, mood: "idle", stayMs: 5000, message: null },
  ],
  dashboard: [
    {
      x: 74,
      y: 64,
      mood: "happy",
      stayMs: 4000,
      message: "patrol.dashboard.0",
    },
    { x: 10, y: 64, mood: "idle", stayMs: 4000, message: "patrol.dashboard.1" },
    {
      x: 40,
      y: 72,
      mood: "thinking",
      stayMs: 4000,
      message: "patrol.dashboard.2",
    },
  ],
  lessons: [
    { x: 8, y: 58, mood: "idle", stayMs: 4000, message: "patrol.lessons.0" },
    { x: 74, y: 65, mood: "happy", stayMs: 4000, message: "patrol.lessons.1" },
    { x: 40, y: 72, mood: "idle", stayMs: 5000, message: null },
  ],
  agents: [
    { x: 74, y: 65, mood: "happy", stayMs: 4000, message: "patrol.agents.0" },
    { x: 40, y: 72, mood: "idle", stayMs: 5000, message: null },
    { x: 74, y: 72, mood: "idle", stayMs: 6000, message: null },
  ],
  leaderboard: [
    {
      x: 74,
      y: 55,
      mood: "happy",
      stayMs: 4000,
      message: "patrol.leaderboard.0",
    },
    {
      x: 12,
      y: 60,
      mood: "thinking",
      stayMs: 4000,
      message: "patrol.leaderboard.1",
    },
    { x: 44, y: 70, mood: "idle", stayMs: 5000, message: null },
  ],
  sandbox: [
    { x: 74, y: 65, mood: "happy", stayMs: 4000, message: "patrol.sandbox.0" },
    { x: 12, y: 65, mood: "idle", stayMs: 4000, message: "patrol.sandbox.1" },
    { x: 44, y: 72, mood: "thinking", stayMs: 5000, message: null },
  ],
  profile: [
    { x: 74, y: 60, mood: "happy", stayMs: 4000, message: "patrol.profile.0" },
    { x: 44, y: 72, mood: "idle", stayMs: 6000, message: null },
  ],
  default: [
    { x: 75, y: 68, mood: "happy", stayMs: 4000, message: "patrol.default.0" },
    { x: 15, y: 65, mood: "idle", stayMs: 5000, message: "patrol.default.1" },
    { x: 45, y: 72, mood: "thinking", stayMs: 4000, message: null },
  ],
};

function getRouteKey(pathname: string): string {
  if (pathname.includes("/login")) return "login";
  if (pathname.includes("/register")) return "register";
  if (pathname.includes("/dashboard")) return "dashboard";
  if (pathname.includes("/leaderboard")) return "leaderboard";
  if (pathname.includes("/sandbox")) return "sandbox";
  if (pathname.includes("/lessons")) return "lessons";
  if (pathname.includes("/agents")) return "agents";
  if (pathname.includes("/profile")) return "profile";
  return "default";
}

// ─── Robot SVG ─────────────────────────────────────────────────────────────

function RobotSVG({
  mood,
  walking,
  prefersReduced,
}: {
  mood: Mood;
  walking: boolean;
  prefersReduced: boolean;
}) {
  return (
    <svg
      viewBox="0 0 80 108"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-lg"
    >
      <defs>
        <radialGradient id="zkm-head" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
        <radialGradient id="zkm-body" cx="45%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#5B21B6" />
        </radialGradient>
        <radialGradient id="zkm-eye" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </radialGradient>
        <filter id="zkm-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="zkm-shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* Antenna */}
      <rect x="37" y="4" width="6" height="12" rx="3" fill="#7C3AED" />
      <circle cx="40" cy="4" r="5" fill="#FCD34D" filter="url(#zkm-glow)" />

      {/* Arms */}
      <motion.g
        style={{ transformOrigin: "8px 62px" }}
        animate={
          prefersReduced
            ? {}
            : mood === "happy" && !walking
              ? { rotate: [-30, 10, -30] }
              : { rotate: walking ? [-10, 10, -10] : 0 }
        }
        transition={
          prefersReduced
            ? {}
            : mood === "happy" && !walking
              ? { repeat: Infinity, duration: 0.55, ease: "easeInOut" }
              : walking
                ? { repeat: Infinity, duration: 0.36, ease: "easeInOut" }
                : { duration: 0.3 }
        }
      >
        <rect
          x="2"
          y="58"
          width="12"
          height="22"
          rx="6"
          fill="url(#zkm-body)"
        />
        <rect
          x="2"
          y="58"
          width="12"
          height="22"
          rx="6"
          fill="url(#zkm-shine)"
        />
      </motion.g>
      <motion.g
        style={{ transformOrigin: "72px 62px" }}
        animate={
          prefersReduced
            ? {}
            : mood === "happy" && !walking
              ? { rotate: [30, -10, 30] }
              : { rotate: walking ? [10, -10, 10] : 0 }
        }
        transition={
          prefersReduced
            ? {}
            : mood === "happy" && !walking
              ? { repeat: Infinity, duration: 0.55, ease: "easeInOut" }
              : walking
                ? { repeat: Infinity, duration: 0.36, ease: "easeInOut" }
                : { duration: 0.3 }
        }
      >
        <rect
          x="66"
          y="58"
          width="12"
          height="22"
          rx="6"
          fill="url(#zkm-body)"
        />
        <rect
          x="66"
          y="58"
          width="12"
          height="22"
          rx="6"
          fill="url(#zkm-shine)"
        />
      </motion.g>

      {/* Body */}
      <motion.g
        animate={
          prefersReduced ? {} : walking ? { rotateZ: [0, 3, 0, -3, 0] } : {}
        }
        transition={
          prefersReduced
            ? {}
            : walking
              ? { repeat: Infinity, duration: 0.36, ease: "easeInOut" }
              : {}
        }
      >
        <rect
          x="14"
          y="54"
          width="52"
          height="38"
          rx="12"
          fill="url(#zkm-body)"
        />
        <rect
          x="14"
          y="54"
          width="52"
          height="38"
          rx="12"
          fill="url(#zkm-shine)"
        />
        <rect
          x="24"
          y="62"
          width="32"
          height="22"
          rx="6"
          fill="rgba(0,0,0,0.2)"
        />
        <circle cx="33" cy="70" r="4" fill="#FCD34D" filter="url(#zkm-glow)" />
        <circle cx="47" cy="70" r="4" fill="#34D399" filter="url(#zkm-glow)" />
        <rect
          x="28"
          y="77"
          width="24"
          height="4"
          rx="2"
          fill="rgba(255,255,255,0.2)"
        />
      </motion.g>

      {/* Neck */}
      <rect x="29" y="47" width="22" height="9" rx="4" fill="#7C3AED" />

      {/* Head */}
      <rect
        x="10"
        y="14"
        width="60"
        height="35"
        rx="16"
        fill="url(#zkm-head)"
      />
      <rect
        x="10"
        y="14"
        width="60"
        height="35"
        rx="16"
        fill="url(#zkm-shine)"
      />
      <circle cx="10" cy="30" r="5" fill="#5B21B6" />
      <circle cx="70" cy="30" r="5" fill="#5B21B6" />

      {/* Eyes */}
      {mood === "happy" && !walking ? (
        <>
          <path
            d="M20 32 Q27 25 34 32"
            stroke="#FCD34D"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            filter="url(#zkm-glow)"
          />
          <path
            d="M46 32 Q53 25 60 32"
            stroke="#FCD34D"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            filter="url(#zkm-glow)"
          />
        </>
      ) : mood === "thinking" ? (
        <>
          <ellipse cx="27" cy="31" rx="8" ry="8" fill="url(#zkm-eye)" />
          <circle cx="29.5" cy="28.5" r="3" fill="white" opacity="0.85" />
          <circle cx="27" cy="31" r="2" fill="#1E40AF" />
          <ellipse cx="53" cy="31" rx="8" ry="5" fill="url(#zkm-eye)" />
          <circle cx="55.5" cy="29" r="2.5" fill="white" opacity="0.85" />
          <rect
            x="45"
            y="24"
            width="16"
            height="8"
            rx="4"
            fill="url(#zkm-head)"
          />
        </>
      ) : (
        <>
          <ellipse cx="27" cy="31" rx="8" ry="8" fill="url(#zkm-eye)" />
          <circle cx="29.5" cy="28.5" r="3" fill="white" opacity="0.85" />
          <circle cx="27" cy="31" r="2" fill="#1E40AF" />
          <ellipse cx="53" cy="31" rx="8" ry="8" fill="url(#zkm-eye)" />
          <circle cx="55.5" cy="28.5" r="3" fill="white" opacity="0.85" />
          <circle cx="53" cy="31" r="2" fill="#1E40AF" />
        </>
      )}
      {mood === "happy" && !walking ? (
        <path
          d="M29 43 Q40 50 51 43"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      ) : mood === "thinking" ? (
        <path
          d="M31 44 Q40 42 49 44"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <path
          d="M30 43 Q40 48 50 43"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* Legs — walking stride vs idle hang */}
      {walking ? (
        <>
          <motion.g
            style={{ transformOrigin: "29px 91px" }}
            animate={prefersReduced ? {} : { rotate: [22, -22] }}
            transition={
              prefersReduced
                ? {}
                : {
                    repeat: Infinity,
                    duration: 0.36,
                    ease: "easeInOut",
                    repeatType: "reverse",
                  }
            }
          >
            <rect x="21" y="90" width="16" height="16" rx="7" fill="#5B21B6" />
            <rect
              x="18"
              y="100"
              width="22"
              height="7"
              rx="3.5"
              fill="#4C1D95"
            />
          </motion.g>
          <motion.g
            style={{ transformOrigin: "51px 91px" }}
            animate={prefersReduced ? {} : { rotate: [-22, 22] }}
            transition={
              prefersReduced
                ? {}
                : {
                    repeat: Infinity,
                    duration: 0.36,
                    ease: "easeInOut",
                    repeatType: "reverse",
                  }
            }
          >
            <rect x="43" y="90" width="16" height="16" rx="7" fill="#5B21B6" />
            <rect
              x="40"
              y="100"
              width="22"
              height="7"
              rx="3.5"
              fill="#4C1D95"
            />
          </motion.g>
        </>
      ) : (
        <>
          <rect x="21" y="90" width="16" height="16" rx="7" fill="#5B21B6" />
          <rect x="43" y="90" width="16" height="16" rx="7" fill="#5B21B6" />
          <rect x="18" y="100" width="22" height="7" rx="3.5" fill="#4C1D95" />
          <rect x="40" y="100" width="22" height="7" rx="3.5" fill="#4C1D95" />
        </>
      )}
    </svg>
  );
}

// ─── NPC Mascot ───────────────────────────────────────────────────────────────

export function Mascot() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("mascot");
  const prefersReduced = useReducedMotion() ?? false;

  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ x: 74, y: 72 });
  const [walkDuration, setWalkDuration] = useState(0.05);
  const [facingLeft, setFacingLeft] = useState(true);
  const [mood, setMood] = useState<Mood>("idle");
  const [isWalking, setIsWalking] = useState(false);
  const [bubbleMsg, setBubbleMsg] = useState<string | null>(null);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [isSmall, setIsSmall] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [aiBubble, setAiBubble] = useState("");
  const aiBubbleAbortRef = useRef<AbortController | null>(null);

  const currentPosRef = useRef({ x: 74, y: 72 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activeRef = useRef(false);

  const hide = pathname.includes("/onboarding");

  // Fetch a short AI greeting for the current page (fires once per route change)
  const fetchAiBubble = useCallback(
    async (routeKey: string) => {
      aiBubbleAbortRef.current?.abort();
      const controller = new AbortController();
      aiBubbleAbortRef.current = controller;
      setAiBubble("");

      const prompt =
        locale === "ar"
          ? `قول جملة واحدة قصيرة بالعامية المصرية (8 كلمات بالأقصى) مناسبة لصفحة "${routeKey}" في منصة تعليمية للأطفال.`
          : `Say one short encouraging sentence (max 8 words) for the "${routeKey}" page of a kids learning platform.`;

      try {
        await streamClient.sse<{ text?: string }>(
          "/api/v1/mascot",
          {
            Messages: [{ role: "user", content: prompt }],
            Pathname: pathname,
            Locale: locale,
          },
          {
            signal: controller.signal,
            onEvent: (event) => {
              if (event.text) setAiBubble((prev) => prev + event.text);
            },
          },
        );
      } catch {
        /* silently ignore — bubble stays empty, static fallback shows */
      }
    },
    [locale, pathname],
  );

  useEffect(() => {
    setMounted(true);
    const check = () => setIsSmall(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!mounted || hide) return;

    activeRef.current = true;
    clearTimeout(timerRef.current);

    const routeKey = getRouteKey(pathname);

    // On small screens: stay at bottom-right and just wave
    const waypoints: Waypoint[] = isSmall
      ? [
          {
            x: 74,
            y: 75,
            mood: "happy",
            stayMs: 5000,
            message: "patrol.small.0",
          },
          { x: 74, y: 75, mood: "idle", stayMs: 8000, message: null },
        ]
      : (PATROLS[routeKey] ?? PATROLS.default);

    let wpIndex = 0;

    // Recursive patrol loop
    function runLoop() {
      if (!activeRef.current) return;

      const wp = waypoints[wpIndex];
      setIsWalking(false);
      setMood(wp.mood);

      if (wp.message) {
        setBubbleMsg(wp.message);
        setBubbleOpen(true);
      } else {
        setBubbleOpen(false);
      }

      timerRef.current = setTimeout(() => {
        if (!activeRef.current) return;
        setBubbleOpen(false);

        timerRef.current = setTimeout(() => {
          if (!activeRef.current) return;

          wpIndex = (wpIndex + 1) % waypoints.length;
          const next = waypoints[wpIndex];

          const dx = next.x - currentPosRef.current.x;
          const dy = next.y - currentPosRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const durSec = Math.max(0.55, dist * 0.023);

          setFacingLeft(dx < 0);
          setIsWalking(true);
          setMood("idle");
          setBubbleOpen(false);
          setWalkDuration(durSec);
          setPos({ x: next.x, y: next.y });
          currentPosRef.current = { x: next.x, y: next.y };

          timerRef.current = setTimeout(runLoop, durSec * 1000 + 50);
        }, 350);
      }, wp.stayMs);
    }

    // Walk to first waypoint of this route, then begin loop
    const firstWp = waypoints[0];
    const dx0 = firstWp.x - currentPosRef.current.x;
    const dy0 = firstWp.y - currentPosRef.current.y;
    const dist0 = Math.sqrt(dx0 * dx0 + dy0 * dy0);
    const dur0 = dist0 > 3 ? Math.max(0.55, dist0 * 0.023) : 0.05;

    setFacingLeft(dx0 < 0);
    setIsWalking(dist0 > 3);
    setMood("idle");
    setWalkDuration(dur0);
    setPos({ x: firstWp.x, y: firstWp.y });
    currentPosRef.current = { x: firstWp.x, y: firstWp.y };

    timerRef.current = setTimeout(
      () => {
        if (!activeRef.current) return;
        setIsWalking(false);
        setMood("happy");
        // Fetch AI greeting once the mascot has settled on this page
        fetchAiBubble(routeKey);
        timerRef.current = setTimeout(runLoop, 600);
      },
      dur0 * 1000 + 50,
    );

    return () => {
      activeRef.current = false;
      clearTimeout(timerRef.current);
      aiBubbleAbortRef.current?.abort();
    };
  }, [pathname, mounted, hide, isSmall, fetchAiBubble]);

  if (!mounted || hide) return null;

  const toggleChat = () => {
    setBubbleOpen(false);
    setChatOpen((prev) => !prev);
  };

  return (
    <>
      <motion.div
        className="fixed z-40"
        style={{ width: 56, height: 72 }}
        animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        transition={{ duration: walkDuration, ease: "linear" }}
      >
        {/* Speech bubble — anchored to robot */}
        <AnimatePresence>
          {((bubbleOpen && !!bubbleMsg) || !!aiBubble) && (
            <motion.div
              key="bubble"
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 10 }}
              transition={{ type: "spring", damping: 16, stiffness: 280 }}
              className="absolute pointer-events-auto"
              style={{
                bottom: "110%",
                [isRTL(locale) ? "right" : "left"]: 0,
                marginBottom: 12,
                width: 200,
              }}
            >
              <div
                className="relative rounded-2xl px-4 py-3 text-sm font-semibold leading-snug shadow-xl"
                style={{
                  background: "var(--surface)",
                  border: "1.5px solid var(--zkawi-pink)",
                  color: "var(--text)",
                  direction: getDir(locale),
                }}
              >
                <button
                  onClick={() => {
                    setBubbleOpen(false);
                    setAiBubble("");
                  }}
                  aria-label={
                    locale === "ar" ? "إغلاق الرسالة" : "Close message"
                  }
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: "var(--border)",
                    color: "var(--text-muted)",
                  }}
                >
                  <X size={10} />
                </button>
                {aiBubble || (bubbleMsg ? t(bubbleMsg) : "")}
                <div
                  className="absolute -bottom-[9px] right-3 w-4 h-4 rotate-45"
                  style={{
                    background: "var(--surface)",
                    borderRight: "1.5px solid var(--zkawi-pink)",
                    borderBottom: "1.5px solid var(--zkawi-pink)",
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Robot */}
        <motion.div
          className="pointer-events-auto cursor-pointer w-full h-full relative"
          style={{ scaleX: facingLeft ? -1 : 1 }}
          animate={
            prefersReduced
              ? {}
              : isWalking
                ? { y: [0, -5, 0, -5, 0] }
                : { y: [0, -7, 0] }
          }
          transition={
            prefersReduced
              ? {}
              : isWalking
                ? { repeat: Infinity, duration: 0.32, ease: "easeInOut" }
                : { repeat: Infinity, duration: 2.6, ease: "easeInOut" }
          }
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          role="button"
          tabIndex={0}
          aria-label={
            locale === "ar" ? "فتح محادثة مع ذكي" : "Open chat with Zaki"
          }
          aria-expanded={chatOpen}
          onClick={toggleChat}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleChat();
            }
          }}
        >
          {/* Ground shadow */}
          <motion.div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: 36,
              height: 7,
              background: "rgba(109,40,217,0.35)",
              filter: "blur(5px)",
            }}
            animate={
              prefersReduced
                ? {}
                : { scaleX: isWalking ? [1, 0.75, 1] : [1, 0.7, 1] }
            }
            transition={
              prefersReduced
                ? {}
                : { repeat: Infinity, duration: isWalking ? 0.32 : 2.6 }
            }
          />
          <RobotSVG
            mood={mood}
            walking={isWalking}
            prefersReduced={prefersReduced}
          />

          {/* Chat badge — shows when chat is closed */}
          <AnimatePresence>
            {!chatOpen && (
              <motion.div
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  background: "var(--zkawi-pink)",
                  scaleX: facingLeft ? -1 : 1,
                }}
              >
                <MessageCircle size={10} color="white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Chat popup — rendered at root level, not inside the moving mascot */}
      <MascotChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
