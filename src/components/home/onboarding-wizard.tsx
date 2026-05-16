"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { getDir } from "@/lib/i18n/locale-utils";
import { Clock, Zap, Coffee, Flame, ChevronRight, X } from "lucide-react";

const GUEST_PREFS_KEY = "zkawi_guest_prefs";
const ONBOARDED_KEY = "zkawi_onboarded";

export interface GuestPrefs {
  interest: string;
  time: string;
}

// Must match subject slugs / name keywords in the DB
type Interest =
  | "programming"
  | "web"
  | "databases"
  | "ai"
  | "logic"
  | "projects";
type Time = "5" | "15" | "30" | "60";

interface Props {
  locale: string;
}

const INTEREST_EMOJIS: Record<Interest, string> = {
  programming: "💻",
  web: "🌐",
  databases: "🗄️",
  ai: "🤖",
  logic: "🧩",
  projects: "🚀",
};

const TIME_ICONS: Record<Time, React.ReactNode> = {
  "5": <Zap size={22} />,
  "15": <Coffee size={22} />,
  "30": <Clock size={22} />,
  "60": <Flame size={22} />,
};

export default function OnboardingWizard({ locale }: Props) {
  const t = useTranslations("onboarding");
  const dir = getDir(locale);
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [interest, setInterest] = useState<Interest | null>(null);
  const [time, setTime] = useState<Time | null>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem(ONBOARDED_KEY)) setShow(true);
    } catch {
      /* SSR */
    }
  }, []);

  const finish = (finalTime: Time) => {
    try {
      const prefs: GuestPrefs = {
        interest: interest ?? "programming",
        time: finalTime,
      };
      localStorage.setItem(GUEST_PREFS_KEY, JSON.stringify(prefs));
      localStorage.setItem(ONBOARDED_KEY, "1");
    } catch {
      /* quota */
    }
    setShow(false);
  };

  const skip = () => {
    try {
      localStorage.setItem(ONBOARDED_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!show) return null;

  const interests: Interest[] = [
    "programming",
    "web",
    "databases",
    "ai",
    "logic",
    "projects",
  ];
  const times: Time[] = ["5", "15", "30", "60"];
  const timeKey: Record<Time, string> = {
    "5": "min5",
    "15": "min15",
    "30": "min30",
    "60": "min60",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
        dir={dir}
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 20, stiffness: 260 }}
          className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Skip */}
          <button
            onClick={skip}
            className="absolute top-4 end-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold opacity-50 hover:opacity-100 transition-opacity"
            style={{
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            <X size={12} />
            {t("skip")}
          </button>

          {/* Progress */}
          <div className="flex gap-2 justify-center mb-7">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 28 : 8,
                  height: 8,
                  background: i <= step ? "var(--zkawi-pink)" : "var(--border)",
                }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── Step 0: Interest ── */}
            {step === 0 && (
              <motion.div
                key="step-interest"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: "var(--zkawi-pink)" }}
                  >
                    🤖
                  </div>
                  <div>
                    <h2
                      className="text-lg font-black leading-snug"
                      style={{ color: "var(--text)" }}
                    >
                      {t("guestWelcome")}
                    </h2>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {t("steps.interests.subtitle")}
                    </p>
                  </div>
                </div>

                <p
                  className="font-bold text-sm mb-3"
                  style={{ color: "var(--text)" }}
                >
                  {t("steps.interests.title")}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {interests.map((it) => (
                    <button
                      key={it}
                      onClick={() => {
                        setInterest(it);
                        setStep(1);
                      }}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all"
                      style={{
                        borderColor:
                          interest === it
                            ? "var(--zkawi-pink)"
                            : "var(--border)",
                        background:
                          interest === it
                            ? "var(--zkawi-pink)/10"
                            : "var(--bg)",
                      }}
                    >
                      <span className="text-2xl">{INTEREST_EMOJIS[it]}</span>
                      <p
                        className="font-bold text-xs text-center leading-tight"
                        style={{ color: "var(--text)" }}
                      >
                        {t(`steps.interests.${it}`)}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Step 1: Time ── */}
            {step === 1 && (
              <motion.div
                key="step-time"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
              >
                <p
                  className="font-black text-xl mb-1"
                  style={{ color: "var(--text)" }}
                >
                  {t("steps.time.title")}
                </p>
                <p
                  className="text-sm mb-5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t("steps.time.subtitle")}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {times.map((tv) => (
                    <button
                      key={tv}
                      onClick={() => {
                        setTime(tv);
                        finish(tv);
                      }}
                      className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all"
                      style={{
                        borderColor:
                          time === tv ? "var(--zkawi-pink)" : "var(--border)",
                        background:
                          time === tv ? "var(--zkawi-pink)/10" : "var(--bg)",
                      }}
                    >
                      <span style={{ color: "var(--zkawi-pink)" }}>
                        {TIME_ICONS[tv]}
                      </span>
                      <p
                        className="font-black text-sm"
                        style={{ color: "var(--text)" }}
                      >
                        {t(`steps.time.${timeKey[tv]}`)}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {t(`steps.time.${timeKey[tv]}Desc`)}
                      </p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setStep(0)}
                  className="mt-4 text-xs flex items-center gap-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  <ChevronRight size={12} className="flip-rtl rotate-180" />
                  {t("prev")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
