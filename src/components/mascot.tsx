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
      setMood("happy");
      setAiBubble("");
      setBubbleOpen(false);
      // Walk mascot to a position near the bottom-right (beside dialogue box)
      const targetX = 87;
      const targetY = 62;
      const dx = targetX - currentPosRef.current.x;
      const dy = targetY - currentPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const dur = Math.max(0.3, dist * 0.018);
      setFacingLeft(true);
      setIsWalking(dist > 4);
      setWalkDuration(dur);
      setPos({ x: targetX, y: targetY });
      currentPosRef.current = { x: targetX, y: targetY };
      setTimeout(() => { setIsWalking(false); setMood("happy"); }, dur * 1000 + 50);
    } else {
      // Resume patrol after a short delay
      const resume = setTimeout(() => {
        if (!chatOpenRef.current) setPatrolKey((k) => k + 1);
      }, 700);
      return () => clearTimeout(resume);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen]);

  // Word click: detect text clicks anywhere on the page, explain via mascot
  useEffect(() => {
    if (!mounted) return;

    const handleClick = (e: MouseEvent) => {
      // Skip if on interactive UI elements
      const target = e.target as HTMLElement;
      if (target.closest('[data-mascot], button, a, input, select, textarea, [role="button"], [role="dialog"]')) return;

      // Cooldown check — 5 seconds between clicks
      const now = Date.now();
      if (now - lastWordClickRef.current < 5000) return;

      // Get text at click position
      let range: Range | null = null;
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(e.clientX, e.clientY);
      } else {
        const pos = (document as unknown as { caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null }).caretPositionFromPoint?.(e.clientX, e.clientY);
        if (pos) {
          range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.collapse(true);
        }
      }

      if (!range) return;
      const node = range.startContainer;
      if (node.nodeType !== Node.TEXT_NODE) return;

      const text = node.textContent ?? '';
      if (!text.trim() || text.trim().length < 5) return;

      // Extract word without range.expand (cross-browser safe)
      const offset = range.startOffset;
      let start = offset, end = offset;
      while (start > 0 && /\S/.test(text[start - 1])) start--;
      while (end < text.length && /\S/.test(text[end])) end++;
      const word = text.slice(start, end).trim();
      if (!word || word.length < 2) return;

      // Get surrounding sentence from parent block element
      const blockEl = target.closest('p, li, h1, h2, h3, blockquote, td');
      const sentence = (blockEl?.textContent ?? text).trim().slice(0, 300);
      if (sentence.length < 5) return;

      lastWordClickRef.current = now;
      // Open chat and auto-send explanation request
      setChatOpen(true);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('zkawi:auto_send', {
          detail: {
            message: locale === 'ar'
              ? `اشرح لي بأسلوب بسيط للأطفال: "${sentence}"`
              : `Explain this to me in simple terms for kids: "${sentence}"`,
          },
        }));
      }, 200);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [mounted, locale]);

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
      if (!activeRef.current || chatOpenRef.current) return;

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

          const newFacingLeft = dx < 0;
          console.log('[Mascot walk]', {
            from: currentPosRef.current,
            to: { x: next.x, y: next.y },
            dist: dist.toFixed(1),
            durSec: durSec.toFixed(2),
            facingLeft: newFacingLeft,
          });

          setFacingLeft(newFacingLeft);
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

    console.log('[Mascot init walk]', {
      from: currentPosRef.current,
      to: { x: firstWp.x, y: firstWp.y },
      dist0: dist0.toFixed(1),
      dur0: dur0.toFixed(2),
      isJump: dist0 <= 3,
    });

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
