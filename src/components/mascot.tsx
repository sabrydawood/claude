"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { getDir, isRTL } from "@/lib/i18n/locale-utils";
import { X, MessageCircle } from "lucide-react";
import { MascotDialogue } from "@/components/mascot-dialogue";
import { XbotExpressive } from "@/components/mascot-gltf";
import { streamClient } from "@/lib/api/stream-client";

type Mood = "idle" | "happy" | "thinking" | "talking";

// ─── Varied AI bubble prompts ──────────────────────────────────────────────────
const BUBBLE_PROMPTS: Record<"ar" | "en", Array<(p: string) => string>> = {
  ar: [
    (p) => `في جملة واحدة (8 كلمات بالأقصى)، قول كلام مشجع لطفل في صفحة "${p}".`,
    (p) => `في جملة واحدة (8 كلمات)، اسأل سؤال ممتع عن "${p}" لطفل.`,
    (p) => `في جملة واحدة (8 كلمات)، قدّم نصيحة مفيدة عن "${p}" للمتعلم.`,
    (p) => `في جملة واحدة (8 كلمات)، اطرح تحدي بسيط للطفل في صفحة "${p}".`,
  ],
  en: [
    (p) => `In one sentence (max 8 words), say something encouraging for the "${p}" page.`,
    (p) => `In one sentence (8 words), ask a fun question about "${p}" for kids.`,
    (p) => `In one sentence (8 words), share a useful tip about "${p}".`,
    (p) => `In one sentence (8 words), give a simple challenge related to "${p}".`,
  ],
};

interface Waypoint {
  x: number; // % from left (viewport)
  y: number; // % from top (viewport)
  mood: Mood;
  message: string | null; // i18n key from 'mascot' namespace
  stayMs: number;
}

// ─── 20-waypoint pool — covers full screen except header (y ≥ 15%) ─────────────
// Each waypoint is a candidate position; they get Fisher-Yates shuffled every
// cycle so movement is unpredictable. Bubble messages are spread across them.

const WAYPOINT_POOL: Waypoint[] = [
  // Left column
  { x: 6,  y: 20, mood: "happy",    stayMs: 3500, message: "patrol.pool.0" },
  { x: 8,  y: 38, mood: "idle",     stayMs: 4000, message: null },
  { x: 5,  y: 55, mood: "idle", stayMs: 4500, message: "patrol.pool.1" },
  { x: 9,  y: 72, mood: "idle",     stayMs: 3500, message: null },
  { x: 7,  y: 85, mood: "happy",    stayMs: 3000, message: "patrol.pool.2" },
  // Center-left
  { x: 24, y: 18, mood: "idle", stayMs: 4000, message: null },
  { x: 22, y: 40, mood: "happy",    stayMs: 4500, message: "patrol.pool.3" },
  { x: 26, y: 62, mood: "idle",     stayMs: 3500, message: null },
  { x: 20, y: 80, mood: "idle", stayMs: 4000, message: "patrol.pool.4" },
  // Center
  { x: 44, y: 22, mood: "happy",    stayMs: 4000, message: "patrol.pool.5" },
  { x: 42, y: 50, mood: "idle",     stayMs: 3500, message: null },
  { x: 46, y: 70, mood: "idle", stayMs: 4500, message: "patrol.pool.6" },
  { x: 40, y: 84, mood: "idle",     stayMs: 3000, message: null },
  // Center-right
  { x: 63, y: 16, mood: "idle",     stayMs: 3500, message: "patrol.pool.7" },
  { x: 65, y: 38, mood: "happy",    stayMs: 4000, message: null },
  { x: 61, y: 60, mood: "idle", stayMs: 4500, message: "patrol.pool.8" },
  { x: 67, y: 78, mood: "idle",     stayMs: 3500, message: null },
  // Right column
  { x: 80, y: 25, mood: "happy",    stayMs: 4000, message: "patrol.pool.9" },
  { x: 82, y: 50, mood: "idle",     stayMs: 3500, message: null },
  { x: 78, y: 75, mood: "idle", stayMs: 4000, message: "patrol.pool.10" },
];

/** Fisher-Yates in-place shuffle */
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

// ─── NPC Mascot ───────────────────────────────────────────────────────────────

export function Mascot() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("mascot");
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
  const [patrolKey, setPatrolKey] = useState(0);
  const aiBubbleAbortRef = useRef<AbortController | null>(null);
  const chatOpenRef = useRef(false);
  const promptIndexRef = useRef(0);
  const lastWordClickRef = useRef(0);

  const currentPosRef = useRef({ x: 74, y: 72 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activeRef = useRef(false);

  const hide = pathname.includes("/onboarding");

  // Fetch a varied AI greeting for the current page (fires once per route change)
  const fetchAiBubble = useCallback(
    async (routeKey: string) => {
      if (chatOpenRef.current) return; // don't fetch while chat is open
      aiBubbleAbortRef.current?.abort();
      const controller = new AbortController();
      aiBubbleAbortRef.current = controller;
      setAiBubble("");

      const lang = locale === "ar" ? "ar" : "en";
      const prompts = BUBBLE_PROMPTS[lang];
      const idx = promptIndexRef.current % prompts.length;
      promptIndexRef.current++;
      const prompt = prompts[idx](routeKey);

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
        /* silently ignore — static fallback shows */
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

  // Pause / resume patrol when chat opens / closes
  useEffect(() => {
    chatOpenRef.current = chatOpen;
    if (!mounted || hide) return;

    if (chatOpen) {
      activeRef.current = false;
      clearTimeout(timerRef.current);
      aiBubbleAbortRef.current?.abort();
      setIsWalking(false);
      setMood("talking");
      setAiBubble("");
      setBubbleOpen(false);

      // Same horizontal side as current position, just above the dialogue box
      const isOnLeft = currentPosRef.current.x < 50;
      const targetX = isOnLeft ? 5 : 84;

      // Compute y% so mascot sits just above the dialogue (260px default + 20px gap)
      const dialogueH = 280;
      const mascotH = 180;
      const targetYpx = (typeof window !== "undefined" ? window.innerHeight : 800) - dialogueH - mascotH;
      const targetY = Math.max(15, Math.round((targetYpx / (typeof window !== "undefined" ? window.innerHeight : 800)) * 100));

      const dx = targetX - currentPosRef.current.x;
      const dy = targetY - currentPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const dur = Math.max(0.3, dist * 0.018);

      // Face toward the same side (natural for the direction walked)
      setFacingLeft(isOnLeft);
      setIsWalking(dist > 4);
      setWalkDuration(dur);
      setPos({ x: targetX, y: targetY });
      currentPosRef.current = { x: targetX, y: targetY };
      setTimeout(() => { setIsWalking(false); setMood("talking"); }, dur * 1000 + 50);
    } else {
      // Resume patrol after a short delay
      const resume = setTimeout(() => {
        if (!chatOpenRef.current) setPatrolKey((k) => k + 1);
      }, 700);
      return () => clearTimeout(resume);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen]);

  // Listen for zkawi:open_chat event (dispatched by SelectionTooltip)
  useEffect(() => {
    if (!mounted) return;
    const open = () => setChatOpen(true);
    window.addEventListener('zkawi:open_chat', open);
    return () => window.removeEventListener('zkawi:open_chat', open);
  }, [mounted]);

  useEffect(() => {
    if (!mounted || hide) return;

    activeRef.current = true;
    clearTimeout(timerRef.current);

    const routeKey = getRouteKey(pathname);

    // Small screens: fixed corner position
    if (isSmall) {
      setPos({ x: 80, y: 76 });
      setMood("happy");
      currentPosRef.current = { x: 80, y: 76 };
      return () => { activeRef.current = false; clearTimeout(timerRef.current); };
    }

    // Build a shuffled deck — reshuffle when all 20 visited
    let deck = shuffleArray(WAYPOINT_POOL);
    let deckIdx = 0;

    function nextWaypoint(): Waypoint {
      if (deckIdx >= deck.length) {
        deck = shuffleArray(WAYPOINT_POOL);
        deckIdx = 0;
      }
      return deck[deckIdx++];
    }

    // Recursive patrol loop — picks next random waypoint each time
    function runLoop() {
      if (!activeRef.current || chatOpenRef.current) return;

      const wp = nextWaypoint();

      // Walk to waypoint
      const dx = wp.x - currentPosRef.current.x;
      const dy = wp.y - currentPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const durSec = Math.max(0.6, dist * 0.022);

      setFacingLeft(dx < 0);
      setIsWalking(true);
      setMood("idle");
      setBubbleOpen(false);
      setWalkDuration(durSec);
      setPos({ x: wp.x, y: wp.y });
      currentPosRef.current = { x: wp.x, y: wp.y };

      // After arriving: stand + optional bubble
      timerRef.current = setTimeout(() => {
        if (!activeRef.current) return;
        setIsWalking(false);
        setMood(wp.mood);

        if (wp.message) {
          setBubbleMsg(wp.message);
          setBubbleOpen(true);
        } else {
          setBubbleOpen(false);
        }

        // Stay at waypoint, then move on
        timerRef.current = setTimeout(() => {
          if (!activeRef.current) return;
          setBubbleOpen(false);
          timerRef.current = setTimeout(runLoop, 300);
        }, wp.stayMs);
      }, durSec * 1000 + 50);
    }

    // Walk to a random starting waypoint, then begin loop
    const startWp = nextWaypoint();
    const dx0 = startWp.x - currentPosRef.current.x;
    const dy0 = startWp.y - currentPosRef.current.y;
    const dist0 = Math.sqrt(dx0 * dx0 + dy0 * dy0);
    const dur0 = Math.max(0.6, dist0 * 0.022);

    setFacingLeft(dx0 < 0);
    setIsWalking(true);
    setMood("idle");
    setWalkDuration(dur0);
    setPos({ x: startWp.x, y: startWp.y });
    currentPosRef.current = { x: startWp.x, y: startWp.y };

    timerRef.current = setTimeout(() => {
      if (!activeRef.current) return;
      setIsWalking(false);
      setMood("happy");
      fetchAiBubble(routeKey);
      timerRef.current = setTimeout(runLoop, 800);
    }, dur0 * 1000 + 50);

    return () => {
      activeRef.current = false;
      clearTimeout(timerRef.current);
      aiBubbleAbortRef.current?.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, mounted, hide, isSmall, fetchAiBubble, patrolKey]);

  if (!mounted || hide) return null;

  const toggleChat = () => {
    setBubbleOpen(false);
    setChatOpen((prev) => !prev);
  };
  return (
    <>
      <motion.div
        data-mascot="true"
        className="fixed z-40"
        style={{ width: 140, height: 180 }}
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
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
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
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: 60, height: 10, background: "rgba(109,40,217,0.25)", filter: "blur(8px)" }}
          />
          <XbotExpressive mood={mood} walking={isWalking} facingLeft={facingLeft} width={140} height={180} />

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

      {/* RPG dialogue box — slides up from bottom when chat is open */}
      <MascotDialogue isOpen={chatOpen} onClose={() => setChatOpen(false)} locale={locale} />
    </>
  );
}
