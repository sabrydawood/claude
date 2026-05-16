"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, BookOpen, Clock, Construction } from "lucide-react";
import type { SubjectRow, CourseRow } from "@/lib/db/queries/content";

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "var(--zkawi-green)",
  2: "var(--zkawi-gold)",
  3: "var(--zkawi-red, #ef4444)",
};

interface Props {
  subject: SubjectRow;
  courses: CourseRow[];
  locale: string;
}

export default function SubjectDetailClient({
  subject,
  courses,
  locale: _locale,
}: Props) {
  const t = useTranslations("subjects");
  const tC = useTranslations("courses");

  return (
    <main className="flex-1">
      {/* Hero */}
      <div
        className="py-12 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${subject.color}20 0%, ${subject.color}08 100%)`,
          borderBottom: `1px solid ${subject.color}20`,
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/subjects">
            <div className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] mb-6 text-sm font-medium transition-colors">
              <ChevronLeft size={16} className="flip-rtl" />
              {tC("back")}
            </div>
          </Link>

          <div className="flex items-start gap-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: subject.color + "20", color: subject.color }}
            >
              <DynamicIcon name={subject.icon} size={40} />
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl md:text-4xl font-black text-[var(--text)] mb-2"
              >
                {subject.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-[var(--text-muted)] max-w-xl leading-relaxed"
              >
                {subject.description}
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-3"
              >
                <Badge
                  className="text-xs font-bold"
                  style={{
                    background: subject.color + "20",
                    color: subject.color,
                    border: `1px solid ${subject.color}30`,
                  }}
                >
                  {courses.length} {t("allCourses")}
                </Badge>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {courses.length === 0 ? (
          <div className="text-center py-16">
            <Construction
              size={52}
              className="mx-auto mb-4 text-[var(--text-muted)]"
            />
            <p className="text-[var(--text-muted)]">{t("noCourses")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {courses.map((course, i) => {
              const difficultyColor =
                DIFFICULTY_COLORS[course.difficulty] ?? DIFFICULTY_COLORS[1];
              const difficultyKey = course.difficulty.toString() as
                | "1"
                | "2"
                | "3";
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="bg-[var(--surface)] rounded-3xl border-2 border-[var(--border)] p-5 hover:border-[var(--zkawi-pink)]/40 hover:shadow-lg hover:shadow-[var(--zkawi-pink)]/5 transition-all"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-lg text-[var(--text)] mb-1 leading-tight">
                        {course.name}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span
                      className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: difficultyColor + "18",
                        color: difficultyColor,
                        border: `1px solid ${difficultyColor}30`,
                      }}
                    >
                      {t(`difficulty.${difficultyKey}`)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] bg-[var(--surface-2)] px-2.5 py-1 rounded-full border border-[var(--border)]">
                      <Clock size={11} />
                      {course.estimatedHours} {t("hours")}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] bg-[var(--surface-2)] px-2.5 py-1 rounded-full border border-[var(--border)]">
                      <BookOpen size={11} />
                      {course.lessonCount} {tC("lessons")}
                    </span>
                  </div>

                  <Link href={`/courses/${course.id}`}>
                    <Button size="sm" className="w-full">
                      {tC("start")}
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
