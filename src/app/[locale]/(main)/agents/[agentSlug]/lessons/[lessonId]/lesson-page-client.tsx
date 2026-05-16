"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import QuizComponent from "@/components/quiz/quiz-component";
import LessonContent from "@/components/lesson/lesson-content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDir } from "@/lib/i18n/locale-utils";
import type { LessonFull } from "@/lib/db/queries/content";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap,
  CheckCircle2,
  BookOpen,
  Trophy,
  Target,
  PartyPopper,
  LogIn,
} from "lucide-react";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { ProgressService } from "@/lib/api/services/progress.service";

const GUEST_PROGRESS_KEY = "zkawi_guest_progress";

interface UserProgress {
  completedLessons: string[];
  totalXp: number;
  streakDays: number;
  quizzesCompleted: number;
  scores: Record<string, number>;
}

type LessonView = "content" | "quiz" | "completed";

interface Props {
  lesson: LessonFull;
  allLessonsCount: number;
  currentIndex: number;
  nextLessonId: string | null;
  locale: string;
  agentSlug: string;
  initialProgress: UserProgress | null;
  /** Guest visitor — progress saved to localStorage, no API calls */
  isGuest?: boolean;
  /** Override back button URL — defaults to /agents/${agentSlug} */
  backHref?: string;
  /** Override base path for lesson links — defaults to /agents/${agentSlug}/lessons */
  lessonBasePath?: string;
}

function dispatchMascotEvent(name: string, detail?: Record<string, unknown>) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export default function LessonPageClient({
  lesson,
  allLessonsCount,
  currentIndex,
  nextLessonId,
  locale,
  agentSlug,
  initialProgress,
  isGuest = false,
  backHref,
  lessonBasePath,
}: Props) {
  const resolvedBackHref = backHref ?? `/agents/${agentSlug}`;
  const resolvedLessonBase = lessonBasePath ?? `/agents/${agentSlug}/lessons`;
  const t = useTranslations("lessons");

  const [view, setView] = useState<LessonView>("content");
  const [quizKey, setQuizKey] = useState(0);
  const [progress, setProgress] = useState<UserProgress>(() => {
    if (initialProgress) return initialProgress;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(GUEST_PROGRESS_KEY);
        if (stored) return JSON.parse(stored) as UserProgress;
      } catch {
        /* ignore */
      }
    }
    return {
      completedLessons: [],
      totalXp: 0,
      streakDays: 0,
      quizzesCompleted: 0,
      scores: {},
    };
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [xpPopup, setXpPopup] = useState<number | null>(null);
  const [earnedAchievements, setEarnedAchievements] = useState<
    { id: number; icon: string; name: string }[]
  >([]);
  const [showGuestSavePrompt, setShowGuestSavePrompt] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Dispatch lesson_start event for mascot
  useEffect(() => {
    dispatchMascotEvent("zkawi:lesson_start", {
      lessonTitle: lesson.title,
      locale,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const el = contentRef.current;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setScrollProgress(total > 0 ? (scrolled / total) * 100 : 100);
    };
    const el = contentRef.current;
    el?.addEventListener("scroll", handleScroll);
    return () => el?.removeEventListener("scroll", handleScroll);
  }, []);

  const saveGuestProgress = useCallback((updated: UserProgress) => {
    try {
      localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  }, []);

  const isAlreadyCompleted = progress.completedLessons.includes(lesson.id);

  const handleQuizComplete = async (score: number, xpEarned: number) => {
    const isNew = !progress.completedLessons.includes(lesson.id);
    const updated: UserProgress = {
      ...progress,
      completedLessons: isNew
        ? [...progress.completedLessons, lesson.id]
        : progress.completedLessons,
      totalXp: isNew ? progress.totalXp + xpEarned : progress.totalXp,
      quizzesCompleted: isNew
        ? progress.quizzesCompleted + 1
        : progress.quizzesCompleted,
      scores: { ...progress.scores, [lesson.id]: score },
    };
    setProgress(updated);

    dispatchMascotEvent("zkawi:quiz_complete", {
      score,
      xpEarned,
      lessonTitle: lesson.title,
    });

    if (isGuest) {
      saveGuestProgress(updated);
      setXpPopup(xpEarned);
      setTimeout(() => setXpPopup(null), 2500);
      setView("completed");
      setTimeout(() => setShowGuestSavePrompt(true), 1200);
    } else {
      try {
        const data = await ProgressService.completeLesson(lesson.id, score);
        if (data.NewAchievements?.length) {
          setEarnedAchievements(
            data.NewAchievements.map((a) => ({
              id: 0,
              icon: a.Icon,
              name: a.Name,
            })),
          );
        }
      } catch {
        // lesson still shows completed locally even if server call fails
      }
      setXpPopup(xpEarned);
      setTimeout(() => setXpPopup(null), 2500);
      setView("completed");
    }

    dispatchMascotEvent("zkawi:lesson_complete", {
      lessonTitle: lesson.title,
      score,
      xpEarned,
    });
  };

  const handleRetry = () => {
    setQuizKey((prev) => prev + 1);
    setView("quiz");
  };

  return (
    <main className="flex-1">
      {/* XP popup */}
      <AnimatePresence>
        {xpPopup !== null && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed bottom-8 start-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-pink-600 to-indigo-600 text-white rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3 font-black"
          >
            <Zap size={20} fill="white" />
            <span>
              +{xpPopup} XP {t("xpEarned")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement celebration modal */}
      <AnimatePresence>
        {earnedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setEarnedAchievements([])}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl"
              style={{
                background: "var(--surface)",
                border: "2px solid var(--zkawi-pink)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 0.6 }}
                className="flex justify-center mb-4 text-[var(--zkawi-gold)]"
              >
                <DynamicIcon name={earnedAchievements[0].icon} size={72} />
              </motion.div>
              <div
                className="flex items-center gap-1.5 text-xs font-bold mb-2 px-3 py-1 rounded-full inline-flex"
                style={{ background: "var(--zkawi-pink)", color: "#fff" }}
              >
                <Trophy size={12} />
                {t("newAchievement")}
              </div>
              <h3
                className="text-xl font-black mt-3"
                style={{ color: "var(--text)" }}
              >
                {earnedAchievements[0].name}
              </h3>
              {earnedAchievements.length > 1 && (
                <p
                  className="text-sm mt-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t("moreAchievements", {
                    count: earnedAchievements.length - 1,
                  })}
                </p>
              )}
              <button
                onClick={() => setEarnedAchievements([])}
                className="mt-6 w-full py-3 rounded-2xl font-bold text-sm"
                style={{ background: "var(--zkawi-pink)", color: "#fff" }}
              >
                {t("awesome")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top progress bar */}
      <div className="h-1 bg-[var(--border)]">
        <motion.div
          className="h-full bg-gradient-to-r from-pink-500 to-amber-400"
          style={{
            width: `${view === "content" ? scrollProgress : view === "quiz" ? 70 : 100}%`,
          }}
        />
      </div>

      {/* Lesson header */}
      <div className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href={resolvedBackHref}>
              <button className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--zkawi-pink)] transition-colors font-medium">
                <ChevronLeft size={16} className="flip-rtl" />
                {t("backToAgent")}
              </button>
            </Link>

            <div className="flex-1 text-center">
              <span className="text-sm font-bold text-[var(--text-muted)]">
                {t("lesson")} {currentIndex + 1} {t("of")} {allLessonsCount}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                {lesson.estimatedMinutes} {t("minutes")}
              </div>
              <div className="flex items-center gap-1 text-[var(--zkawi-pink)] font-bold">
                <Zap size={12} fill="currentColor" />
                {lesson.xpReward} XP
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Lesson title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-[var(--zkawi-pink)]/15 rounded-2xl flex items-center justify-center text-[var(--zkawi-pink)]">
              <BookOpen size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isAlreadyCompleted && (
                  <Badge variant="success">
                    <CheckCircle2 size={12} />
                    {t("completed")}
                  </Badge>
                )}
                <Badge variant="default" className="flex items-center gap-1">
                  {view === "content" ? (
                    <>
                      <BookOpen size={11} />
                      {t("badgeReading")}
                    </>
                  ) : view === "quiz" ? (
                    <>
                      <Target size={11} />
                      {t("badgeQuiz")}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={11} />
                      {t("badgeCompleted")}
                    </>
                  )}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[var(--text)]">
                {lesson.title}
              </h1>
              <p className="text-[var(--text-muted)] text-sm mt-1">
                {lesson.description}
              </p>
            </div>
          </div>

          {/* View tabs */}
          <div className="flex items-center gap-2 p-1 bg-[var(--surface-2)] rounded-2xl w-fit">
            {(["content", "quiz"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  view === v
                    ? "bg-[var(--surface)] text-[var(--zkawi-pink)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {v === "content" ? (
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={13} />
                    {t("tabLesson")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Target size={13} />
                    {t("tabQuiz")}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content view */}
        <AnimatePresence mode="wait">
          {view === "content" && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div
                ref={contentRef}
                className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm p-6 md:p-8 max-h-[60vh] overflow-y-auto"
              >
                <LessonContent
                  content={lesson.content}
                  direction={getDir(locale)}
                />
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                  <BookOpen size={14} />
                  {t("readProgress", { percent: Math.round(scrollProgress) })}
                </div>
                <Button onClick={() => setView("quiz")} className="gap-2">
                  <Target size={16} />
                  {t("startQuiz")}
                  <ChevronRight size={16} className="flip-rtl" />
                </Button>
              </div>
            </motion.div>
          )}

          {view === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm p-6 md:p-8">
                <QuizComponent
                  key={quizKey}
                  questions={lesson.questions}
                  xpReward={lesson.xpReward}
                  onComplete={handleQuizComplete}
                  onRetry={handleRetry}
                />
              </div>
            </motion.div>
          )}

          {view === "completed" && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="bg-[var(--surface)] rounded-3xl border border-[var(--zkawi-green)]/30 shadow-sm p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="flex justify-center mb-4 text-[var(--zkawi-gold)]"
                >
                  <PartyPopper size={64} />
                </motion.div>
                <h2 className="text-2xl font-black text-[var(--text)] mb-2">
                  {t("lessonCompletedTitle")}
                </h2>
                <p className="text-[var(--text-muted)] mb-6">
                  {t("lessonCompletedDesc", { title: lesson.title })}
                </p>

                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="bg-[var(--zkawi-pink)]/10 border border-[var(--zkawi-pink)]/30 rounded-2xl p-4 text-center">
                    <div className="flex items-center gap-1 justify-center text-[var(--zkawi-pink)] font-black text-xl">
                      <Zap size={18} fill="currentColor" />+
                      {progress.scores[lesson.id] >= 80
                        ? lesson.xpReward
                        : Math.round(
                            (lesson.xpReward *
                              (progress.scores[lesson.id] || 0)) /
                              100,
                          )}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                      {t("xpEarnedLabel")}
                    </div>
                  </div>
                  {progress.scores[lesson.id] !== undefined && (
                    <div className="bg-[var(--zkawi-green)]/10 border border-[var(--zkawi-green)]/30 rounded-2xl p-4 text-center">
                      <div className="text-[var(--zkawi-green)] font-black text-xl">
                        {progress.scores[lesson.id]}%
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">
                        {t("quizScore")}
                      </div>
                    </div>
                  )}
                </div>

                {earnedAchievements.length > 0 && (
                  <div
                    className="mb-6 p-4 rounded-2xl"
                    style={{
                      background: "var(--zkawi-pink)/10",
                      border: "1px solid var(--zkawi-pink)/30",
                    }}
                  >
                    <p
                      className="flex items-center justify-center gap-1.5 text-sm font-bold mb-3"
                      style={{ color: "var(--zkawi-pink)" }}
                    >
                      <Trophy size={14} />
                      {t("achievementsUnlocked")}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {earnedAchievements.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold"
                          style={{
                            background: "var(--surface-2)",
                            color: "var(--text)",
                          }}
                        >
                          <DynamicIcon name={a.icon} size={16} />
                          <span>{a.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Guest save-progress prompt */}
                <AnimatePresence>
                  {isGuest && showGuestSavePrompt && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-6 rounded-2xl p-4 flex items-center gap-4"
                      style={{
                        background: "var(--zkawi-pink)/10",
                        border: "1px solid var(--zkawi-pink)/30",
                      }}
                    >
                      <LogIn
                        size={20}
                        style={{ color: "var(--zkawi-pink)", flexShrink: 0 }}
                      />
                      <div className="flex-1 text-start">
                        <p
                          className="font-black text-sm"
                          style={{ color: "var(--text)" }}
                        >
                          {t("guestSaveTitle")}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {t("guestSaveSubtitle")}
                        </p>
                      </div>
                      <Link href="/register">
                        <Button size="sm" className="shrink-0">
                          {t("guestSaveCta")}
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setView("content")}
                    className="gap-2"
                  >
                    <BookOpen size={16} />
                    {t("reviewLesson")}
                  </Button>
                  {nextLessonId ? (
                    <Link href={`${resolvedLessonBase}/${nextLessonId}`}>
                      <Button className="gap-2">
                        {t("nextLesson")}
                        <ChevronRight size={16} className="flip-rtl" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={resolvedBackHref}>
                      <Button className="gap-2">
                        <Trophy size={16} />
                        {t("viewAllLessons")}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
